import { TEST_CREDENTIALS, DEVICE_INFORMATION, INTENDED_PURPOSE } from './test-data';

// Reusable helper function for login
export async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
  await page.click('button[type="submit"]');

  // Wait for navigation to scoping page
  await page.waitForURL('/scoping');
  await page.waitForSelector('text=Regulatory Scoping Process');
}

// Reusable helper function to fill device information
export async function fillDeviceInformation(page: any) {
  // Fill in device information
  await page.fill(`input[name="${DEVICE_INFORMATION.questionIds.deviceName}"]`, DEVICE_INFORMATION.deviceName);
  await page.fill(`input[name="${DEVICE_INFORMATION.questionIds.deviceDescription}"]`, DEVICE_INFORMATION.deviceDescription);

  // Click Yes for medical purpose and AI usage
  const yesButtons = page.getByText('Yes');
  await yesButtons.first().click();
  await yesButtons.nth(1).click();

  // Proceed to next step
  await page.click('button:has-text("Next")');
  await page.waitForURL(/.*step=2/);
}

// Reusable helper function to fill intended purpose
export async function fillIntendedPurpose(page: any) {
  // Fill in intended purpose
  await page.getByLabel('Intended Purpose').fill(INTENDED_PURPOSE.purpose);

  // Proceed to MDR Classification
  await page.click('button:has-text("Next")');
  await page.waitForURL(/.*step=3/);
  await page.waitForSelector('text=MDR Classification Results');
}
