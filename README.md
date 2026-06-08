# QA Intelligence Framework

Production-ready Playwright framework with:

- Dockerized test execution
- AI-powered failure analysis
- PR failure diff intelligence
- Flaky test detection
- CI baseline comparison
- Clean PR summary reporting

This repository is designed to be used as:

1) A **GitHub Template** for new automation projects  
2) A reference for wiring CI, Docker, and example tests  

**Already have a Playwright project?** Install the engine as a package instead — no need to copy this repo:

→ **[qa-intelligence on npm](https://www.npmjs.com/package/qa-intelligence)**  


## Features

- Playwright (TypeScript)
- Docker-first execution
- GitHub Actions CI
- AI failure root cause analysis
- Baseline diff vs target branch
- PR comment intelligence
- Flaky detection (retry-aware)
- CI blocking on new failures


## Project Structure

```
├── src/
│   ├── ai/              # failure analyzer (also in qa-intelligence package)
│   ├── config/          # env.ts
│   ├── core/            # testHooks, baseTest, globalSetup/Teardown
│   ├── examples/        # demo page objects (SauceDemo)
│   ├── pages/           # your page objects go here
│   ├── reporting/
│   └── utils/
├── tests/
│   ├── examples/
│   │   └── saucedemo/
│   ├── regression/
│   ├── smoke/
│   └── your-tests-here/
├── Dockerfile
├── playwright.config.ts
└── .github/workflows/ci.yml
```


## Writing Tests

### Basic Test Example

```ts
import { test, expect } from "../../src/core/baseTest";
import { step } from "../../src/core/steps";

test("user can login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Swag Labs/);
});
```

**Important**

Use:

```ts
import { test, expect } from "../../src/core/baseTest";
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


## Flaky Detection

If:
- Test fails on first run
- Passes on retry

It is marked as:
- `is_flaky_suspected: true`
- `severity: low`

Flaky tests:

- Do not block PR
- Are displayed separately in PR summary


## CI Failure Intelligence

On Pull Requests:

1. Baseline artifacts are downloaded from target branch
2. Current failures are compared
3. PR comment shows:
   - **New Issues**
   - **Flaky**
   - **Still Failing**
   - **Fixed Issues**

Only new real failures block the PR.


## Required GitHub Secrets

Set in Repository Settings → Secrets:

- `OPENAI_API_KEY`
- `TEST_USERNAME`
- `TEST_PASSWORD`


## How CI Works

**On push to main/master:**

- Tests run
- Artifacts stored

**On pull_request:**

- Baseline downloaded
- Diff computed
- Comment posted
- PR blocked if new failures exist


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

Always import `test` from the package — **not** directly from Playwright. This enables AI analysis, artifact generation, flaky detection, and CI diff intelligence.

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

5. **Update** failure history cache path:

```yaml
path: playwright/.cache               # was .cache
```

6. Place `Dockerfile` inside `playwright/` (see above). With `working-directory: playwright`, `docker build .` runs against that folder.

Everything else in the workflow stays the same. The root `package.json` is not used by the E2E job.

Full engine reference: **[qa-intelligence README](https://github.com/ardithaqi/qa-intelligence)**

> **Note:** This template uses local `src/core/` for its example tests. The same logic lives in the `qa-intelligence` npm package — the adoption path above uses the package directly without copying `src/core/`.


## Author

Built as a production-level QA automation starter with intelligent CI capabilities. If you use this template, consider leaving a star or linking back—contributions are welcome.
