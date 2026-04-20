import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS, DEVICE_INFORMATION, INTENDED_PURPOSE } from './test-data';

/**
 * Helper function to login
 */
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  // Don't wait for specific URL - just wait for device information form to appear
  await page.waitForSelector(`input[name="${DEVICE_INFORMATION.questionIds.deviceName}"]`, { timeout: 15000 });
}

/**
 * Helper function to fill device information
 */
async function fillDeviceInformation(page: any) {
  await page.fill(`input[name="${DEVICE_INFORMATION.questionIds.deviceName}"]`, DEVICE_INFORMATION.deviceName);
  await page.fill(`input[name="${DEVICE_INFORMATION.questionIds.deviceDescription}"]`, DEVICE_INFORMATION.deviceDescription);
  await page.getByRole('button', { name: 'Yes' }).first().click();
  await page.getByRole('button', { name: 'Yes' }).nth(1).click();
}

/**
 * Helper function to fill intended purpose
 */
async function fillIntendedPurpose(page: any) {
  await page.getByLabel('Intended Purpose').fill(INTENDED_PURPOSE.purpose);
}

test.describe('Complete Flow to Profile Dashboard', () => {
  test('should complete evaluation and display on Profile Dashboard', async ({ page }) => {
    test.setTimeout(120000); // 2 minute timeout

    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.text().includes('[ProfileDashboard]') || msg.text().includes('[RegulatoryScoping]')) {
        console.log(`BROWSER: ${msg.text()}`);
      }
    });

    // Step 1: Login
    console.log('Step 1: Login');
    await login(page);
    console.log('✅ Logged in');

    // Step 2: Fill Device Information
    console.log('Step 2: Fill Device Information');
    await fillDeviceInformation(page);
    await page.click('button:has-text("Next")');
    console.log('✅ Filled Device Information');

    // Step 3: Fill Intended Purpose
    console.log('Step 3: Fill Intended Purpose');
    await fillIntendedPurpose(page);
    await page.click('button:has-text("Next")');
    console.log('✅ Filled Intended Purpose');

    // Step 4: Wait for MDR Classification
    console.log('Step 4: Wait for MDR Classification');
    await expect(page.getByText('MDR Classification')).toBeVisible({ timeout: 30000 });
    // Wait for LLM processing
    await page.waitForTimeout(8000);
    console.log('✅ MDR Classification loaded');

    // Step 5: Go to Additional Information
    console.log('Step 5: Go to Additional Information');
    await page.click('button:has-text("Next")');
    await expect(page.getByText('Additional Information')).toBeVisible({ timeout: 30000 });
    // Wait for questions to be generated
    await page.waitForTimeout(8000);
    console.log('✅ Additional Information loaded');

    // Fill at least one question
    const textareas = page.locator('textarea');
    const count = await textareas.count();
    console.log(`Found ${count} textareas`);
    if (count > 0) {
      await textareas.nth(0).fill('Test answer for additional question');
    }

    // Step 6: Go to Provisional Assessment
    console.log('Step 6: Go to Provisional Assessment');
    await page.click('button:has-text("Next")');
    await expect(page.getByText('Provisional Assessment')).toBeVisible({ timeout: 30000 });
    // Wait for assessment to be generated
    await page.waitForTimeout(8000);
    console.log('✅ Provisional Assessment loaded');

    // Step 7: Click Complete
    console.log('Step 7: Click Complete');
    await page.click('button:has-text("Complete")');
    await page.waitForURL('/profiles', { timeout: 10000 });
    console.log('✅ Navigated to /profiles');

    // Step 8: Verify Profile Dashboard displays evaluation
    console.log('Step 8: Verify Profile Dashboard');

    // Check sessionStorage
    const sessionStorageData = await page.evaluate(() => {
      return sessionStorage.getItem('latestEvaluation');
    });
    console.log('SessionStorage has data:', !!sessionStorageData);

    // Wait for page to load
    await expect(page.getByText('Latest evaluation summary')).toBeVisible();

    // Check if "No Evaluation Available" is displayed
    const noEvaluationAlert = page.locator('text=No Evaluation Available');
    const hasNoEvaluation = await noEvaluationAlert.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasNoEvaluation) {
      console.log('❌ FAILURE: "No Evaluation Available" is displayed');

      // Print sessionStorage content for debugging
      if (sessionStorageData) {
        const data = JSON.parse(sessionStorageData);
        console.log('SessionStorage deviceName:', data.deviceName);
        console.log('SessionStorage has classification:', !!data.classification);
      }

      // Take screenshot
      await page.screenshot({ path: 'profile-dashboard-failure.png', fullPage: true });

      throw new Error('Evaluation not displayed on Profile Dashboard - showing "No Evaluation Available"');
    }

    // Verify evaluation is actually displayed
    console.log('✅ "No Evaluation Available" is NOT displayed');

    // Look for device name
    const hasDeviceName = await page.getByText(DEVICE_INFORMATION.deviceName).isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Device name visible:', hasDeviceName);

    // Look for MDR Classification section
    const hasMDRSection = await page.getByText('MDR Classification').first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log('MDR Classification section visible:', hasMDRSection);

    // Take success screenshot
    await page.screenshot({ path: 'profile-dashboard-success.png', fullPage: true });

    // Assert success
    expect(hasDeviceName || hasMDRSection).toBe(true);

    console.log('✅ TEST PASSED: Evaluation is displayed on Profile Dashboard');
  });
});
