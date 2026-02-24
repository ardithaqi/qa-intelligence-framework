import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeLatestFailure() {
    const failureDir = path.join("artifacts", "failures");

    if (!fs.existsSync(failureDir)) {
        console.log("No failure artifacts found.");
        return;
    }

    const files = fs.readdirSync(failureDir)
        .filter(f => f.endsWith(".json"))
        .sort((a, b) =>
            fs.statSync(path.join(failureDir, b)).mtime.getTime() -
            fs.statSync(path.join(failureDir, a)).mtime.getTime()
        );

    if (files.length === 0) {
        console.log("No failure JSON files found.");
        return;
    }

    const latestJson = files[0];
    const jsonPath = path.join(failureDir, latestJson);
    const htmlPath = jsonPath.replace(".json", ".html");

    const meta = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const html = fs.existsSync(htmlPath)
        ? fs.readFileSync(htmlPath, "utf-8")
        : "";

    const prompt = `
        You are a senior QA automation engineer analyzing a failed Playwright test.
        
        Here is the failure metadata:
        ${JSON.stringify(meta, null, 2)}
        
        The test failed due to this error:
        ${meta.errorMessage}
        
        Important:
        - If the failure is a direct assertion mismatch (like 1 !== 2), do not assume DOM issues.
        - Only reference the DOM if the failure relates to missing elements or selectors.
        - Do not hallucinate selectors or login issues unless clearly supported.
        
        DOM snapshot (first 8000 chars):
        ${html.substring(0, 8000)}
        
        Provide:
        1. Clear root cause explanation based strictly on evidence
        2. Whether this is logic failure or UI failure
        3. Practical next debugging step
        `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content ?? null;
}