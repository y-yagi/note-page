import { test as base, expect } from "@playwright/test";
import { FakeApi } from "./fake-api";

type Fixtures = {
  api: FakeApi;
  // Opens "/" and signs in as a new Auth Emulator user
  signIn: () => Promise<void>;
};

export const test = base.extend<Fixtures>({
  api: async ({ page }, use) => {
    const api = new FakeApi();
    await api.install(page);
    await use(api);
  },
  signIn: async ({ page }, use, testInfo) => {
    await use(async () => {
      await page.goto("/");
      await page.waitForFunction(() => (window as any).firebase);
      const email = `user-${testInfo.testId}-${Date.now()}@example.com`;
      await page.evaluate(
        (email) =>
          (window as any).firebase
            .auth()
            .createUserWithEmailAndPassword(email, "password"),
        email,
      );
      await expect(page.getByText("Create a new page")).toBeVisible();
    });
  },
});

export { expect };
