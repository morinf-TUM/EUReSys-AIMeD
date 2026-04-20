import { test, expect } from '@playwright/test';
import { login, fillDeviceInformation, fillIntendedPurpose } from './helpers';
import * as fs from 'fs';
import * as path from 'path';

test('complete flow from page 1 to page 7', async ({ page }) => {
  // Array to store console logs
  const consoleLogs: string[] = [];
  const stepResults: any[] = [];

  // Capture all console messages
  page.on('console', msg => {
    const logMessage = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleLogs.push(logMessage);
    console.log(logMessage);
  });

  try {
    // ================== STEP 1: Login ==================
    console.log('\n🔵 STEP 1: Logging in...');
    await login(page);
    console.log('✅ Login successful');
    stepResults.push({ step: 1, name: 'Login', status: 'passed' });

    // ================== STEP 2: Page 1 - Device Information ==================
    console.log('\n🔵 STEP 2: Page 1 - Filling device information...');
    await fillDeviceInformation(page);
    console.log('✅ Device information submitted');
    await page.waitForTimeout(1000);
    stepResults.push({ step: 2, name: 'Page 1 - Device Information', status: 'passed' });

    // ================== STEP 3: Page 2 - Intended Purpose ==================
    console.log('\n🔵 STEP 3: Page 2 - Filling intended purpose...');
    await fillIntendedPurpose(page);
    console.log('✅ Intended purpose submitted - now on page 3');
    stepResults.push({ step: 3, name: 'Page 2 - Intended Purpose', status: 'passed' });

    // ================== STEP 4: Page 3 - MDR Classification ==================
    console.log('\n🔵 STEP 4: Page 3 - Waiting for MDR classification...');
    await page.waitForSelector('text=MDR Classification Results', { timeout: 15000 });
    console.log('✅ Page 3 (MDR Classification) loaded');
    console.log('⏳ Waiting for LLM classification verification (4+ seconds)...');
    await page.waitForTimeout(4000); // Wait for LLM comment generation (minimum 4 seconds)

    // Take screenshot of page 3
    await page.screenshot({ path: 'complete-flow-page3.png', fullPage: true });
    console.log('📸 Page 3 screenshot saved');
    stepResults.push({ step: 4, name: 'Page 3 - MDR Classification', status: 'passed' });

    // ================== STEP 5: Page 3 → Page 4 Navigation ==================
    console.log('\n🔵 STEP 5: Navigating from Page 3 to Page 4...');
    const nextButtonPage3 = page.locator('button:has-text("Next")');
    await nextButtonPage3.click();
    console.log('⏳ Waiting for LLM input quality assessment (4+ seconds)...');
    await page.waitForTimeout(4000); // Wait for LLM assessment generation (minimum 4 seconds)

    // ================== STEP 6: Page 4 - Additional Information Request ==================
    console.log('\n🔵 STEP 6: Page 4 - Additional Information Request...');
    await page.waitForSelector('text=Additional Information Request', { timeout: 15000 });
    console.log('✅ Page 4 loaded');

    // Wait a bit longer to ensure questions are extracted
    await page.waitForTimeout(2000);

    // Check if assessment is visible
    const assessmentVisible = await page.locator('text=## Summary').isVisible().catch(() => false);
    console.log(`📊 LLM assessment visible: ${assessmentVisible}`);

    // Take screenshot of page 4
    await page.screenshot({ path: 'complete-flow-page4.png', fullPage: true });
    console.log('📸 Page 4 screenshot saved');
    stepResults.push({ step: 6, name: 'Page 4 - Additional Information Request', status: 'passed' });

    // ================== STEP 7: Page 4 → Page 5 Navigation ==================
    console.log('\n🔵 STEP 7: Navigating from Page 4 to Page 5...');
    const nextButtonPage4 = page.locator('button:has-text("Next")');
    const isDisabledPage4 = await nextButtonPage4.isDisabled();
    console.log(`📊 Next button on page 4 disabled: ${isDisabledPage4}`);

    if (isDisabledPage4) {
      console.log('❌ ERROR: Next button is disabled on page 4!');
      stepResults.push({ step: 7, name: 'Page 4 → Page 5 Navigation', status: 'failed', error: 'Next button disabled' });
      throw new Error('Next button is disabled on page 4');
    }

    await nextButtonPage4.click();
    await page.waitForTimeout(2000);

    // ================== STEP 8: Page 5 - Additional Information ==================
    console.log('\n🔵 STEP 8: Page 5 - Additional Information...');
    await page.waitForSelector('h6:has-text("Additional Information")', { timeout: 10000 });
    console.log('✅ Page 5 loaded');

    // Wait for questions to render
    await page.waitForTimeout(1000);

    // Check for questions - use a more specific selector to avoid MUI internal textareas
    const questionCount = await page.locator('textarea:not([readonly]):not([aria-hidden="true"]):visible').count();
    console.log(`📊 Number of input fields: ${questionCount}`);

    if (questionCount === 0) {
      console.log('⚠️  Warning: No questions/input fields on page 5');
      console.log('   This is expected if no questions were generated on page 4');
    } else {
      console.log(`✅ Found ${questionCount} question(s) with input fields`);

      // Fill all answers with test data
      console.log('📝 Filling answers...');
      const textareas = await page.locator('textarea:not([readonly]):not([aria-hidden="true"]):visible').all();
      for (let i = 0; i < textareas.length; i++) {
        const testAnswer = `Test answer ${i + 1}: This device uses advanced machine learning algorithms to analyze ECG data in real-time. The AI model has been trained on a dataset of over 100,000 ECG recordings and achieves 95% accuracy in detecting arrhythmias. The device stores all patient data encrypted and complies with GDPR requirements for data protection.`;
        await textareas[i].fill(testAnswer);
        console.log(`   ✅ Filled answer ${i + 1}/${textareas.length}`);
        await page.waitForTimeout(500); // Small delay between fills
      }
      console.log('✅ All answers filled');
    }

    // Take screenshot of page 5
    await page.screenshot({ path: 'complete-flow-page5.png', fullPage: true });
    console.log('📸 Page 5 screenshot saved');
    stepResults.push({ step: 8, name: 'Page 5 - Additional Information', status: 'passed', questionsFound: questionCount });

    // ================== STEP 9: Page 5 → Page 6 Navigation ==================
    console.log('\n🔵 STEP 9: Navigating from Page 5 to Page 6...');
    const nextButtonPage5 = page.locator('button:has-text("Next")');

    if (questionCount > 0) {
      // Wait for button to be enabled after filling answers
      await page.waitForTimeout(1000);
    }

    const isDisabledPage5 = await nextButtonPage5.isDisabled();
    console.log(`📊 Next button on page 5 disabled: ${isDisabledPage5}`);

    if (isDisabledPage5 && questionCount > 0) {
      console.log('❌ ERROR: Next button is disabled on page 5 even after filling answers!');
      stepResults.push({ step: 9, name: 'Page 5 → Page 6 Navigation', status: 'failed', error: 'Next button disabled after filling answers' });
      throw new Error('Next button is disabled on page 5');
    }

    await nextButtonPage5.click();
    console.log('⏳ Waiting for LLM provisional assessment (4+ seconds)...');
    await page.waitForTimeout(4000); // Wait for LLM provisional assessment API call (minimum 4 seconds)

    // ================== STEP 10: Page 6 - Provisional Assessment ==================
    console.log('\n🔵 STEP 10: Page 6 - Provisional Assessment...');
    await page.waitForSelector('h6:has-text("Provisional Assessment")', { timeout: 15000 });
    console.log('✅ Page 6 loaded');

    // Check for required sections
    const hasMDRSection = await page.locator('text=MDR Classification').count() > 0;
    const hasAIActSection = await page.locator('text=AI Act Classification').count() > 0;
    const hasGDPRSection = await page.locator('text=GDPR Requirements').count() > 0;
    const hasDocSection = await page.locator('text=Minimalistic Documentation for the CE Certification Process [DRAFT]').count() > 0;
    const hasTEFSection = await page.locator('text=Relevant TEF Services').count() > 0;

    console.log('📊 Sections found on Page 6:');
    console.log(`   - MDR Classification: ${hasMDRSection ? '✅' : '❌'}`);
    console.log(`   - AI Act Classification: ${hasAIActSection ? '✅' : '❌'}`);
    console.log(`   - GDPR Requirements: ${hasGDPRSection ? '✅' : '❌'}`);
    console.log(`   - Minimalistic Documentation [DRAFT]: ${hasDocSection ? '✅' : '❌'}`);
    console.log(`   - Relevant TEF Services: ${hasTEFSection ? '✅' : '❌'}`);

    // Take screenshot of page 6
    await page.screenshot({ path: 'complete-flow-page6.png', fullPage: true });
    console.log('📸 Page 6 screenshot saved');

    stepResults.push({
      step: 10,
      name: 'Page 6 - Provisional Assessment',
      status: 'passed',
      sections: {
        mdr: hasMDRSection,
        aiAct: hasAIActSection,
        gdpr: hasGDPRSection,
        documentation: hasDocSection,
        tefServices: hasTEFSection
      }
    });

    // ================== STEP 11: Page 6 → Page 7 Navigation ==================
    console.log('\n🔵 STEP 11: Navigating from Page 6 to Page 7...');
    const nextButtonPage6 = page.locator('button:has-text("Next")');
    const isDisabledPage6 = await nextButtonPage6.isDisabled();
    console.log(`📊 Next button on page 6 disabled: ${isDisabledPage6}`);

    if (isDisabledPage6) {
      console.log('❌ ERROR: Next button is disabled on page 6!');
      stepResults.push({ step: 11, name: 'Page 6 → Page 7 Navigation', status: 'failed', error: 'Next button disabled' });
      throw new Error('Next button is disabled on page 6');
    }

    await nextButtonPage6.click();
    await page.waitForTimeout(2000);

    // ================== STEP 12: Page 7 - Review & Complete ==================
    console.log('\n🔵 STEP 12: Page 7 - Review & Complete...');
    await page.waitForSelector('h6:has-text("Review & Complete")', { timeout: 10000 });
    console.log('✅ Page 7 loaded');

    // Check for summary information
    const hasSummary = await page.locator('text=Provisional Assessment Results').count() > 0;
    console.log(`📊 Summary visible: ${hasSummary ? '✅' : '❌'}`);

    // Take screenshot of page 7
    await page.screenshot({ path: 'complete-flow-page7.png', fullPage: true });
    console.log('📸 Page 7 screenshot saved');

    stepResults.push({ step: 12, name: 'Page 7 - Review & Complete', status: 'passed', hasSummary });

    // ================== SUCCESS ==================
    console.log('\n✅ ========================================');
    console.log('✅ COMPLETE FLOW TEST PASSED!');
    console.log('✅ Successfully navigated through all 7 pages');
    console.log('✅ ========================================\n');

    // ================== PAUSE FOR INSPECTION ==================
    console.log('⏸️  Browser will stay open for 60 seconds for inspection...');
    console.log('   Navigate around the app to verify everything looks correct.');
    console.log('   Press Ctrl+C to exit early, or wait for auto-close.');
    await page.waitForTimeout(60000); // Keep browser open for 60 seconds

    // Print summary
    console.log('📋 Test Summary:');
    stepResults.forEach(result => {
      const statusIcon = result.status === 'passed' ? '✅' : '❌';
      console.log(`${statusIcon} Step ${result.step}: ${result.name}`);
    });

  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ COMPLETE FLOW TEST FAILED');
    console.error('❌ ========================================');
    console.error('Error:', error);

    // Take error screenshot
    await page.screenshot({ path: 'complete-flow-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: complete-flow-error.png');

    throw error;
  } finally {
    // Write console logs to markdown file
    const logFilePath = path.join(process.cwd(), 'console_logs_playwright.md');
    const logContent = `# Playwright Console Logs - Complete Flow Test (Pages 1-7)\n\n` +
      `**Test Run:** ${new Date().toISOString()}\n\n` +
      `## Test Results Summary\n\n` +
      stepResults.map(r => `- **Step ${r.step}:** ${r.name} - ${r.status.toUpperCase()}`).join('\n') +
      `\n\n## Console Output\n\n` +
      `\`\`\`\n${consoleLogs.join('\n')}\n\`\`\`\n`;

    fs.writeFileSync(logFilePath, logContent);
    console.log(`\n📝 Console logs saved to: ${logFilePath}`);
  }
});
