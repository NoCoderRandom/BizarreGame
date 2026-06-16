const { expect, test } = require("@playwright/test");

const action = (page, name) =>
  page.locator(".action-panel").getByRole("button", { name });

const item = (page, name) =>
  page.locator(".inventory-panel").getByRole("button", { name });

test("player can start and finish the main route", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Begin Shift" })).toBeVisible();
  await page.getByRole("link", { name: "Begin Shift" }).click();

  await expect(page.locator("#startScreen")).toHaveClass(/is-hidden/);
  await expect(action(page, "lost basket")).toBeVisible();

  await action(page, "lost basket").click();
  await expect(item(page, "Soot")).toBeVisible();

  await action(page, "breathing washer").click();
  await expect(item(page, "Wet Coin")).toBeVisible();

  await action(page, "soap machine").click();
  await expect(item(page, "Black Soap")).toBeVisible();

  await action(page, "red back door").click();
  await expect(page.locator("#roomTitle")).toHaveText("Back Room");

  await item(page, "Soot").click();
  await action(page, "central dryer").click();
  await action(page, "dangling tags").click();
  await expect(item(page, "Name Tag")).toBeVisible();

  await action(page, "three-note panel").click();
  const toneModal = page.locator(".modal");
  await expect(toneModal).toContainText("Three-Note Panel");
  const dials = toneModal.locator(".dial");
  await dials.nth(1).click();
  await dials.nth(1).click();
  await dials.nth(2).click();
  await toneModal.getByRole("button", { name: "Set Dials" }).click();
  await expect(item(page, "Rust")).toBeVisible();

  await action(page, "lobby door").click();
  await expect(page.locator("#roomTitle")).toHaveText("Lobby");
  await action(page, "radio static").click();
  await expect(item(page, "Voice")).toBeVisible();

  await action(page, "red back door").click();
  await expect(page.locator("#roomTitle")).toHaveText("Back Room");
  await action(page, "name basin").click();

  const nameModal = page.locator(".modal");
  await expect(nameModal).toContainText("Name Basin");
  await nameModal.getByRole("button", { name: "Soot" }).click();
  await nameModal.getByRole("button", { name: "Rust" }).click();
  await nameModal.getByRole("button", { name: "Voice" }).click();
  await nameModal.getByRole("button", { name: "Wash Name" }).click();

  await expect(page.locator("#roomTitle")).toHaveText("Lobby");
  await action(page, "front exit").click();
  await expect(page.locator("#roomTitle")).toHaveText("Rain Alley");

  await action(page, "open rain").click();
  await expect(page.locator(".ending-copy h2")).toHaveText("You Leave Named");
});
