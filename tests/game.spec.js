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

  await page.getByRole("button", { name: "Toggle sound" }).click();
  await expect(page.locator("#muteButton")).toHaveClass(/active/);

  await expect(action(page, "listen")).toHaveAttribute("aria-keyshortcuts", "1");
  await page.keyboard.press("1");
  await expect(page.locator("#message")).toContainText("washers breathe");
  await expect(page.locator("#apparition")).toContainText("washers breathe");

  const stageBox = await page.locator("#stage").boundingBox();
  expect(stageBox).not.toBeNull();
  await page.mouse.move(stageBox.x + stageBox.width * 0.2, stageBox.y + stageBox.height * 0.3);
  const stageLook = await page.locator("#stage").evaluate((element) => ({
    x: element.style.getPropertyValue("--look-x"),
    y: element.style.getPropertyValue("--look-y"),
  }));
  expect(stageLook.x).not.toBe("0px");
  expect(stageLook.y).not.toBe("0px");

  await page.keyboard.press("H");
  await expect(page.locator(".modal")).toContainText("breathing washer");
  await expect(page.locator(".modal button").first()).toBeFocused();
  await page.locator(".modal").getByRole("button", { name: "Step Back" }).click();

  await page.keyboard.press("J");
  await expect(page.locator(".modal")).toContainText("Shift Journal");
  await page.locator(".modal").getByRole("button", { name: "Step Back" }).click();

  await page.keyboard.press("R");
  await expect(page.locator("#stage")).toHaveClass(/revealing/);

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
  await expect(page.locator("#sceneImage")).toHaveAttribute("alt", /lost-and-found office/);
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
  await expect(page.locator("#muteButton")).toHaveClass(/active/);
  await expect(item(page, "Brass Key")).toBeVisible();
  await expect(item(page, "Black Soap")).toBeVisible();
  await page.getByRole("button", { name: "Open journal" }).click();
  await expect(page.locator(".modal")).toContainText("2:17");
  await page.locator(".modal").getByRole("button", { name: "Step Back" }).click();

  await item(page, "Brass Key").click();
  await action(page, "claim safe").click();

  const safeModal = page.locator(".modal");
  await expect(safeModal).toContainText("Claim Safe");
  await expect(safeModal.locator(".modal-art")).toHaveAttribute("src", /claim-safe-closeup\.webp/);
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

  await action(page, "boiler hatch").click();
  await expect(page.locator("#roomTitle")).toHaveText("Boiler Closet");
  await action(page, "pressure gauge").click();
  await expect(page.locator("#message")).toContainText("Static is pressure");
  await action(page, "pressure valve").click();
  await expect(page.locator(".meter")).toHaveAttribute("aria-label", "Static pressure 8 percent");
  await action(page, "dryer shrine").click();
  await expect(page.locator("#roomTitle")).toHaveText("Back Room");

  await item(page, "Soot").click();
  await action(page, "central dryer").click();
  await action(page, "dangling tags").click();
  await expect(item(page, "Name Tag")).toBeVisible();

  await action(page, "three-note panel").click();
  const toneModal = page.locator(".modal");
  await expect(toneModal).toContainText("Three-Note Panel");
  await expect(toneModal.locator(".modal-art")).toHaveAttribute("src", /tone-panel-closeup\.webp/);
  await toneModal.getByRole("button", { name: "Play Memory" }).click();
  await expect(toneModal.locator(".echo-caption")).toContainText("low, high, middle");
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
  await expect(nameModal.locator(".modal-art")).toHaveAttribute("src", /name-basin-closeup\.webp/);
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
  await expect(page.locator(".ending-record")).toContainText("Ending recorded 1/4");

  await page.goto("./");
  await expect(page.getByRole("link", { name: "Begin Shift" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue Shift" })).toBeHidden();
  await expect(page.locator("#endingStamps")).toContainText("Endings found 1/4");
  await expect(page.locator("#endingStamps")).toContainText("You Leave Named");
  await expect(page.locator("#endingStamps")).toContainText("Unknown ending");
  await expect(page.locator(".ending-stamp.locked").first()).toHaveAttribute("title", /static climb high/);

  await page.getByRole("link", { name: "Begin Shift" }).click();
  await page.keyboard.press("J");
  await expect(page.locator(".modal")).toContainText("Ending Records");
  await expect(page.locator(".modal")).toContainText("Unknown ending: Let static climb high");
  await page.locator(".modal").getByRole("button", { name: "Step Back" }).click();

  await page.goto("./");
  await page.getByRole("button", { name: "Burn Records" }).click();
  await expect(page.locator("#endingStamps")).toBeHidden();
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

test("mobile tone modal keeps controls reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  await page.getByRole("link", { name: "Begin Shift" }).click();
  await action(page, "breathing washer").click();
  await action(page, "soap machine").click();
  await item(page, "Black Soap").click();
  await action(page, "red back door").click();
  await expect(page.locator("#roomTitle")).toHaveText("Back Room");

  await action(page, "three-note panel").click();
  const toneModal = page.locator(".modal");
  await expect(toneModal.locator(".modal-art")).toHaveAttribute("src", /tone-panel-closeup\.webp/);
  await expect(toneModal.getByRole("button", { name: "Set Dials" })).toBeVisible();

  const layout = await page.evaluate(() => {
    const setDials = [...document.querySelectorAll(".modal button")]
      .find((button) => button.textContent.trim() === "Set Dials")
      .getBoundingClientRect();
    return {
      buttonBottom: setDials.bottom,
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(layout.buttonBottom).toBeLessThanOrEqual(layout.clientHeight);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
});

test("preloaded artwork assets decode in the browser", async ({ page }) => {
  await page.goto("./");

  const assetHrefs = await page
    .locator('link[rel="preload"][as="image"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  expect(assetHrefs).toEqual([
    "assets/images/laundromat-lobby.webp",
    "assets/images/dryer-shrine.webp",
    "assets/images/rain-alley.webp",
    "assets/images/lost-office.webp",
    "assets/images/boiler-closet.webp",
    "assets/images/claim-safe-closeup.webp",
    "assets/images/tone-panel-closeup.webp",
    "assets/images/name-basin-closeup.webp",
    "assets/images/shift-clock-closeup.webp",
  ]);

  const decoded = await page.evaluate(async (hrefs) => {
    const loadImage = (href) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          resolve({
            href,
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        };
        image.onerror = () => reject(new Error(`Could not decode ${href}`));
        image.src = href;
      });

    return Promise.all(hrefs.map(loadImage));
  }, assetHrefs);

  decoded.forEach((asset) => {
    expect(asset.width).toBeGreaterThan(400);
    expect(asset.height).toBeGreaterThan(200);
  });
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
  await expect(page.locator(".ending-record")).toContainText("Ending recorded 1/4");

  await page.goto("./");
  await expect(page.locator("#endingStamps")).toContainText("Endings found 1/4");
  await expect(page.locator("#endingStamps")).toContainText("You Call Yourself");
});

test("player can find the shift clock ending", async ({ page }) => {
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
  await action(page, "shift clock").click();
  const clockModal = page.locator(".modal");
  await expect(clockModal).toContainText("Shift Clock");
  await expect(clockModal.locator(".modal-art")).toHaveAttribute("src", /shift-clock-closeup\.webp/);
  await clockModal.getByRole("button", { name: "Punch Card" }).click();
  await expect(page.locator(".ending-card")).toHaveAttribute("style", /shift-clock-closeup\.webp/);
  await expect(page.locator(".ending-copy h2")).toHaveText("You Clock In");
  await expect(page.locator(".ending-record")).toContainText("Ending recorded 1/4");

  await page.goto("./");
  await expect(page.locator("#endingStamps")).toContainText("Endings found 1/4");
  await expect(page.locator("#endingStamps")).toContainText("You Clock In");
});

test("player can find the frayed high-static ending", async ({ page }) => {
  await page.goto("./");

  await page.getByRole("link", { name: "Begin Shift" }).click();
  for (let i = 0; i < 11; i += 1) {
    await action(page, "front exit").click();
  }
  await expect(page.locator("body")).toHaveClass(/static-critical/);

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
  await action(page, "open rain").click();
  await expect(page.locator(".ending-copy h2")).toHaveText("You Leave Frayed");
  await expect(page.locator(".ending-record")).toContainText("Ending recorded 1/4");

  await page.goto("./");
  await expect(page.locator("#endingStamps")).toContainText("Endings found 1/4");
  await expect(page.locator("#endingStamps")).toContainText("You Leave Frayed");
});
