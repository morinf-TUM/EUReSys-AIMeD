// Regulatory System Types
// Types for the EU AI Medical Device Regulatory System

export interface RegulatoryQuestion {
  id: string;
  text: string;
  regulation: 'MDR' | 'AI Act' | 'GDPR';
  reference: string;
  answerType: 'boolean' | 'multiple-choice' | 'text' | 'number';
  options?: string[];
  helpText?: string;
  required: boolean;
}

export interface RegulatoryAnswer {
  questionId: string;
  answer: string | boolean | number;
  justification?: string;
  citations?: string[];
}

export interface DeviceClassification {
  mdrApplicable: boolean;
  mdrClass?: 'I' | 'IIa' | 'IIb' | 'III' | 'Not Applicable';
  mdrRules?: string[];
  mdrJustification?: string[];
  
  aiActApplicable: boolean;
  aiActHighRisk?: boolean;
  aiActJustification?: string[];
  aiActAnnexReference?: string;
  
  gdprApplicable: boolean;
  gdprRequiresDPIA?: boolean;
  gdprLegalBases?: string[];
  gdprJustification?: string[];
  
  overallComplianceStatus: 'Compliant' | 'Conditional' | 'Non-Compliant' | 'Undetermined';
}

export interface RegulatoryProfile {
  id: string;
  deviceName: string;
  deviceDescription: string;
  intendedPurpose: string;
  classification: DeviceClassification;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'under-review' | 'approved' | 'archived';
  llmComment?: string; // Optional LLM comment
  llmAssessment?: string; // Optional LLM assessment
}

export interface DocumentSection {
  id: string;
  title: string;
  templateReference: string;
  content: string;
  citations: string[];
  status: 'draft' | 'review-required' | 'approved';
  requiresApproval: boolean;
}

export interface DocumentSet {
  id: string;
  regulatoryProfileId: string;
  documentType: 'technical-documentation' | 'clinical-evaluation' | 'risk-management' | 'quality-management';
  sections: DocumentSection[];
  version: number;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  citations?: string[];
}

export interface UserSession {
  token: string;
  userId: string;
  username: string;
  email: string;
  permissions: string[];
  expiresAt: string;
}

export interface ChangeImpactAssessment {
  id: string;
  changeDescription: string;
  affectedRegulations: ('MDR' | 'AI Act' | 'GDPR')[];
  impactAnalysis: string;
  requiredActions: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  modelType: string;
  modelId?: string;
  userId: string;
  timestamp: string;
  details: Record<string, unknown>;
  isSystemAction: boolean;
}

export interface RegulatorySource {
  reference: string;
  title: string;
  content: string;
  regulation: 'MDR' | 'AI Act' | 'GDPR';
  sourceType: 'article' | 'annex' | 'recital' | 'guidance';
}

export type RegulationType = 'MDR' | 'AI Act' | 'GDPR';

export interface StepProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  isComplete: boolean;
}