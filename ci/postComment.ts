import fs from "fs";
import { Octokit } from "@octokit/rest";

interface Failure {
    file: string;
    line: number;
    failure_type: string;
    severity: string;
    confidence: number;
    is_flaky_suspected?: boolean;
}

interface DiffResult {
    newFailures: Failure[];
    unchangedFailures: Failure[];
    fixedFailures: Failure[];
}

async function main() {
    const token = process.env.GITHUB_TOKEN;
    const repoFull = process.env.GITHUB_REPOSITORY;
    const ref = process.env.GITHUB_REF;

    if (!token) {
        console.error("GITHUB_TOKEN missing");
        process.exit(1);
    }

    if (!repoFull || !ref) {
        console.log("Not running inside GitHub Actions PR context.");
        return;
    }

    const prMatch = ref.match(/refs\/pull\/(\d+)\/merge/);
    if (!prMatch) {
        console.log("Not a pull request run. Skipping comment.");
        return;
    }

    const prNumber = Number(prMatch[1]);

    if (!fs.existsSync("failure-diff.json")) {
        console.log("No failure-diff.json found. Skipping comment.");
        return;
    }

    const diff: DiffResult = JSON.parse(
        fs.readFileSync("failure-diff.json", "utf8")
    );

    const { newFailures, unchangedFailures, fixedFailures } = diff;

    const flaky = newFailures.filter(f => f.is_flaky_suspected);
    const realNewFailures = newFailures.filter(f => !f.is_flaky_suspected);

    if (
        newFailures.length === 0 &&
        unchangedFailures.length === 0 &&
        fixedFailures.length === 0
    ) {
        console.log("No failure changes. Skipping comment.");
        return;
    }

    function formatSection(
        title: string,
        list: Failure[],
        includeSeverity = true
    ) {
        if (list.length === 0) return "";

        let section = `### ${title} (${list.length})\n\n`;

        for (const item of list) {
            const severityPart = includeSeverity
                ? ` | severity: ${item.severity}`
                : "";

            section += `• ${item.file}:${item.line} | ${item.failure_type}${severityPart} | confidence: ${item.confidence}\n`;
        }

        return section + "\n";
    }

    const now = new Date().toISOString();
    const commit = process.env.GITHUB_SHA?.slice(0, 7);

    let body = "## AI Failure Diff Summary\n\n";
    body += `Last updated: ${now}\n`;
    if (commit) body += `Commit: ${commit}\n`;
    body += "\n";
    body += formatSection("New Failures", realNewFailures);
    body += formatSection("Flaky", flaky, false);
    body += formatSection("Still Failing", unchangedFailures);
    body += formatSection("Fixed Failures", fixedFailures);

    const [owner, repo] = repoFull.split("/");

    const octokit = new Octokit({ auth: token });

    const { data: comments } = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: prNumber,
    });

    const existing = comments.find(
        (c) =>
            c.user?.type === "Bot" &&
            typeof c.body === "string" &&
            c.body.startsWith("## AI Failure Diff Summary")
    );

    if (existing) {
        await octokit.issues.updateComment({
            owner,
            repo,
            comment_id: existing.id,
            body,
        });
        console.log("Updated existing AI summary comment.");
    } else {
        await octokit.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body,
        });
        console.log("Created new AI summary comment.");
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});