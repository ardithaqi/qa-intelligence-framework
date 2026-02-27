import fs from "fs";

interface Failure {
    file: string;
    line: number;
    failure_type: string;
    severity: string;
    confidence: number;
}

interface DiffResult {
    newFailures: Failure[];
    unchangedFailures: Failure[];
    fixedFailures: Failure[];
}

module.exports = async ({ github, context }: any) => {
    if (!fs.existsSync("failure-diff.json")) return;

    const diff: DiffResult = JSON.parse(
        fs.readFileSync("failure-diff.json", "utf8")
    );

    const { newFailures, unchangedFailures, fixedFailures } = diff;

    if (
        newFailures.length === 0 &&
        unchangedFailures.length === 0 &&
        fixedFailures.length === 0
    ) {
        return;
    }

    let body = "## AI Failure Diff Summary\n\n";

    function formatList(title: string, list: Failure[]) {
        if (list.length === 0) return "";
        let section = `### ${title} (${list.length})\n\n`;
        for (const item of list) {
            section += `- ${item.file}:${item.line} | ${item.failure_type} | severity: ${item.severity} | confidence: ${item.confidence}\n`;
        }
        return section + "\n";
    }

    body += formatList("New Failures", newFailures);
    body += formatList("Still Failing", unchangedFailures);
    body += formatList("Fixed Failures", fixedFailures);

    const { data: comments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number
    });

    const existing = comments.find(
        (c: any) =>
            c.user.type === "Bot" &&
            typeof c.body === "string" &&
            c.body.startsWith("## AI Failure Diff Summary")
    );

    if (existing) {
        await github.rest.issues.updateComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: existing.id,
            body
        });
    } else {
        await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            body
        });
    }
};