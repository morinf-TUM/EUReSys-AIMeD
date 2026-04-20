import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, Paper, CircularProgress, Alert, AlertTitle, TextField } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Warning, HelpOutline } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import apiService from '../services/api';
import { RegulatoryProfile, RegulatoryQuestion, RegulatoryAnswer, DeviceClassification } from '../types/regulatory';

const steps = [
  'Device Information',
  'Intended Purpose',
  'MDR Classification',
  'Additional Information',
  'Provisional Assessment'
];

const RegulatoryScoping: React.FC = () => {
  console.log('RegulatoryScoping component function called');
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize profile state without localStorage interference
  const [initialProfile] = useState({
    deviceName: '',
    deviceDescription: '',
    intendedPurpose: '',
    llmComment: ''
  });
  
  const [activeStep, setActiveStep] = useState(() => {
    const stepParam = searchParams.get('step');
    // Convert 1-based URL parameter to 0-based internal index
    const initialStep = stepParam ? Math.min(Math.max(parseInt(stepParam, 10) - 1, 0), steps.length - 1) : 0;
    console.log('Initial activeStep set to:', initialStep);
    return initialStep;
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Partial<RegulatoryProfile>>(initialProfile);
  const [questions, setQuestions] = useState<RegulatoryQuestion[]>([]);
  const [answers, setAnswers] = useState<RegulatoryAnswer[]>([]);
  const [classificationResult, setClassificationResult] = useState<DeviceClassification | null>(null);
  const [llmAssessment, setLlmAssessment] = useState<string | null>(null);
  const [additionalInfoQuestions, setAdditionalInfoQuestions] = useState<string[]>([]);
  const [additionalInfoAnswers, setAdditionalInfoAnswers] = useState<Record<string, string>>({});
  const [provisionalAssessment, setProvisionalAssessment] = useState<any>(null);
  const navigate = useNavigate();

  // Debug: Track component mounts and unmounts
  useEffect(() => {
    console.log('✅ RegulatoryScoping component MOUNTED');
    console.log('Initial profile state:', profile);
    
    return () => {
      console.log('❌ RegulatoryScoping component UNMOUNTED');
    };
  }, [profile]);

  // Debug: Track profile changes
  useEffect(() => {
    console.log('Profile state changed:', profile);
    console.log('Profile.llmComment changed to:', profile.llmComment);
    console.log('Profile.llmComment is truthy:', !!profile.llmComment);
  }, [profile]);

  // Debug: Track activeStep changes
  useEffect(() => {
    console.log('ActiveStep changed to:', activeStep);
    console.log('Current profile when activeStep changed:', profile);
  }, [activeStep, profile]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching questions for step:', activeStep + 1);
        console.log('Current API token:', apiService['token']);
        
        const response = await apiService.getRegulatoryQuestions(activeStep + 1);
        
        if (response.success && response.data) {
          // Handle nested response structure
          const responseData = response.data;
          const questionsData = Array.isArray(responseData) ? responseData : (responseData as any).data || [];
          setQuestions(Array.isArray(questionsData) ? questionsData : []);
          console.log('Questions loaded:', questionsData);
        } else {
          setError(response.error || 'Failed to load regulatory questions');
          setQuestions([]);
          console.error('Failed to load questions:', response.error || 'Unknown error');
        }
      } catch (err) {
        setError('Failed to load regulatory questions. Please try again.');
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeStep < steps.length - 1) {
      fetchQuestions();
    }
  }, [activeStep]);

  // Automatic classification generation for MDR Classification step
  console.log("MDR Classification: Starting automatic generation, activeStep:", activeStep);

  useEffect(() => {
    console.log('🔍 PROFILE CHECK', {
        activeStep,
        deviceName: profile.deviceName,
        intendedPurpose: profile.intendedPurpose,
        classificationResult
    });
    console.log('🔄 useEffect triggered for classification generation');
    console.log('useEffect - activeStep:', activeStep);
    console.log('useEffect - classificationResult:', classificationResult);
    console.log('useEffect - profile.deviceName:', profile.deviceName);
    console.log('useEffect - profile.intendedPurpose:', profile.intendedPurpose);
    console.log('useEffect - profile.classification:', profile.classification);
    

    
    const generateClassification = async () => {
    console.log("Checking conditions:", { activeStep, classificationResult, profileDeviceName: profile.deviceName, profileIntendedPurpose: profile.intendedPurpose });
      // Only generate classification for MDR Classification step (step 3, index 2)
      const condition1 = activeStep === 2;
      const condition2 = !classificationResult || 
                         (classificationResult && classificationResult.mdrApplicable === true 
                          //&& 
                          //classificationResult.aiActApplicable === false && 
                          //classificationResult.gdprApplicable === false
                        );
      const condition3 = !!profile.deviceName;
      const condition4 = !!profile.intendedPurpose;
      
      console.log('Condition checks:', {
        condition1: condition1,
        condition2: condition2,
        condition3: condition3,
        condition4: condition4
      });
      if (!(classificationResult === null)) {
        console.log('classificationResult: ', !(classificationResult === null)? classificationResult : 'null');
        console.log('Condition2 components:', {
          c1: !classificationResult,
          c2: classificationResult && classificationResult.mdrApplicable === false,
          //c3: classificationResult && classificationResult.aiActApplicable === false,
          //c4: classificationResult && classificationResult.gdprApplicable === false
        });
      }

      if (condition1 && condition2 && condition3 && condition4) {
        try {
          setLoading(true);
          // console.log('Generating automatic MDR classification');
          
          // console.log('Calling getRecommendation with:');
          // console.log('Device info:', {
          //   deviceName: profile.deviceName,
          //   deviceDescription: profile.deviceDescription || '',
          //   isMedicalPurpose: true,
          //   usesAI: true
          // });
          // console.log('Intended purpose:', profile.intendedPurpose);
          
          // // Get recommendation from engine
          // console.log('🔴 DEBUG: about to call getRecommendation with:', {
          //   deviceName: profile.deviceName,
          //   deviceDescription: profile.deviceDescription || '',
          //   isMedicalPurpose: true,
          //   usesAI: true,
          //   intendedPurpose: profile.intendedPurpose || ''
          // });
          
          console.log('Generating LLM-based classification');
          const recommendationResponse = await apiService.getRecommendation(
            {
              deviceName: profile.deviceName,
              deviceDescription: profile.deviceDescription || '',
              isMedicalPurpose: true,
              usesAI: true
            },
            profile.intendedPurpose || ''
          );
          
          console.log('🔴 DEBUG: Recommendation response received:', recommendationResponse);
          console.log('🔴 DEBUG: Recommendation response success?', recommendationResponse.success);
          console.log('🔴 DEBUG: Recommendation response data:', recommendationResponse.data);
          
          if (!recommendationResponse.success) {
            console.error('Recommendation failed:', recommendationResponse.error);
            // Try to continue with default values if API fails
            const classification: DeviceClassification = {
              mdrApplicable: false,
              mdrClass: 'Not Applicable' as 'I' | 'IIa' | 'IIb' | 'III' | 'Not Applicable',
              mdrRules: [],
              mdrJustification: ['API call failed,getRecommendation( using default classification'],
              aiActApplicable: false,
              aiActHighRisk: false,
              gdprApplicable: false,
              gdprRequiresDPIA: false,
              overallComplianceStatus: 'Undetermined' as 'Conditional'
            };
            
            const llmComment = `LLM Comment Generation Failed: ${recommendationResponse.error}`;
            
            const updatedProfile = {...profile, llmComment: llmComment};
            setProfile(updatedProfile);
            setClassificationResult(classification);
            
            return; // Exit early if API fails
          }
          

          if (recommendationResponse.success) {
            const recommendation = recommendationResponse.data;
            console.log("Recommendation data:", recommendation);
            console.log("Recommendation-lassi mdr_classification:", recommendation?.mdr_classification);
            console.log("Recommendation ai_act_classification:", recommendation?.ai_act_classification);
            console.log("Recommendation gdpr_requirements:", recommendation?.gdpr_requirements);
            console.log("About to format LLM comment");

            // Debug: Check if recommendation data is valid
            if (!recommendation?.mdr_classification) {
              console.error('ERROR: mdr_classification is missing from recommendation');
            }
            if (!recommendation?.ai_act_classification) {
              console.error('ERROR: ai_act_classification is missing from recommendation');
            }
            if (!recommendation?.gdpr_requirements) {
              console.error('ERROR: gdpr_requirements is missing from recommendation');
            }
            
            // Convert recommendation to classification format
            const classification: DeviceClassification = {
              mdrApplicable: recommendation.mdr_classification !== 'Not applicable',
              mdrClass: recommendation.mdr_classification as 'I' | 'IIa' | 'IIb' | 'III' | 'Not Applicable',
              mdrRules: recommendation.regulatory_references?.mdr || [],
              mdrJustification: recommendation.justification || [],
              aiActApplicable: recommendation.ai_act_classification !== 'Not applicable',
              aiActHighRisk: recommendation.ai_act_classification === 'High-risk',
              gdprApplicable: recommendation.gdpr_requirements === 'DPIA required',
              gdprRequiresDPIA: recommendation.gdpr_requirements === 'DPIA required',
              overallComplianceStatus: 'Conditional' as 'Conditional'
            };
            
            // Use only real LLM verification comment from backend - NO MOCK FALLBACK
            const llmComment = recommendation.llm_verification_comment;
            
            console.log('🔴 DEBUG: Generated LLM comment:', llmComment);
            console.log('🔴 DEBUG: LLM comment length:', llmComment ? llmComment.length : 'undefined');
            console.log('🔴 DllmCommentEBUG: LLM comment is truthy:', !!llmComment);
            console.log('🔴 DEBUG: LLM verification comment from backend:', recommendation.llm_verification_comment);
            console.log('🔴 DEBUG: Using real LLM comment:', !!recommendation.llm_verification_comment);
            
            // Debug: Check if LLM comment is present
            if (llmComment) {
              console.log('✅ Real LLM verification comment received from backend');
              console.log('LLM comment type:', typeof llmComment);
              console.log('LLM comment is string:', typeof llmComment === 'string');
            } else {
              console.log('ℹ️ No LLM verification comment available (Mistral not running)');
            }
            
            // Store results in profile state
            const updatedProfile = {
              ...profile,
              llmComment: llmComment,
              classification: classification
            };
            console.log('🔴 DEBUG: Updated profile with LLM comment and classification:', updatedProfile);
            console.log('🔴 DEBUG: Updated profile llmComment:', updatedProfile.llmComment);
            console.log('🔴 DEBUG: Updated profile llmComment length:', updatedProfile.llmComment ? updatedProfile.llmComment.length : 'undefined');
            console.log('🔴 DEBUG: Updated profile classification:', updatedProfile.classification);
            
            console.log('🔴 DEBUG: BEFORE setProfile - current profile.llmComment:', profile.llmComment);
            console.log('🔴 DEBUG: BEFORE setProfile - current profile.llmComment length:', profile.llmComment ? profile.llmComment.length : 'undefined');
            
            // Update both profile and classification state
            setProfile(updatedProfile);
            setClassificationResult(classification);
            
            console.log('🔴 DEBUG: AFTER setProfile call - should trigger re-render');
            
            // Debug: Check if the updates actually happen
            setTimeout(() => {
              console.log('Delayed check - profile.llmComment:', updatedProfile.llmComment);
              console.log('Delayed check - profile.classification:', updatedProfile.classification);
            }, 1000);
            
            // Debug: Check if classification result was set
            console.log('Classification result set:', classification);
            
          } else {
            console.error('Failed to generate automatic classification:', recommendationResponse.error);
          }
          } catch (err) {
            console.error('Error generating automatic classification:', err);
          } finally {
            setLoading(false);
            console.log('Classification generation completed, loading set to false');
          }
          } else {
            console.log('Classification generation skipped. Conditions not met.');
            console.log('Active step:', activeStep, 'Expected: 2');
            console.log('Has classification result:', !!classificationResult);
            console.log('Has device name:', !!profile.deviceName);
            console.log('Has intended purpose:', !!profile.intendedPurpose);
          }
    };
    
    console.log('About to call generateClassification()');
    generateClassification();
    console.log('generateClassification() called');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, profile.deviceName, profile.intendedPurpose]);

  console.log('🔴 DEBUG: RegulatoryScoping component rendered');
  console.log('🔴 DEBUG: Current activeStep:', activeStep);
  console.log('🔴 DEBUG: Current profile.deviceName:', profile.deviceName);
  console.log('🔴 DEBUG: Current profile.intendedPurpose:', profile.intendedPurpose);
  console.log('🔴 DEBUG: Current profile.llmComment:', profile.llmComment);
  console.log('🔴 DEBUG: Current profile.llmComment length:', profile.llmComment ? profile.llmComment.length : 'undefined');
  console.log('🔴 DEBUG: Current classificationResult:', classificationResult);
  console.log('🔴 DEBUG: Profile llmComment is truthy:', !!profile.llmComment);
  
  // Helper function to extract questions from LLM assessment
  const extractQuestionsFromAssessment = (assessment: string): string[] => {
    try {
      console.log('Extracting questions from assessment:', assessment);
      
      if (!assessment || typeof assessment !== 'string') {
        console.log('Invalid assessment format');
        return [];
      }
      
      // Look for the "List of Questions for User:" section (case insensitive, flexible formatting)
      const questionsSectionMatch = assessment.match(/#+\s*List of Questions for User:\s*([\s\S]*)/i);
      
      if (!questionsSectionMatch) {
        console.log('No questions section found in assessment');
        // Try alternative patterns
        const alternativeMatches = assessment.match(/\d+\.\s*[^\n]+/g);
        if (alternativeMatches) {
          console.log('Found questions using alternative pattern');
          return alternativeMatches.map(match => match.replace(/^\d+\.\s*/, '').trim());
        }
        return [];
      }
      
      const questionsSection = questionsSectionMatch[1];
      
      // Extract individual questions (they start with numbers like "1. " or "2. ")
      const questionMatches = questionsSection.match(/\d+\.\s*([^\n]+)/g);
      
      if (!questionMatches) {
        console.log('No individual questions found in questions section');
        // Try to extract any numbered items from the entire assessment
        const fallbackMatches = assessment.match(/\d+\.\s*[^\n]+/g);
        if (fallbackMatches) {
          console.log('Found questions using fallback pattern');
          return fallbackMatches.map(match => match.replace(/^\d+\.\s*/, '').trim());
        }
        return [];
      }
      
      // Clean up the questions by removing the numbering
      const questions = questionMatches.map(match => {
        return match.replace(/^\d+\.\s*/, '').trim();
      });
      
      console.log('Extracted questions:', questions);
      return questions.filter(q => q.length > 0); // Filter out empty questions
    } catch (error) {
      console.error('Error extracting questions:', error);
      return [];
    }
  };

  // Debug: Check if profile is being reset
  if (activeStep === 2 && !profile.deviceName) {
    console.error('❌ PROFILE RESET DETECTED: profile.deviceName is empty on MDR Classification step');
  }
  if (activeStep === 2 && !profile.intendedPurpose) {
    console.error('❌ PROFILE RESET DETECTED: profile.intendedPurpose is empty on MDR Classification step');
  }


  const handleAnswerChange = (questionId: string, answer: string | boolean | number) => {
    console.log('Answer change:', questionId, answer);
    setAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      
      if (existingAnswerIndex >= 0) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = {
          ...updatedAnswers[existingAnswerIndex],
          answer
        };
        console.log('Updated answer:', questionId, answer);
        return updatedAnswers;
      } else {
        const newAnswer = {
          questionId,
          answer
        };
        console.log('Added new answer:', newAnswer);
        return [...prevAnswers, newAnswer];
      }
    });
  };

  const handleNext = async () => {
    console.log('handleNext called, current activeStep:', activeStep);
    setIsSubmitting(true);

    // Special handling for moving from Device Information to Intended Purpose
    // Extract device information from answers and update profile
    if (activeStep === 0) {
      console.log('Moving from Device Information to Intended Purpose');
      console.log('Current answers:', answers);
      
      // Extract device name and description from answers
      const deviceNameAnswer = answers.find(a => a.questionId === 'q1');
      const deviceDescriptionAnswer = answers.find(a => a.questionId === 'q2');
      
      console.log('Device name answer:', deviceNameAnswer);
      console.log('Device description answer:', deviceDescriptionAnswer);
      
      // Ensure we only assign string values to profile fields
      const deviceName = typeof deviceNameAnswer?.answer === 'string' ? deviceNameAnswer.answer : profile.deviceName;
      const deviceDescription = typeof deviceDescriptionAnswer?.answer === 'string' ? deviceDescriptionAnswer.answer : profile.deviceDescription;
      
      if (deviceNameAnswer || deviceDescriptionAnswer) {
        const updatedProfile = {
          ...profile,
          deviceName: deviceName,
          deviceDescription: deviceDescription
        };
        
        console.log('Updated profile with device info:', updatedProfile);
        console.log('Before setProfile - current profile:', profile);
        setProfile(updatedProfile);
        
        console.log('After setProfile call - profile should be updated');
        
        // Debug: Check if the profile was actually updated
        setTimeout(() => {
          console.log('Delayed check - profile after update:', profile);
        }, 1000);
      } else {
        console.log('No device info to update - deviceNameAnswer:', deviceNameAnswer, 'deviceDescriptionAnswer:', deviceDescriptionAnswer);
      }
    }

    // Special handling for moving from Intended Purpose to MDR Classification
    // The intended purpose is stored directly in profile state, not in answers
    if (activeStep === 1) {
      console.log('Moving from Intended Purpose to MDR Classification');
      console.log('Current profile intended purpose:', profile.intendedPurpose);
      console.log('Current profile device name:', profile.deviceName);
      console.log('Current profile device description:', profile.deviceDescription);
      console.log('Full profile before navigation:', profile);
      
      // Make sure intended purpose is set
      if (!profile.intendedPurpose) {
        setError('Please provide the intended purpose before proceeding.');
        setIsSubmitting(false);
        return;
      }

      // Make sure device name is set
      if (!profile.deviceName) {
        setError('Device name is missing. Please go back and provide device information.');
        setIsSubmitting(false);
        return;
      }
      

    }

    // Special handling for MDR Classification step (step 2, index 2)
    // This step displays results, not questions, so no answers to submit
    if (activeStep === 2) {
      // Check if we have classification results
      if (!classificationResult) {
        setError('Please generate MDR classification before proceeding.');
        return;
      }

      // Generate LLM assessment for Additional Information step
      try {
        // Move to next step and set loading
        const newStep = activeStep + 1;
        setActiveStep(newStep);
        setSearchParams({ step: (newStep + 1).toString() });
        setLoading(true);
        setError('');

        console.log('Generating LLM assessment for input quality...');

        // Prepare base data for LLM assessment
        const baseData = {
          deviceName: profile.deviceName,
          deviceDescription: profile.deviceDescription,
          intendedPurpose: profile.intendedPurpose,
          mdr_classification: classificationResult.mdrClass,
          ai_act_classification: classificationResult.aiActHighRisk ? 'High-risk' : 'Not high-risk',
          gdpr_requirements: classificationResult.gdprRequiresDPIA ? 'DPIA required' : 'Standard compliance',
          justification: profile.llmComment ? [profile.llmComment] : [],
          regulatory_references: {
            mdr: classificationResult.mdrRules || [],
            ai_act: [],
            gdpr: []
          }
        };
        
        console.log('Calling getInputQualityAssessment with:', baseData);
        
        // Call LLM assessment API
        const assessmentResponse = await apiService.getInputQualityAssessment(baseData);
        
        console.log('LLM assessment response:', assessmentResponse);
        
        if (assessmentResponse.success && assessmentResponse.data) {
          const assessment = assessmentResponse.data.llm_assessment;
          console.log('LLM assessment received:', assessment);
          setLlmAssessment(assessment);
          
          // Extract questions from the assessment for the Additional Information page
          const extractedQuestions = extractQuestionsFromAssessment(assessment);
          console.log('Extracted questions:', extractedQuestions);
          
          // If no questions were extracted, use comprehensive default questions to ensure the step works
          const finalQuestions = extractedQuestions.length > 0 
            ? extractedQuestions 
            : [
                'Please provide any additional technical specifications or features of your device that were not covered in previous steps.',
                'Describe the intended use environment and any specific operational requirements for the device.',
                'What clinical validation or testing has been performed on this device? Please provide details on methodologies and results.',
                'Are there any known limitations, contraindications, or potential risks associated with this device?',
                'Describe the data security and privacy measures implemented for this device, especially regarding patient data.'
              ];
          
          console.log('Final questions set:', finalQuestions);
          
          setAdditionalInfoQuestions(finalQuestions);
          console.log('Final questions to be used:', finalQuestions);
        } else {
          setError(assessmentResponse.error || 'Failed to generate input quality assessment');
        }
      } catch (err) {
        setError('Failed to generate input quality assessment. Please try again.');
        console.error('Error generating LLM assessment:', err);
      } finally {
        setLoading(false);
        setIsSubmitting(false);
      }
      return;
    }

    // Special handling for Additional Information step (step 4, index 3)
    if (activeStep === 3) {
      // Check if we have additional info questions
      if (additionalInfoQuestions.length === 0) {
        setError('No additional information questions available.');
        setIsSubmitting(false);
        return;
      }

      // Generate provisional assessment with additional information (allow empty answers)
      try {
        // Move to next step and set loading
        const newStep = activeStep + 1;
        setActiveStep(newStep);
        setSearchParams({ step: (newStep + 1).toString() });
        setLoading(true);
        setError('');

        console.log('Generating provisional assessment with additional information...');
        
        // Prepare base data with additional information
        const baseData = {
          deviceName: profile.deviceName,
          deviceDescription: profile.deviceDescription,
          intendedPurpose: profile.intendedPurpose,
          mdr_classification: classificationResult?.mdrClass,
          ai_act_classification: classificationResult?.aiActHighRisk ? 'High-risk' : 'Not high-risk',
          gdpr_requirements: classificationResult?.gdprRequiresDPIA ? 'DPIA required' : 'Standard compliance',
          justification: profile.llmComment ? [profile.llmComment] : [],
          regulatory_references: {
            mdr: classificationResult?.mdrRules || [],
            ai_act: [],
            gdpr: []
          },
          additional_information: {
            questions: additionalInfoQuestions,
            answers: additionalInfoAnswers
          }
        };
        
        console.log('Calling getProvisionalAssessment with:', baseData);
        
        // Call provisional assessment API
        const assessmentResponse = await apiService.getProvisionalAssessment(baseData);
        
        console.log('Provisional assessment response:', assessmentResponse);
        
        if (assessmentResponse.success && assessmentResponse.data) {
          const assessment = assessmentResponse.data;
          console.log('Provisional assessment received:', assessment);
          setProvisionalAssessment(assessment);
        } else {
          setError(assessmentResponse.error || 'Failed to generate provisional assessment');
        }
      } catch (err) {
        setError('Failed to generate provisional assessment. Please try again.');
        console.error('Error generating provisional assessment:', err);
      } finally {
        setLoading(false);
        setIsSubmitting(false);
      }
      return;
    }

    // Special handling for Provisional Assessment step (now the final step)
    // Since Review & Complete is removed, complete the process and navigate to profiles
    if (activeStep === 4) {
      console.log('[RegulatoryScoping] Completing scoping process - storing temporarily and navigating to profiles');
      console.log('[RegulatoryScoping] provisionalAssessment:', provisionalAssessment);
      console.log('[RegulatoryScoping] classificationResult:', classificationResult);
      console.log('[RegulatoryScoping] profile:', profile);

      // Prepare complete evaluation data
      let finalClassification: DeviceClassification;
      if (provisionalAssessment) {
        finalClassification = {
          mdrApplicable: provisionalAssessment.mdr_applicable || false,
          mdrClass: provisionalAssessment.mdr_classification as 'I' | 'IIa' | 'IIb' | 'III' | 'Not Applicable',
          mdrRules: provisionalAssessment.mdr_rules || [],
          mdrJustification: provisionalAssessment.mdr_justification || [],
          aiActApplicable: provisionalAssessment.ai_act_classification !== 'Not applicable',
          aiActHighRisk: provisionalAssessment.ai_act_high_risk || false,
          aiActJustification: provisionalAssessment.ai_act_justification ? [provisionalAssessment.ai_act_justification] : [],
          aiActAnnexReference: provisionalAssessment.ai_act_annex_reference || undefined,
          gdprApplicable: provisionalAssessment.gdpr_requirements !== 'Not applicable',
          gdprRequiresDPIA: provisionalAssessment.gdpr_requires_dpia || false,
          gdprJustification: provisionalAssessment.gdpr_justification ? [provisionalAssessment.gdpr_justification] : [],
          gdprLegalBases: provisionalAssessment.gdpr_legal_bases || [],
          overallComplianceStatus: 'Conditional' as 'Conditional'
        };
      } else if (classificationResult) {
        finalClassification = classificationResult;
      } else if (profile.classification) {
        finalClassification = profile.classification;
      } else {
        finalClassification = {
          mdrApplicable: false,
          aiActApplicable: false,
          gdprApplicable: false,
          overallComplianceStatus: 'Undetermined' as 'Undetermined'
        };
      }

      const evaluationData: RegulatoryProfile = {
        id: 'temp-' + Date.now(),
        deviceName: profile.deviceName || '',
        deviceDescription: profile.deviceDescription || '',
        intendedPurpose: profile.intendedPurpose || '',
        classification: finalClassification,
        llmComment: profile.llmComment,
        llmAssessment: provisionalAssessment?.llm_assessment || llmAssessment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft' as 'draft'
      };

      console.log('[RegulatoryScoping] ✅ Created evaluation data:', evaluationData);
      console.log('[RegulatoryScoping] Evaluation has deviceName:', evaluationData.deviceName);
      console.log('[RegulatoryScoping] Evaluation has classification:', evaluationData.classification);
      console.log('[RegulatoryScoping] Evaluation has llmAssessment:', evaluationData.llmAssessment);

      // Store in sessionStorage (temporary, cleared on logout/close)
      sessionStorage.setItem('latestEvaluation', JSON.stringify(evaluationData));
      console.log('[RegulatoryScoping] ✅ Stored in sessionStorage');

      // Verify it was stored
      const verify = sessionStorage.getItem('latestEvaluation');
      console.log('[RegulatoryScoping] Verification - sessionStorage contains data:', !!verify);

      // Remove step parameter when completing
      setSearchParams({});

      // Navigate to profiles with the evaluation data
      console.log('[RegulatoryScoping] ✅ Navigating to /profiles with state');
      navigate('/profiles', { state: { evaluation: evaluationData } });

      setIsSubmitting(false);
      return;
    }

    // For other steps, check if required questions are answered
    const requiredQuestions = questions.filter(q => q.required);
    const answeredRequiredQuestions = answers.filter(a => 
      requiredQuestions.some(q => q.id === a.questionId)
    );

    console.log('Required questions:', requiredQuestions);
    console.log('Answers:', answers);
    console.log('Answered required questions:', answeredRequiredQuestions);

    if (answeredRequiredQuestions.length < requiredQuestions.length) {
      setError('Please answer all required questions before proceeding.');
      setIsSubmitting(false);
      return;
    }

    // Submit answers for current step
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.submitRegulatoryAnswers('temp-profile-id', answers);
      
      if (response.success && response.data) {
        setClassificationResult(response.data);
        const newStep = activeStep + 1;
        setActiveStep(newStep);
        // Update URL with new step parameter (1-based for backend compatibility)
        setSearchParams({ step: (newStep + 1).toString() });
      } else {
        setError(response.error || 'Failed to submit answers');
      }
    } catch (err) {
      setError('Failed to submit answers. Please try again.');
      console.error('Error submitting answers:', err);
    } finally {
      setLoading(false);
    }
    setIsSubmitting(false);
  };

  const handleBack = () => {
    const newStep = activeStep - 1;
    setActiveStep(newStep);
    // Update URL with 1-based step parameter
    setSearchParams({ step: (newStep + 1).toString() });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Create or update regulatory profile
      // Use provisional assessment for classification if available (most complete)
      let finalClassification: DeviceClassification;
      if (provisionalAssessment) {
        finalClassification = {
          mdrApplicable: provisionalAssessment.mdr_applicable || false,
          mdrClass: provisionalAssessment.mdr_classification as 'I' | 'IIa' | 'IIb' | 'III' | 'Not Applicable',
          mdrRules: provisionalAssessment.mdr_rules || [],
          mdrJustification: provisionalAssessment.mdr_justification || [],
          aiActApplicable: provisionalAssessment.ai_act_classification !== 'Not applicable',
          aiActHighRisk: provisionalAssessment.ai_act_high_risk || false,
          gdprApplicable: provisionalAssessment.gdpr_requirements === 'DPIA required',
          gdprRequiresDPIA: provisionalAssessment.gdpr_requires_dpia || false,
          overallComplianceStatus: 'Conditional' as 'Conditional'
        };
      } else if (classificationResult) {
        finalClassification = classificationResult;
      } else if (profile.classification) {
        finalClassification = profile.classification;
      } else {
        finalClassification = {
          mdrApplicable: false,
          aiActApplicable: false,
          gdprApplicable: false,
          overallComplianceStatus: 'Undetermined' as 'Undetermined'
        };
      }

      const profileData: Omit<RegulatoryProfile, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        deviceName: profile.deviceName || '',
        deviceDescription: profile.deviceDescription || '',
        intendedPurpose: profile.intendedPurpose || '',
        classification: finalClassification,
        llmComment: profile.llmComment,
        llmAssessment: provisionalAssessment?.llm_assessment || llmAssessment
      };
      
      const response = await apiService.createRegulatoryProfile(profileData);
      
      if (response.success && response.data) {
        // Remove step parameter when completing
        setSearchParams({});
        // Navigate to results or documentation
        navigate('/profiles');
      } else {
        setError(response.error || 'Failed to save regulatory profile');
      }
    } catch (err) {
      setError('Failed to save regulatory profile. Please try again.');
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    console.log('renderStepContent called, activeStep:', activeStep);
    console.log('Current questions in state:', questions);
    console.log('Questions array length:', questions.length);
    
    switch (activeStep) {
      case 0: // Device Information
        console.log('Rendering Device Information step');
        console.log('Questions to render:', questions.map(q => ({id: q.id, type: q.answerType})));
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Device Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please provide basic information about your AI medical device.
            </Typography>
            
            {Array.isArray(questions) ? (
              <>
                {console.log('Rendering questions:', questions)}
                {questions.map(question => {
                  console.log('Rendering question:', question.id, question.text);
                  return (
                    <Box key={question.id} sx={{ mb: 3 }}>
                      <div>
                        <Typography variant="subtitle1" gutterBottom>
                          {question.text}
                        </Typography>
                        {question.helpText && (
                          <Typography variant="caption" color="text.secondary" paragraph>
                            {question.helpText}
                          </Typography>
                        )}
                        
                        {question.answerType === 'text' && (
                          <TextField
                            fullWidth
                            variant="outlined"
                            name={question.id}
                            value={answers.find(a => a.questionId === question.id)?.answer || ''}
                            onChange={(e) => {
                              console.log('Text field change:', question.id, e.target.value);
                              handleAnswerChange(question.id, e.target.value);
                            }}
                            disabled={loading}
                            required={question.required}
                          />
                        )}
                        
                        {question.answerType === 'boolean' && (
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                              variant={answers.find(a => a.questionId === question.id)?.answer === true ? 'contained' : 'outlined'}
                              onClick={() => handleAnswerChange(question.id, true)}
                              disabled={loading}
                            >
                              Yes
                            </Button>
                            <Button
                              variant={answers.find(a => a.questionId === question.id)?.answer === false ? 'contained' : 'outlined'}
                              onClick={() => handleAnswerChange(question.id, false)}
                              disabled={loading}
                            >
                              No
                            </Button>
                          </Box>
                        )}
                        
                        {question.answerType === 'multiple-choice' && question.options && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {question.options.map(option => (
                              <Button
                                key={option}
                                variant={answers.find(a => a.questionId === question.id)?.answer === option ? 'contained' : 'outlined'}
                                onClick={() => handleAnswerChange(question.id, option)}
                                disabled={loading}
                              >
                                {option}
                              </Button>
                            ))}
                          </Box>
                        )}
                      </div>
                    </Box>
                  );
                })}
              </>
            ) : (
              <>
                {console.error('Questions not array:', questions)}
                <Typography color="error">Failed to load questions. Please refresh the page.</Typography>
                <Typography variant="caption">Error: Questions data is not an array</Typography>
              </>
            )}
          </Box>
        );

      case 1: // Intended Purpose
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Intended Purpose
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Describe the intended medical purpose and functionality of your AI device.
            </Typography>
            
            <TextField
              fullWidth
              label="Intended Purpose"
              multiline
              rows={4}
              value={profile.intendedPurpose || ''}
              onChange={(e) => {
                console.log('Intended purpose changed:', e.target.value);
                setProfile({...profile, intendedPurpose: e.target.value});
              }}
              disabled={loading}
              required
              helperText="Describe what the device is intended to do, including specific medical conditions, patient populations, and clinical outcomes."
            />
          </Box>
        );






      case 2: // MDR Classification
        console.log('Rendering MDR Classification step');
        console.log('Current profile:', profile);
        console.log('Current classificationResult:', classificationResult);
        console.log('Profile llmComment:', profile.llmComment);
        console.log('Profile llmComment type:', typeof profile.llmComment);
        console.log('Profile llmComment length:', profile.llmComment ? profile.llmComment.length : 'undefined');
        console.log('Profile deviceName:', profile.deviceName);
        console.log('Profile intendedPurpose:', profile.intendedPurpose);
        console.log('Active step:', activeStep);
        
        // Debug: Check if llmComment is truthy
        if (profile.llmComment) {
          console.log('✅ profile.llmComment is truthy');
          console.log('First 100 chars:', profile.llmComment.substring(0, 100));
        } else {
          console.log('❌ profile.llmComment is falsy');
        }
        
        // Rest of MDR Classification rendering...
        return (
          <Box>
            {!classificationResult || !profile.llmComment ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Generating classification. Please wait a few seconds. If the answer does not appear in short order, this may indicate an issue with the classification generation process.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  MDR Classification Results
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Medical Device Regulation (EU 2017/745) classification based on your device information.
                </Typography>
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      MDR Classification: {classificationResult.mdrClass || 'Not Applicable'}
                    </Typography>
                  </Box>
                  
                  {classificationResult.mdrRules && classificationResult.mdrRules.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Applied Rules:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {classificationResult.mdrRules.map((rule, index) => (
                          <Typography key={index} variant="caption" sx={{ 
                            backgroundColor: 'primary.light', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1 
                          }}>
                            {rule}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Typography variant="body2" paragraph>
                    <strong>Classification:</strong> {classificationResult.mdrClass || 'Not Applicable'}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Applicability:</strong> {classificationResult.mdrApplicable ? 'MDR applies to this device' : 'MDR does not apply to this device'}
                  </Typography>
                  
                  {classificationResult.mdrJustification && classificationResult.mdrJustification.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Justification:</strong>
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {classificationResult.mdrJustification.map((justification, index) => (
                          <Typography key={index} variant="body2" paragraph sx={{ ml: 1 }}>
                            • {justification}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
                
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                  <AlertTitle>MDR Classification Guidance</AlertTitle>
                  This classification is based on MDR Annex VIII rules. Class {classificationResult.mdrClass || 'I'} devices have specific conformity assessment procedures and technical documentation requirements.
                </Alert>
                
                {profile.llmComment && typeof profile.llmComment === 'string' && profile.llmComment.length > 0 ? (
                  <Box sx={{ mb: 3, p: 3, backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Comment by Mistral AI:
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-line' }}>
                      {profile.llmComment}
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>LLM Comment Not Available</AlertTitle>
                    No LLM comment available yet. Please wait a few seconds. If the comment does not appear in short order, this may indicate an issue with the classification generation process.
                    {/*
                    <Typography variant="caption">
                      Debug: profile.llmComment = "{profile.llmComment}", classificationResult = {classificationResult ? 'exists' : 'null'}
                    </Typography>
                    <Typography variant="caption">
                      Debug: profile.llmComment type = "{typeof profile.llmComment}", length = {profile.llmComment ? profile.llmComment.length : 'undefined'}
                    </Typography>
                    <Typography variant="caption">
                      Debug: activeStep = {activeStep}, profile.deviceName = "{profile.deviceName}", profile.intendedPurpose = "{profile.intendedPurpose}"
                    </Typography>
                    */}
                  </Alert>
                )}
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  You can proceed to the next step to complete the AI Act and GDPR assessments.
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 3: // Additional Information
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please provide answers to the following questions to improve the accuracy of your regulatory assessment.
            </Typography>
            
            {loading || additionalInfoQuestions.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  The system is generating requests for additional information. Please wait a few seconds.
                </Typography>
              </Box>
            ) : additionalInfoQuestions.length > 0 ? (
              <Box>
                {additionalInfoQuestions.map((question, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {index + 1}. {question}
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={3}
                      value={additionalInfoAnswers[question] || ''}
                      onChange={(e) => {
                        setAdditionalInfoAnswers(prev => ({
                          ...prev,
                          [question]: e.target.value
                        }));
                      }}
                      disabled={loading}
                      required
                      helperText="Please provide as much detail as possible"
                    />
                  </Box>
                ))}
                
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                  <AlertTitle>Important</AlertTitle>
                  Your answers will be used to refine the regulatory assessment and generate a provisional classification report.
                </Alert>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" paragraph>
                  No additional information questions available.
                </Typography>
              </Box>
            )}
          </Box>
        );





      case 4: // Provisional Assessment
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Provisional Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This provisional assessment incorporates your additional information and provides an updated regulatory classification.
            </Typography>
            
            {loading || !provisionalAssessment ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  The system is now generating a provisional assessment.
                </Typography>
              </Box>
            ) : provisionalAssessment ? (
              <Box>
                {/* MDR Classification Section */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    MDR Classification
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      MDR Classification: {provisionalAssessment.mdr_classification || 'Not Applicable'}
                    </Typography>
                  </Box>
                  
                  {provisionalAssessment.mdr_rules && provisionalAssessment.mdr_rules.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Applied Rules:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {provisionalAssessment.mdr_rules.map((rule: string, index: number) => (
                          <Typography key={index} variant="caption" sx={{ 
                            backgroundColor: 'primary.light', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1 
                          }}>
                            {rule}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Typography variant="body2" paragraph>
                    <strong>Classification:</strong> {provisionalAssessment.mdr_classification || 'Not Applicable'}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Applicability:</strong> {provisionalAssessment.mdr_applicable ? 'MDR applies to this device' : 'MDR does not apply to this device'}
                  </Typography>
                  
                  {provisionalAssessment.mdr_justification && provisionalAssessment.mdr_justification.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Justification:</strong>
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {provisionalAssessment.mdr_justification.map((justification: string, index: number) => (
                          <Typography key={index} variant="body2" paragraph sx={{ ml: 1 }}>
                            • {justification}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
                
                {/* AI Act Classification Section */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    AI Act Classification
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Classification:</strong> {provisionalAssessment.ai_act_classification || 'Not Applicable'}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>High Risk:</strong> {provisionalAssessment.ai_act_high_risk ? 'Yes' : 'No'}
                  </Typography>
                  
                  {provisionalAssessment.ai_act_justification && (
                    <Typography variant="body2" paragraph>
                      <strong>Justification:</strong> {provisionalAssessment.ai_act_justification}
                    </Typography>
                  )}
                </Paper>
                
                {/* GDPR Requirements Section */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    GDPR Requirements
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>Requirements:</strong> {provisionalAssessment.gdpr_requirements || 'Not Applicable'}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    <strong>DPIA Required:</strong> {provisionalAssessment.gdpr_requires_dpia ? 'Yes' : 'No'}
                  </Typography>
                  
                  {provisionalAssessment.gdpr_justification && (
                    <Typography variant="body2" paragraph>
                      <strong>Justification:</strong> {provisionalAssessment.gdpr_justification}
                    </Typography>
                  )}
                </Paper>
                
                {/* LLM Assessment Section */}
                {provisionalAssessment.llm_assessment && (
                  <Box sx={{ mb: 3, p: 3, backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      LLM Assessment:
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-line' }}>
                      {provisionalAssessment.llm_assessment}
                    </Typography>
                  </Box>
                )}
                

                <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
                  <AlertTitle>Provisional Assessment</AlertTitle>
                  This is a provisional assessment based on the information provided. A final review by regulatory professionals is required before official submission.
                </Alert>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" paragraph>
                  No provisional assessment available. Please ensure you have completed the previous steps.
                </Typography>
              </Box>
            )}
          </Box>
        );


        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Complete
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Review your regulatory classification results before finalizing.
            </Typography>
            
            {provisionalAssessment ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Provisional Assessment Results:
                </Typography>
                
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      <strong>MDR Classification:</strong>
                    </Typography>
                    {provisionalAssessment.mdr_applicable ? (
                      <Typography variant="body1" color="primary">
                        Class {provisionalAssessment.mdr_classification}
                      </Typography>
                    ) : (
                      <Typography variant="body1">Not Applicable</Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      <strong>AI Act Classification:</strong>
                    </Typography>
                    {provisionalAssessment.ai_act_high_risk ? (
                      <Typography variant="body1" color="error">
                        High-Risk AI System
                      </Typography>
                    ) : (
                      <Typography variant="body1" color="success">
                        Not High-Risk
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      <strong>GDPR Requirements:</strong>
                    </Typography>
                    {provisionalAssessment.gdpr_requires_dpia ? (
                      <Typography variant="body1" color="warning">
                        DPIA Required
                      </Typography>
                    ) : (
                      <Typography variant="body1" color="success">
                        Standard Compliance
                      </Typography>
                    )}
                  </Box>
                  
                </Paper>
                
                {/* Show LLM assessment if available */}
                {provisionalAssessment.llm_assessment && (
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Final LLM Assessment:
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-line', fontSize: '0.875rem' }}>
                      {provisionalAssessment.llm_assessment}
                    </Typography>
                  </Box>
                )}
                
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                  <AlertTitle>Important Notice</AlertTitle>
                  This provisional assessment is based on the information provided and requires human review
                  by qualified regulatory professionals before official submission.
                </Alert>
              </Box>
            ) : classificationResult && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Classification Results:
                </Typography>
                
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      <strong>MDR Classification:</strong>
                    </Typography>
                    {classificationResult?.mdrApplicable ? (
                      <Typography variant="body1" color="primary">
                        Class {classificationResult?.mdrClass}
                      </Typography>
                    ) : (
                      <Typography variant="body1">Not Applicable</Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      <strong>AI Act Classification:</strong>
                    </Typography>
                    {classificationResult?.aiActApplicable ? (
                      classificationResult?.aiActHighRisk ? (
                        <Typography variant="body1" color="error">
                          High-Risk AI System
                        </Typography>
                      ) : (
                        <Typography variant="body1" color="success">
                          Not High-Risk
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body1">Not Applicable</Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      <strong>GDPR Requirements:</strong>
                    </Typography>
                    {classificationResult?.gdprApplicable ? (
                      classificationResult?.gdprRequiresDPIA ? (
                        <Typography variant="body1" color="warning">
                          DPIA Required
                        </Typography>
                      ) : (
                        <Typography variant="body1" color="success">
                          Standard Compliance
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body1">Not Applicable</Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      <strong>Overall Status:</strong>
                    </Typography>
                    {classificationResult?.overallComplianceStatus === 'Compliant' && (
                      <Typography variant="body1" color="success">
                        Compliant
                      </Typography>
                    )}
                    {classificationResult?.overallComplianceStatus === 'Conditional' && (
                      <Typography variant="body1" color="warning">
                        Conditional Compliance
                      </Typography>
                    )}
                    {classificationResult?.overallComplianceStatus === 'Non-Compliant' && (
                      <Typography variant="body1" color="error">
                        Non-Compliant
                      </Typography>
                    )}
                    {classificationResult?.overallComplianceStatus === 'Undetermined' && (
                      <Typography variant="body1">
                        Undetermined
                      </Typography>
                    )}
                  </Box>
                </Paper>
                
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                  <AlertTitle>Important Notice</AlertTitle>
                  This classification is based on the information provided and requires human review
                  by qualified regulatory professionals before official submission.
                </Alert>
              </Box>
            )}
            
            <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
              <AlertTitle>Conservative Interpretation</AlertTitle>
              This system always errs on the side of compliance. Some classifications may be more
              conservative than strictly necessary to ensure regulatory safety.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Regulatory Scoping Process
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
        This step-by-step process will guide you through the regulatory classification of your AI medical device
        according to MDR EU 2017/745, AI Act, and GDPR requirements.
      </Typography>

      <Alert severity="info" icon={<HelpOutline />} sx={{ mb: 3 }}>
        <AlertTitle>Guidance</AlertTitle>
        Answer each question to the best of your knowledge. You can return to previous steps at any time.
        All answers are saved automatically.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label} completed={activeStep > steps.indexOf(label)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {activeStep === 2 ?
                'No LLM comment available yet. Please wait a few seconds. If the comment does not appear in short order, this may indicate an issue with the classification generation process.'
                : activeStep === 3 ?
                'The system is generating requests for additional information. Please wait a few seconds.'
                : activeStep === 4 ?
                'The system is now generating a provisional assessment.'
                : 'Loading...'}
            </Typography>
          </Box>
        ) : (
          <Box>
            {renderStepContent()}
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
        
        <Button
          //type="button"
          variant="contained"
          onClick={(e) => {
            //setTimeout(() => alert("CLICK"), 0);
            console.log('🔴 DEBUG: Next button clicked, activeStep:', activeStep);
            //alert('Next button clicked!');
            handleNext();
          }}
          disabled={isSubmitting}
          endIcon={loading ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
        >
          {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </Box>
    </Box>
    //</Box>
  );
}

export default RegulatoryScoping;