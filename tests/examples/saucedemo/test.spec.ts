import { test } from "../../../src/core/testHooks";
import { expect } from "@playwright/test";


test("flaky example", async () => {
    const attempt = test.info().retry;

    if (attempt === 0) {
        expect(1).toBe(2);
    }

    expect(1).toBe(1);
});