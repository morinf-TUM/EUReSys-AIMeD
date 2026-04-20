import { test, expect } from '@playwright/test';
import {
  TEST_CREDENTIALS,
  DEVICE_INFORMATION,
  INTENDED_PURPOSE
} from './test-data';

test('complete flow and test profile dashboard display', async ({ page }) => {
  test.setTimeout(120000);

  console.log('=== Starting Profile Dashboard Display Test ===');

  // Capture console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[CONSOLE] ${msg.type()}: ${text}`);
    // Print important logs immediately
    if (text.includes('[ProfileDashboard]') || text.includes('[RegulatoryScoping]')) {
      console.log(`BROWSER: ${text}`);
    }
  });

  page.on('pageerror', error => {
    consoleLogs.push(`[PAGE ERROR] ${error.message}`);
    console.log(`PAGE ERROR: ${error.message}`);
  });

  try {
    // 1. Login
    console.log('\n1. Logging in...');
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    console.log('✅ Login submitted');

    // 1b. Start scoping
    console.log('\n2. Starting scoping...');
    await page.getByRole('link', { name: 'Start Scoping' }).click();
    console.log('✅ Scoping started');

    // 2. Fill device information
    console.log('\n3. Filling device information...');
    await page.fill(`input[name="${DEVICE_INFORMATION.questionIds.deviceName}"]`, DEVICE_INFORMATION.deviceName);
    await page.fill(`input[name="${DEVICE_INFORMATION.questionIds.deviceDescription}"]`, DEVICE_INFORMATION.deviceDescription);
    await page.getByRole('button', { name: 'Yes' }).first().click();
    await page.getByRole('button', { name: 'Yes' }).nth(1).click();
    await page.click('button:has-text("Next")');
    console.log('✅ Device information submitted');

    // 3. Fill intended purpose
    console.log('\n4. Filling intended purpose...');
    await page.getByLabel('Intended Purpose').fill(INTENDED_PURPOSE.purpose);
    await page.click('button:has-text("Next")');
    console.log('✅ Intended purpose submitted');

    // 4. Wait for MDR Classification
    console.log('\n5. Waiting for MDR Classification...');
    await expect(page.getByRole('heading', { name: 'MDR Classification Results' })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(3000); // Wait for LLM
    console.log('✅ MDR Classification loaded');

    // 5. Go to Additional Information
    console.log('\n6. Going to Additional Information...');
    await page.click('button:has-text("Next")');
    await expect(page.getByRole('heading', { name: 'Additional Information' })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(3000); // Wait for questions
    console.log('✅ Additional Information loaded');

    // Fill at least one answer
    const textareas = page.locator('textarea');
    const count = await textareas.count();
    console.log(`Found ${count} textarea(s)`);
    if (count > 0) {
      await textareas.nth(0).fill('This is a test answer for the additional information question.');
    }

    // 6. Go to Provisional Assessment
    console.log('\n7. Going to Provisional Assessment...');
    await page.click('button:has-text("Next")');
    await expect(page.getByRole('heading', { name: 'Provisional Assessment' })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(3000); // Wait for assessment
    console.log('✅ Provisional Assessment loaded');

    // 7. Click Complete
    console.log('\n8. Clicking Complete button...');
    await page.click('button:has-text("Complete")');
    await page.waitForTimeout(2000); // Wait for navigation
    console.log('✅ Complete clicked');

    // 8. Check we're on profiles page
    console.log('\n9. Checking navigation to /profiles...');
    const currentURL = page.url();
    console.log('Current URL:', currentURL);
    expect(currentURL).toContain('/profiles');
    console.log('✅ On /profiles page');

    // 9. Check sessionStorage
    console.log('\n10. Checking sessionStorage...');
    const sessionStorageData = await page.evaluate(() => {
      const data = sessionStorage.getItem('latestEvaluation');
      return {
        exists: !!data,
        length: data?.length || 0,
        raw: data
      };
    });
    console.log('SessionStorage exists:', sessionStorageData.exists);
    console.log('SessionStorage length:', sessionStorageData.length);

    if (sessionStorageData.raw) {
      const parsed = JSON.parse(sessionStorageData.raw);
      console.log('SessionStorage deviceName:', parsed.deviceName);
      console.log('SessionStorage has classification:', !!parsed.classification);
      console.log('SessionStorage has llmAssessment:', !!parsed.llmAssessment);
    }

    // 10. Wait for Profile Dashboard to load
    console.log('\n11. Checking Profile Dashboard display...');
    await expect(page.getByRole('heading', { name: 'Latest evaluation summary', exact: true })).toBeVisible({ timeout: 10000 });
    console.log('✅ Profile Dashboard heading visible');

    // 11. Check if "No Evaluation Available" is displayed
    await page.waitForTimeout(1000); // Brief wait for rendering
    const noEvalVisible = await page.locator('text=No Evaluation Available')
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    console.log('\n12. Checking page content...');
    console.log('"No Evaluation Available" visible:', noEvalVisible);

    // 12. Check for device name
    const deviceNameVisible = await page.locator(`text=${DEVICE_INFORMATION.deviceName}`)
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    console.log('Device name visible:', deviceNameVisible);

    // 13. Check for MDR Classification section
    const mdrVisible = await page.locator('text=MDR Classification').first()
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    console.log('MDR Classification section visible:', mdrVisible);

    // 14. Take screenshot
    await page.screenshot({ path: 'profile-dashboard-result.png', fullPage: true });
    console.log('Screenshot saved: profile-dashboard-result.png');

    // 15. Analyze console logs for ProfileDashboard
    console.log('\n=== PROFILE DASHBOARD CONSOLE LOGS ===');
    const profileLogs = consoleLogs.filter(log =>
      log.includes('[ProfileDashboard]') || log.includes('[RegulatoryScoping]')
    );
    profileLogs.forEach(log => console.log(log));

    // 16. Check for key events
    console.log('\n=== KEY EVENTS CHECK ===');
    const hasCreatedEvalData = consoleLogs.some(log =>
      log.includes('[RegulatoryScoping]') && log.includes('Created evaluation data')
    );
    console.log('Created evaluation data:', hasCreatedEvalData);

    const hasStoredInSession = consoleLogs.some(log =>
      log.includes('[RegulatoryScoping]') && log.includes('Stored in sessionStorage')
    );
    console.log('Stored in sessionStorage:', hasStoredInSession);

    const hasNavigating = consoleLogs.some(log =>
      log.includes('[RegulatoryScoping]') && log.includes('Navigating to /profiles')
    );
    console.log('Navigating to /profiles:', hasNavigating);

    const hasLoadingEval = consoleLogs.some(log =>
      log.includes('[ProfileDashboard]') && log.includes('Loading evaluation')
    );
    console.log('ProfileDashboard loading evaluation:', hasLoadingEval);

    const hasFoundEval = consoleLogs.some(log =>
      log.includes('[ProfileDashboard]') && log.includes('Found evaluation')
    );
    console.log('ProfileDashboard found evaluation:', hasFoundEval);

    const hasNoEval = consoleLogs.some(log =>
      log.includes('[ProfileDashboard]') && log.includes('No evaluation found')
    );
    console.log('ProfileDashboard no evaluation:', hasNoEval);

    // 17. Save all logs
    const fs = require('fs');
    fs.writeFileSync('profile-dashboard-logs.txt', consoleLogs.join('\n'));
    console.log('\n✅ All logs saved to profile-dashboard-logs.txt');

    // 18. Final verdict
    console.log('\n=== TEST RESULT ===');
    if (noEvalVisible) {
      console.log('❌ FAILURE: "No Evaluation Available" is displayed');
      console.log('   But sessionStorage has data:', sessionStorageData.exists);
      console.log('   This confirms the bug exists!');

      // Print diagnostic info
      console.log('\n=== DIAGNOSTIC INFO ===');
      console.log('RegulatoryScoping created data:', hasCreatedEvalData);
      console.log('RegulatoryScoping stored data:', hasStoredInSession);
      console.log('RegulatoryScoping navigated:', hasNavigating);
      console.log('ProfileDashboard loaded:', hasLoadingEval);
      console.log('ProfileDashboard found data:', hasFoundEval);
      console.log('ProfileDashboard no data:', hasNoEval);

      throw new Error('ProfileDashboard is not displaying evaluation - BUG CONFIRMED');
    } else if (deviceNameVisible || mdrVisible) {
      console.log('✅ SUCCESS: Evaluation is displayed correctly');
      console.log('   Device name visible:', deviceNameVisible);
      console.log('   MDR section visible:', mdrVisible);
    } else {
      console.log('⚠️  UNCLEAR: Neither error nor evaluation visible');
      const bodyText = await page.textContent('body');
      console.log('Body contains device name:', bodyText?.includes(DEVICE_INFORMATION.deviceName));
      throw new Error('Cannot determine ProfileDashboard state');
    }

  } catch (error: any) {
    console.log('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'profile-dashboard-error.png', fullPage: true });

    // Save logs on error
    const fs = require('fs');
    fs.writeFileSync('profile-dashboard-error-logs.txt', consoleLogs.join('\n'));
    console.log('Error logs saved to profile-dashboard-error-logs.txt');

    throw error;
  }
});
