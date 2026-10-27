import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const acceptDialogs = (page: Page) =>
  page.on("dialog", (dialog) => dialog.accept());

// The EasyMDE (CodeMirror) editor has no plain input to fill
const typeContent = async (page: Page, text: string) => {
  await page.locator(".CodeMirror").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type(text);
};

const notebookSelect = (page: Page) => page.getByRole("listbox");

// The dropdown renders every option even when closed, so check the text of
// the selected value only
const selectedNotebook = (page: Page) =>
  notebookSelect(page).locator("> .text");

// Semantic UI's tab menu items have no tab role
const pageTab = (page: Page, name: string) =>
  page.locator(".Tab-wrapped .item", { hasText: name });

test("asks to sign in when signed out", async ({ page, api }) => {
  await page.goto("/");
  await expect(page.getByText("Please signed in.")).toBeVisible();
  expect(api.requests).toEqual([]);
});

test("creates, edits and destroys a page", async ({ page, api, signIn }) => {
  await signIn();
  await expect(selectedNotebook(page)).toHaveText("default");

  await page.getByRole("button", { name: "Create a new page" }).click();
  await expect(page).toHaveURL("/pages/new?book=default");
  await page.getByTestId("pagename").fill("memo");
  await typeContent(page, "# Heading\nbody text");
  await page.getByRole("button", { name: "submit" }).click();

  await expect(page).toHaveURL("/?book=default");
  await expect(pageTab(page, "memo")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Heading" })).toBeVisible();
  await expect(page.getByText("body text")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/pages\/\d+\?book=default$/);
  await expect(page.getByTestId("pagename")).toHaveValue("memo");
  await typeContent(page, "updated text");
  await page.getByRole("button", { name: "submit" }).click();

  await expect(page).toHaveURL("/?book=default");
  await expect(page.getByText("updated text")).toBeVisible();
  expect(api.pages.map((p) => p.content)).toEqual(["updated text"]);

  acceptDialogs(page);
  await page.getByRole("button", { name: "Destroy" }).click();
  await expect(pageTab(page, "memo")).toHaveCount(0);
  expect(api.pages).toEqual([]);
});

test("saves with Ctrl+S on the edit page", async ({ page, api, signIn }) => {
  await signIn();
  await page.getByRole("button", { name: "Create a new page" }).click();
  await page.getByTestId("pagename").fill("memo");
  await typeContent(page, "first");
  await page.getByRole("button", { name: "submit" }).click();
  await page.getByRole("button", { name: "Edit" }).click();

  await typeContent(page, "second");
  await page.keyboard.press("Control+s");
  await expect(page.getByText("Updated!")).toBeVisible();
  expect(api.pages.map((p) => p.content)).toEqual(["second"]);
});

test("creates and destroys a notebook", async ({ page, api, signIn }) => {
  await signIn();

  await notebookSelect(page).click();
  await page.getByRole("option", { name: "Create a new note book" }).click();
  await expect(page).toHaveURL("/notebooks/new");
  await page.getByPlaceholder("Name").fill("work");
  await page.getByRole("button", { name: "submit" }).click();

  await expect(page).toHaveURL("/");
  await notebookSelect(page).click();
  await page.getByRole("option", { name: "work" }).click();
  await expect(selectedNotebook(page)).toHaveText("work");

  acceptDialogs(page);
  await page.getByRole("button", { name: "Destroy a note book" }).click();
  await expect(selectedNotebook(page)).toHaveText("default");
  expect(api.notebooks.map((n) => n.name)).toEqual(["default"]);
  expect(api.requests).toContain("DELETE /notebooks/work");
});

test("shows API errors in a toast", async ({ page, api, signIn }) => {
  await signIn();
  await page.goto("/notebooks/new");
  await page.getByPlaceholder("Name").fill("a/b");
  await page.getByRole("button", { name: "submit" }).click();

  await expect(page.getByText("name is invalid")).toBeVisible();
  await expect(page).toHaveURL("/notebooks/new");
  expect(api.notebooks.map((n) => n.name)).not.toContain("a/b");
});

test.describe("dot segment notebook names", () => {
  // The notebook comes from ?book= on client-side navigation, or from the
  // name saved in sessionStorage when a page is saved
  test("falls back to the default notebook", async ({ page, api, signIn }) => {
    await signIn();
    await page.evaluate(() => window.sessionStorage.setItem("book", ".."));
    api.requests = [];
    await page.reload();

    await expect(selectedNotebook(page)).toHaveText("default");
    await expect(page.getByText("Create a new page")).toBeVisible();
    for (const r of api.requests) {
      expect(["GET /notebooks", "GET /notebooks/default/pages"]).toContain(r);
    }
  });

  test("does not open the edit page", async ({ page, api, signIn }) => {
    await signIn();
    const before = api.requests.length;
    await page.goto("/pages/1?book=..");

    await expect(page.getByText("Page not found")).toBeVisible();
    expect(api.requests.slice(before)).toEqual([]);
  });

  test("does not send a new page", async ({ page, api, signIn }) => {
    await signIn();
    const before = api.requests.length;
    await page.goto("/pages/new?book=.");
    await page.getByTestId("pagename").fill("memo");
    await typeContent(page, "content");
    await page.getByRole("button", { name: "submit" }).click();

    await expect(page.getByText("Invalid notebook name")).toBeVisible();
    expect(api.requests.slice(before)).toEqual([]);
  });

  test("rejects the name when creating a notebook", async ({
    page,
    api,
    signIn,
  }) => {
    await signIn();
    const before = api.requests.length;
    await page.goto("/notebooks/new");
    await page.getByPlaceholder("Name").fill("..");
    await page.getByRole("button", { name: "submit" }).click();

    await expect(page.getByText("Invalid notebook name")).toBeVisible();
    expect(api.requests.slice(before)).toEqual([]);
  });
});
