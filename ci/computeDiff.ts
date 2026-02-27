import fs from "fs";
import path from "path";

interface Failure {
    file: string;
    line: number;
    failure_type: string;
    severity: string;
    confidence: number;
}

function collectFailures(root: string): Failure[] {
    const failures: Failure[] = [];
    if (!fs.existsSync(root)) return failures;

    function walk(dir: string) {
        for (const file of fs.readdirSync(dir)) {
            const full = path.join(dir, file);
            if (fs.statSync(full).isDirectory()) {
                walk(full);
            } else if (file === "ai.txt") {
                const content = fs.readFileSync(full, "utf8");
                const jsonStart = content.indexOf("{");
                if (jsonStart === -1) continue;

                const data = JSON.parse(content.substring(jsonStart));
                failures.push({
                    file: data.file,
                    line: data.line,
                    failure_type: data.failure_type,
                    severity: data.severity,
                    confidence: data.confidence
                });
            }
        }
    }

    walk(root);
    return failures;
}

function toMap(arr: Failure[]) {
    const map = new Map<string, Failure>();
    for (const item of arr) {
        const key = `${item.file}:${item.line}:${item.failure_type}`;
        map.set(key, item);
    }
    return map;
}

const baseline = collectFailures("baseline-artifacts");
const current = collectFailures("artifacts");

const baselineMap = toMap(baseline);
const currentMap = toMap(current);

const newFailures: Failure[] = [];
const unchangedFailures: Failure[] = [];
const fixedFailures: Failure[] = [];

for (const [key, value] of currentMap.entries()) {
    if (!baselineMap.has(key)) newFailures.push(value);
    else unchangedFailures.push(value);
}

for (const [key, value] of baselineMap.entries()) {
    if (!currentMap.has(key)) fixedFailures.push(value);
}

const result = {
    newFailures,
    unchangedFailures,
    fixedFailures
};

fs.writeFileSync("failure-diff.json", JSON.stringify(result, null, 2));
console.log("Diff result:", result);

if (newFailures.length > 0) {
    console.log(`New failures detected: ${newFailures.length}`);
    process.exit(1);
}