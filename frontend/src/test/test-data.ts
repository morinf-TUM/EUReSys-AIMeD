/**
 * Pre-determined test data for regulatory scoping workflow
 */

export const TEST_CREDENTIALS = {
  email: 'test2@example.com',
  password: 'password123'
};

export const DEVICE_INFORMATION = {
  deviceName: 'CardioAI Smartwatch',
  deviceDescription: 'An AI-powered device for detecting cardiac abnormalities from smartwatch-integrated pseudo-ECG data using deep learning algorithms',
  isMedicalPurpose: true,
  usesAI: true,
  // Question IDs from backend mock data
  questionIds: {
    deviceName: 'q1',
    deviceDescription: 'q2', 
    isMedicalPurpose: 'q3',
    usesAI: 'q4'
  }
};

export const INTENDED_PURPOSE = {
  purpose: 'The CardioAI Analyzer is intended for use by heart disease patients to assist in the detection and classification of cardiac arrhythmias and other ECG abnormalities before adverse cardiac events actually happen. The device uses AI algorithms to analyze watch-based pseudo-ECG data and provide warning to the wearer and caregivers (through the latter s connected smartphones), but final clinical decision remains the responsibility of qualified medical personnel.',
  // Expected classification results based on our answers
  expectedClassification: {
    mdrApplicable: true,
    mdrClass: 'I',
    aiActApplicable: true,
    aiActHighRisk: true,
    gdprApplicable: true,
    gdprRequiresDPIA: true
  }
};

export const TEST_STEPS = {
  deviceInformation: {
    url: '/scoping',
    urlWithStep: '/scoping?step=1',
    title: 'Device Information',
    expectedElements: [
      'Device Name',
      'Device Description', 
      'Is your device intended to be used for medical purposes?',
      'Does your device incorporate or use artificial intelligence?'
    ]
  },
  intendedPurpose: {
    url: '/scoping?step=2',
    title: 'Intended Purpose',
    expectedElements: [
      'Intended Purpose'
    ]
  }
};

export const VALIDATION_TESTS = {
  emptyForm: {
    errorMessage: 'Please answer all required questions before proceeding.'
  },
  missingRequiredFields: {
    errorMessage: 'Please answer all required questions before proceeding.'
  }
};