const { expect, test } = require("@playwright/test");

const action = (page, name) =>
  page.locator(".action-panel").getByRole("button", { name });

const item = (page, name) =>
  page.locator(".inventory-panel").getByRole("button", { name });

test("player can start and finish the main route", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("link", { name: "Begin Shift" })).toBeVisible();
  await page.getByRole("link", { name: "Begin Shift" }).click();

  await expect(page.locator("#startScreen")).toHaveClass(/is-hidden/);
  await expect(action(page, "lost basket")).toBeVisible();

  await page.getByRole("button", { name: "Show hint" }).click();
  await expect(page.locator(".modal")).toContainText("breathing washer");
  await page.locator(".modal").getByRole("button", { name: "Step Back" }).click();

  await action(page, "rules poster").click();
  await expect(page.locator("#message")).toContainText("Rule 7");

  for (let i = 0; i < 4; i += 1) {
    await action(page, "front exit").click();
  }
  await expect(page.locator("body")).toHaveClass(/static-rising/);
  await expect(page.locator(".meter")).toHaveAttribute("aria-label", "Static pressure 40 percent");
  await expect(page.locator("#apparition")).not.toHaveText("");

  await action(page, "lost basket").click();
  await expect(item(page, "Soot")).toBeVisible();

  await action(page, "breathing washer").click();
  await expect(item(page, "Wet Coin")).toBeVisible();

  await item(page, "Wet Coin").click();
  await expect(page.locator("#message")).toContainText("Wet Coin selected");
  await action(page, "soap machine").click();
  await expect(item(page, "Black Soap")).toBeVisible();
  await expect(item(page, "Claim Ticket")).toBeVisible();

  await action(page, "lost office").click();
  await expect(page.locator("#roomTitle")).toHaveText("Lost Office");
  await action(page, "claim ledger").click();
  await expect(page.locator("#objective")).toContainText("missing vowels");
  await action(page, "stained notice").click();
  await expect(page.locator("#message")).toContainText("claimed letters");
  await page.getByRole("button", { name: "Open journal" }).click();
  await expect(page.locator(".modal")).toContainText("2:17");
  await expect(page.locator(".modal")).toContainText("vowel");
  await expect(page.locator(".modal")).toContainText("high static");
  await expect(page.locator(".modal")).toContainText("cloudy water");
  await expect(page.locator(".modal")).toContainText("Pockets");
  await expect(page.locator(".modal")).toContainText("Black Soap");
  await page.locator(".modal").getByRole("button", { name: "Step Back" }).click();
  await action(page, "key rack").click();
  await expect(item(page, "Brass Key")).toBeVisible();

  await page.goto("./");
  await expect(page.getByRole("button", { name: "Continue Shift" })).toBeVisible();
  await page.getByRole("button", { name: "Continue Shift" }).click();
  await expect(page.locator("#startScreen")).toHaveClass(/is-hidden/);
  await expect(page.locator("#roomTitle")).toHaveText("Lost Office");
  await expect(item(page, "Brass Key")).toBeVisible();
  await expect(item(page, "Black Soap")).toBeVisible();
  await page.getByRole("button", { name: "Open journal" }).click();
  await expect(page.locator(".modal")).toContainText("2:17");
  await page.locator(".modal").getByRole("button", { name: "Step Back" }).click();

  await item(page, "Brass Key").click();
  await action(page, "claim safe").click();

  const safeModal = page.locator(".modal");
  await expect(safeModal).toContainText("Claim Safe");
  await expect(safeModal.locator(".modal-art")).toHaveAttribute("src", /claim-safe-closeup\.png/);
  const safeDigits = safeModal.locator(".dial");
  await safeDigits.nth(0).click();
  await safeDigits.nth(0).click();
  await safeDigits.nth(1).click();
  for (let i = 0; i < 7; i += 1) {
    await safeDigits.nth(2).click();
  }
  await safeModal.getByRole("button", { name: "Open Safe" }).click();
  await expect(item(page, "Vowel Slip")).toBeVisible();

  await action(page, "cloudy sink").click();
  await expect(page.locator(".meter")).toHaveAttribute("aria-label", "Static pressure 22 percent");
  await expect(page.locator("#message")).toContainText("rinses static");

  await action(page, "lobby window").click();
  await expect(page.locator("#roomTitle")).toHaveText("Lobby");

  await item(page, "Black Soap").click();
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
  await expect(nameModal.locator(".modal-art")).toHaveAttribute("src", /name-basin-closeup\.png/);
  await nameModal.getByRole("button", { name: "Rust" }).click();
  await nameModal.getByRole("button", { name: "Voice" }).click();
  await nameModal.getByRole("button", { name: "Vowel Slip" }).click();
  await nameModal.getByRole("button", { name: "Wash Name" }).click();

  await expect(page.locator("#roomTitle")).toHaveText("Lobby");
  await action(page, "front exit").click();
  await expect(page.locator("#roomTitle")).toHaveText("Rain Alley");

  await action(page, "storm drain").click();
  await expect(page.locator("#message")).toContainText("rain keeps");

  await action(page, "open rain").click();
  await expect(page.locator(".ending-copy h2")).toHaveText("You Leave Named");
  await expect(page.locator(".ending-record")).toContainText("Ending recorded 1/3");

  await page.goto("./");
  await expect(page.getByRole("link", { name: "Begin Shift" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue Shift" })).toBeHidden();
  await expect(page.locator("#endingStamps")).toContainText("Endings found 1/3");
  await expect(page.locator("#endingStamps")).toContainText("You Leave Named");
  await expect(page.locator("#endingStamps")).toContainText("Unknown ending");
});

test("mobile layout keeps core controls usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  await page.getByRole("link", { name: "Begin Shift" }).click();
  await expect(page.locator("#startScreen")).toHaveClass(/is-hidden/);
  await expect(action(page, "lost basket")).toBeVisible();

  await page.getByRole("button", { name: "Show hint" }).click();
  await expect(page.locator(".modal")).toContainText("breathing washer");
  await page.locator(".modal").getByRole("button", { name: "Step Back" }).click();

  await action(page, "rules poster").click();
  await expect(page.locator("#message")).toContainText("Rule 7");

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
});

test("player can find the payphone ending", async ({ page }) => {
  await page.goto("./");

  await page.getByRole("link", { name: "Begin Shift" }).click();
  await action(page, "lost basket").click();
  await action(page, "breathing washer").click();
  await action(page, "soap machine").click();

  await action(page, "lost office").click();
  await expect(page.locator("#roomTitle")).toHaveText("Lost Office");
  await action(page, "key rack").click();
  await item(page, "Brass Key").click();
  await action(page, "claim safe").click();

  const safeModal = page.locator(".modal");
  const safeDigits = safeModal.locator(".dial");
  await safeDigits.nth(0).click();
  await safeDigits.nth(0).click();
  await safeDigits.nth(1).click();
  for (let i = 0; i < 7; i += 1) {
    await safeDigits.nth(2).click();
  }
  await safeModal.getByRole("button", { name: "Open Safe" }).click();

  await action(page, "lobby window").click();
  await item(page, "Black Soap").click();
  await action(page, "red back door").click();
  await item(page, "Soot").click();
  await action(page, "central dryer").click();
  await action(page, "dangling tags").click();

  await action(page, "three-note panel").click();
  const toneModal = page.locator(".modal");
  const dials = toneModal.locator(".dial");
  await dials.nth(1).click();
  await dials.nth(1).click();
  await dials.nth(2).click();
  await toneModal.getByRole("button", { name: "Set Dials" }).click();

  await action(page, "lobby door").click();
  await action(page, "radio static").click();
  await action(page, "red back door").click();
  await action(page, "name basin").click();

  const nameModal = page.locator(".modal");
  await nameModal.getByRole("button", { name: "Rust" }).click();
  await nameModal.getByRole("button", { name: "Voice" }).click();
  await nameModal.getByRole("button", { name: "Vowel Slip" }).click();
  await nameModal.getByRole("button", { name: "Wash Name" }).click();

  await expect(page.locator("#roomTitle")).toHaveText("Lobby");
  await action(page, "front exit").click();
  await expect(page.locator("#roomTitle")).toHaveText("Rain Alley");
  await action(page, "payphone").click();
  await expect(page.locator(".ending-copy h2")).toHaveText("You Call Yourself");
  await expect(page.locator(".ending-record")).toContainText("Ending recorded 1/3");

  await page.goto("./");
  await expect(page.locator("#endingStamps")).toContainText("Endings found 1/3");
  await expect(page.locator("#endingStamps")).toContainText("You Call Yourself");
});
