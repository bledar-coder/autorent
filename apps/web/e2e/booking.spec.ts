import { test, expect } from "@playwright/test";

/**
 * Happy path: search the fleet → open a vehicle → configure a booking →
 * reach the Stripe payment step.
 *
 * Confirming the payment itself is driven by Stripe's hosted PaymentElement and
 * the webhook (covered by unit tests around booking-state + the webhook route),
 * so the e2e stops once the funnel has produced a payable booking.
 */
test("customer can search the fleet and reach payment", async ({ page }) => {
  // Search
  await page.goto("/en/fleet");
  await expect(page.getByRole("heading", { name: /fleet/i })).toBeVisible();

  // Open the first vehicle (card links point at /fleet/<slug>)
  await page.locator('a[href*="/fleet/"]').first().click();
  await expect(page.getByRole("link", { name: /book now/i })).toBeVisible();

  // Start the booking
  await page.getByRole("link", { name: /book now/i }).click();

  // Fill customer details (dates are pre-filled with sensible defaults)
  await page.getByPlaceholder("Full name").fill("Playwright Tester");
  await page.getByPlaceholder("Email").fill("e2e@example.com");
  await page.getByPlaceholder("Phone").fill("+38344123456");

  // Live price summary is computed
  await expect(page.getByText("Total")).toBeVisible();

  // Continue to payment → Stripe PaymentElement step
  await page.getByRole("button", { name: /continue to payment/i }).click();
  await expect(page.getByRole("heading", { name: /payment/i })).toBeVisible();
});
