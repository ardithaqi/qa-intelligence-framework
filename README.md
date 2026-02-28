# QA Automation Framework

Production-ready Playwright framework with:

- Dockerized test execution
- AI-powered failure analysis
- PR failure diff intelligence
- Flaky test detection
- CI baseline comparison
- Clean PR summary reporting

This repository is designed to be used as:

1) A GitHub Template for new automation projects  
2) A base for companies that want structured QA + intelligent CI  

---

## 🚀 Features

- Playwright (TypeScript)
- Docker-first execution
- GitHub Actions CI
- AI failure root cause analysis
- Baseline diff vs target branch
- PR comment intelligence
- Flaky detection (retry-aware)
- CI blocking on new failures

---

## 📦 Project Structure

```
├── src/
│   ├── ai/
│   ├── config/
│   ├── pages/
│   │   └── auth.ts, loginPage.ts, ...
│   ├── core/
│   │   ├── testHooks.ts
│   │   ├── steps.ts
│   │   ├── globalTeardown.ts
│   │   ├── globalSetup.ts
│   │   ├── baseTest.ts
│   │   ├── basePage.ts
│   │   └── ...
│   └── ...
├── ci/
│   ├── computeDiff.ts
│   └── postComment.ts
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

---

## 🧪 Writing Tests

### Basic Test Example

```ts
import { test } from "../src/core/testHooks";
import { expect } from "@playwright/test";

test("user can login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Swag Labs/);
});
```

**Important**

Use:

```ts
import { test } from "../src/core/testHooks";
```

Not directly from Playwright.

This enables:

- AI failure analysis
- Artifact generation
- Flaky detection
- CI diff intelligence

### Environment Configuration

The framework reads environment variables via `.env`. For CI runs, the same variables (including `BASE_URL`) are set in **`.github/workflows/ci.yml`**—update that file if you use a different app URL.

Example:

```env
BASE_URL=https://www.saucedemo.com
HEADLESS=true
PW_WORKERS=2
PW_RETRIES=1
```

---

## Running Tests

**Local (without Docker)**

```bash
npm install
npm run test
```

**Local (Docker, recommended)**

```bash
docker build -t qa-framework .
docker run qa-framework
```

---

## Creating Your Own Tests

**Tests** go in `tests/`. **Page objects and shared app code** (e.g. auth, login) go in `src/pages/` so specs can import them.

Recommended structure:

```
tests/
  feature-name/
    feature.spec.ts
src/
  pages/
    auth.ts
    loginPage.ts
```

Example:

- `tests/auth/login.spec.ts` → import from `src/pages/loginPage.ts`
- `tests/cart/checkout.spec.ts` → import from `src/pages/checkoutPage.ts` or `src/pages/auth.ts`

---

## AI Failure Analysis

When a test fails:

- `meta.json` is generated
- AI analyzes failure
- `ai.txt` is produced
- Artifacts are stored under: `artifacts/run-<timestamp>/`

---

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

---

## CI Failure Intelligence

On Pull Requests:

1. Baseline artifacts are downloaded from target branch
2. Current failures are compared
3. PR comment shows:
   - **New Failures**
   - **Flaky**
   - **Still Failing**
   - **Fixed Failures**

Only new real failures block the PR.

---

## Required GitHub Secrets

Set in Repository Settings → Secrets:

- `OPENAI_API_KEY`
- `TEST_USERNAME`
- `TEST_PASSWORD`

---

## How CI Works

**On push to main/master:**

- Tests run
- Artifacts stored

**On pull_request:**

- Baseline downloaded
- Diff computed
- Comment posted
- PR blocked if new failures exist

---

## Converting This Into Your Own Project

1. Click **Use this template**
2. Clone new repo
3. Set secrets
4. Adjust `BASE_URL` in `.env` and in **`.github/workflows/ci.yml`** (the `docker run` step passes `BASE_URL`; set it to your app URL)
5. Add your tests
6. Push
7. CI handles the rest

---

## Author

Built as a production-level QA automation starter with intelligent CI capabilities. If you use this template, consider leaving a star or linking back—contributions are welcome.

---