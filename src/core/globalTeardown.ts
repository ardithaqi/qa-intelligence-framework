import fs from "fs";
import path from "path";
import { analyzeLatestFailure } from "../ai/failureAnalyzer";

export default async function globalTeardown() {
    if (process.env.AI_ANALYSIS !== "true") return;

    const failureDir = path.join("artifacts", "failures");

    if (!fs.existsSync(failureDir)) return;

    const jsonFiles = fs
        .readdirSync(failureDir)
        .filter((f) => f.endsWith(".json"));

    if (jsonFiles.length === 0) return;

    console.log("\nRunning AI failure analysis...\n");

    const analysis = await analyzeLatestFailure();

    if (!analysis) return;

    console.log("=== AI Analysis ===\n");
    console.log(analysis);
    console.log("\n===================\n");

    const outputPath = path.join(failureDir, "failure.ai.txt");
    fs.writeFileSync(outputPath, analysis);

    console.log(`AI analysis saved to: ${outputPath}\n`);
}