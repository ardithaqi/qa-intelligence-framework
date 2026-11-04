# QA Intelligence Framework

Production-ready Playwright framework with:

- Dockerized test execution
- A release verdict on every PR: SAFE TO MERGE, REVIEW REQUIRED or BLOCK ([AI Release Guardian](https://github.com/ardithaqi/qa-intelligence))
- AI-powered failure analysis (optional)
- Flaky test detection
- CI baseline comparison
- Ask your AI assistant "why is my PR blocked?" (MCP server for Claude Code and Cursor)

This repository is designed to be used as:

1) A **GitHub Template** for new automation projects  
2) A reference for wiring CI, Docker, and example tests  

**Already have a Playwright project?** Install the engine as a package instead — no need to copy this repo:

→ **[qa-intelligence on npm](https://www.npmjs.com/package/qa-intelligence)**  


## Features

- Playwright (TypeScript)
- Docker-first execution
- GitHub Actions CI
- AI failure root cause analysis (optional)
- Baseline diff vs target branch
- Release verdict, risk score and PR comment
- Flaky detection (retry-aware)
- Merge gate: CI fails on BLOCK and REVIEW REQUIRED
- MCP server for AI assistants


## Project Structure

```
├── src/
│   ├── examples/        # demo page objects (SauceDemo)
│   ├── pages/           # your page objects go here
│   └── utils/           # optional helpers
├── tests/
│   ├── examples/
│   │   └── saucedemo/
│   ├── regression/
│   ├── smoke/
│   └── your-tests-here/
├── Dockerfile
├── playwright.config.ts # hooks + env from qa-intelligence npm package
└── .github/workflows/ci.yml
```

The **intelligence engine** (hooks, AI analysis, diff, history, PR comments) lives in the [`qa-intelligence`](https://www.npmjs.com/package/qa-intelligence) npm package — not as copied files in this repo.


## Writing Tests

### Basic Test Example

```ts
import { test, expect } from "qa-intelligence/playwright";
import { step } from "qa-intelligence/playwright/steps";

test("user can login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Swag Labs/);
});
```

**Important**

Use:

```ts
import { test, expect } from "qa-intelligence/playwright";
```

Not directly from Playwright.

This enables:

- AI failure analysis
- Artifact generation
- Flaky detection
- CI diff intelligence

## Environment Configuration

The framework reads environment variables via `.env`. For CI runs, the same variables (including `BASE_URL`) are set in **`.github/workflows/ci.yml`**—update that file if you use a different app URL.

Example:

```env
BASE_URL=https://www.saucedemo.com
HEADLESS=true
PW_WORKERS=2
PW_RETRIES=1
```


## Running Tests

**Local (without Docker)**

```bash
npm install
npx playwright install
npm run test:examples   # or test:smoke, test:regression, test:all
```

**Local (Docker, recommended)**

```bash
docker build -t qa-framework .
docker run qa-framework
```


## Creating Your Own Tests

**Tests** go in `tests/`. **Page objects** go in `src/pages/` (or `src/examples/` for demos).

Recommended structure:

```
tests/
  feature-name/
    feature.spec.ts
src/
  pages/
    loginPage.ts
    checkoutPage.ts
```

Example:

- `tests/auth/login.spec.ts` → import from `src/pages/loginPage.ts`
- `tests/examples/saucedemo/login.spec.ts` → import from `src/examples/saucedemo/pages/loginPage.ts`


## AI Failure Analysis

When a test fails:

- `meta.json` is generated
- AI analyzes failure
- `ai.txt` is produced
- Artifacts are stored under: `artifacts/run-<timestamp>/`

Set `AI_ANALYSIS=true` and an API key to enable analysis locally. CI sets `AI_ANALYSIS=true` in the workflow; locally you must enable it yourself.

### AI providers

Default provider is **OpenAI** (`gpt-4o-mini`). Configure via env:

| Variable | Purpose |
|----------|---------|
| `AI_PROVIDER` | `openai` (default), `anthropic`, or `openai-compatible` |
| `AI_MODEL` | Model name (provider-specific default if unset) |
| `OPENAI_API_KEY` | API key for OpenAI (or fallback for `openai-compatible`) |
| `ANTHROPIC_API_KEY` | API key for Anthropic |
| `AI_API_KEY` | Generic key fallback for any provider |
| `AI_BASE_URL` | Required for `openai-compatible` (Azure OpenAI, Ollama, LiteLLM, etc.) |

Examples:

```env
# OpenAI (default)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini

# Anthropic (the provider follows whichever key is set; AI_PROVIDER only forces one)
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-haiku-5-5

# OpenAI-compatible (Ollama, Azure, etc.)
AI_PROVIDER=openai-compatible
AI_BASE_URL=http://localhost:11434/v1
AI_API_KEY=ollama
AI_MODEL=llama3
```

The verdict, diff, flaky detection and merge gate work **without AI**: failures are classified from Playwright's error output. With a key, AI adds a root cause and a suggested fix per problem, and names the change in the PR that likely broke the test.


## Flaky Detection

If:
- Test fails on first run
- Passes on retry

It is marked as:
- `is_flaky_suspected: true`
- `severity: low`

Flaky tests:

- Do not block the PR
- Show as SAFE TO MERGE with a yellow note in the PR comment


## CI Failure Intelligence

On Pull Requests, the [AI Release Guardian](https://github.com/ardithaqi/qa-intelligence):

1. Downloads the baseline (results from the target branch) and compares
2. Classifies each new failure: regression, flaky, infrastructure, broken test or unclear
3. Groups failures with the same cause and points to the changed file and commit that likely broke them
4. Scores the risk and decides: **SAFE TO MERGE**, **REVIEW REQUIRED** or **BLOCK**

The PR comment shows the verdict and one line per problem (where, why, likely cause), with details on click. Failures already failing on the target branch and tests the PR fixed are listed separately and never block. A PR with nothing to report gets no comment; the verdict is still in the job summary and the check status.

The job fails on BLOCK and REVIEW REQUIRED (`--fail-on review` in the workflow; use `block` to fail only on BLOCK, or `never` to report only).

**Flaky Watchlist** uses the history cache (last 20 PR runs, repo-wide). A test appears when it showed up in the failure report on at least 2 runs but not every run. Tests already listed as **New Issues** or **Still Failing** on this PR are omitted.


## Required GitHub Secrets

Set in Repository Settings → Secrets:

- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (optional, for AI analysis; see [AI providers](#ai-providers))
- `TEST_USERNAME`
- `TEST_PASSWORD`

Optional repository variables: `AI_PROVIDER`, `AI_MODEL`.


## How CI Works

**On push to main/master:**

- Tests run (or the merged PR's results are reused)
- Results stored as the baseline for the next PRs

**On pull_request:**

- Baseline downloaded and compared
- Release verdict, job summary and PR comment
- Job fails on BLOCK and REVIEW REQUIRED


## AI Assistants (MCP)

`.mcp.json` (Claude Code) and `.cursor/mcp.json` (Cursor) register the `release-guardian` MCP server. When you open the repo, your editor asks once to enable it. Then ask your assistant things like "is my PR safe to merge?" or "why is the checkout test failing?".

| Tool | What it does |
|------|--------------|
| `get_pr_verdict` | The CI verdict for your branch's PR |
| `analyze_local` | A verdict for your local test run, before you push (uncommitted changes included) |
| `explain_problem` | Cause, fix and error for one problem |
| `flaky_tests` | The most unstable tests |
| `failure_history` | How often a test failed and since when |

All tools are read-only. `get_pr_verdict` needs GitHub access: `GITHUB_TOKEN`, or the GitHub CLI signed in (`gh auth login`). Run `npm install` first so the server is installed.


## Converting This Into Your Own Project

### Use this template (new automation project)

For a **standalone** test repo, use this template as-is — everything lives at the repo root and [`.github/workflows/ci.yml`](.github/workflows/ci.yml) works unchanged.

1. Click **Use this template**
2. Clone new repo
3. Set secrets
4. Adjust `BASE_URL` in `.env` and in **`.github/workflows/ci.yml`** (the `docker run` step passes `BASE_URL`; set it to your app URL)
5. Add your tests
6. Push
7. CI handles the rest

---

### Add to an existing project (npm package)

Already have an app repo with its own `package.json`? Install the engine as a package. Only copy two files from this repo: [`Dockerfile`](Dockerfile) and [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

Create a `playwright/` subfolder at the repo root and keep all E2E tooling there, separate from your main app code.

#### Folder layout

```
my-company-app/
├── src/                          # your main app — unchanged
│
└── playwright/
    ├── package.json              # qa-intelligence + @playwright/test
    ├── package-lock.json
    ├── playwright.config.ts
    ├── tsconfig.json
    ├── Dockerfile
    ├── .env                      
    ├── tests/
    │   ├── smoke/
    │   └── regression/
    ├── artifacts/                # generated, gitignored
    └── test-results/             # generated, gitignored
```

You will have **two `package.json` files**. The E2E workflow uses only `playwright/package.json`.

The **Setup** section below defines each file (`tsconfig.json`, `Dockerfile`, `playwright.config.ts`, etc.).

#### Setup

```bash
git checkout -b feat/qa-intelligence

mkdir playwright
cd playwright
npm init -y
npm install qa-intelligence @playwright/test
npx playwright install
```

Peer dependencies (`typescript`, `@types/node`) are installed automatically.

**`playwright/.env`**

```env
BASE_URL=https://your-app.example.com
HEADLESS=true
PW_WORKERS=2
PW_RETRIES=1
```

**`playwright/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node"],
    "skipLibCheck": true
  },
  "include": ["tests/**/*", "playwright.config.ts"]
}
```

> `module` and `moduleResolution` must both be `"Node16"` so TypeScript resolves the package `exports` map.

**`playwright/playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";
import { env } from "qa-intelligence/config/env";

export default defineConfig({
  testDir: "./tests",
  retries: env.PW_RETRIES,
  workers: env.PW_WORKERS,
  globalSetup: require.resolve("qa-intelligence/playwright/globalSetup"),
  globalTeardown: require.resolve("qa-intelligence/playwright/globalTeardown"),
  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    // Test totals for the release verdict
    [require.resolve("qa-intelligence/playwright/reporter")],
  ],
});
```

**`playwright/tests/*.spec.ts`**

```ts
import { test, expect } from "qa-intelligence/playwright";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/My App/);
});
```

Always import `test` from the package, **not** directly from Playwright. This records failures for the release verdict, and enables AI analysis and flaky detection.

**`playwright/Dockerfile`**

Create this file in `playwright/` (same content as [`Dockerfile`](Dockerfile) in this repo):

```dockerfile
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

RUN npx playwright install --with-deps

COPY . .

CMD ["npx", "playwright", "test"]
```

**Run locally**

```bash
cd playwright
npx playwright test
```

**Root `.gitignore`** — add:

```
playwright/node_modules/
playwright/artifacts/
playwright/test-results/
playwright/.env
```

#### CI workflow changes

Copy [`.github/workflows/ci.yml`](.github/workflows/ci.yml) from the root of this repo into your project, then apply these changes for the `playwright/` layout:

1. **Add** under the job (`runs-on`):

```yaml
defaults:
  run:
    working-directory: playwright
```

2. **Update artifact upload paths** (paths are always relative to repo root):

```yaml
path: playwright/playwright-report/   # was playwright-report/
path: playwright/artifacts/           # was artifacts/
```

3. **Update baseline path** in debug + diff steps (baseline stays at repo root):

```yaml
ls -la ../baseline-artifacts          # was baseline-artifacts
npx qa-intelligence-diff --baseline ../baseline-artifacts --current artifacts
```

4. **Remove** the `Install CI intelligence engine` step — `qa-intelligence` is already in `playwright/package.json`.

5. **Update** the failure history cache path (keep the per-run key from this repo's workflow):

```yaml
path: playwright/.cache           # was .cache
```

6. **Update** the release report upload paths:

```yaml
path: |
  playwright/release-report.json   # was release-report.json
  playwright/release-guardian.md   # was release-guardian.md
```

7. Place `Dockerfile` inside `playwright/` (see above). With `working-directory: playwright`, `docker build .` runs against that folder.

Everything else in the workflow stays the same. The root `package.json` is not used by the E2E job.

Shortcut: `npx qa-intelligence init` scaffolds the `playwright/` folder, a ready workflow and the MCP configs in one step (without Docker).

Full engine reference: **[qa-intelligence README](https://github.com/ardithaqi/qa-intelligence)**


## Author

Built as a production-level QA automation starter with intelligent CI capabilities. If you use this template, consider leaving a star or linking back—contributions are welcome.
