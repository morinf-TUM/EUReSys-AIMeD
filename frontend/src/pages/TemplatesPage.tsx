import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Divider, Alert, AlertTitle } from '@mui/material';
import { Download, Visibility, Info } from '@mui/icons-material';
import apiService from '../services/api';

// Define the template structure
interface TemplateItem {
  id: string;
  title: string;
  category: string;
  subsection?: string;
  fileName: string;
  description?: string;
}

// Organize templates according to the specified layout
const templates: TemplateItem[] = [
  // EU Medical Device Regulation (MDR 2017/745)
  // Quality Management System (QMS)
  {
    id: 'mdr-qms-1',
    title: 'Quality Manual',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'QMS_Quality_Manual_v2.md',
    description: 'Comprehensive quality management system manual'
  },
  {
    id: 'mdr-qms-2',
    title: 'Document Control Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Procedure for document control and version management'
  },
  {
    id: 'mdr-qms-3',
    title: 'Record Control Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Procedure for maintaining and controlling records'
  },
  {
    id: 'mdr-qms-4',
    title: 'Management Review Procedure & Minutes',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Management review process and meeting minutes template'
  },
  {
    id: 'mdr-qms-5',
    title: 'Internal Audit Procedure & Audit Reports',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Internal audit procedures and reporting templates'
  },
  {
    id: 'mdr-qms-6',
    title: 'Training Procedure & Training Records',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Training procedures and record-keeping templates'
  },
  {
    id: 'mdr-qms-7',
    title: 'Supplier Qualification & Monitoring Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Supplier qualification and monitoring procedures'
  },
  {
    id: 'mdr-qms-8',
    title: 'Risk Management Procedure (ISO 14971 aligned)',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'Risk_Management_File_v2.md',
    description: 'Risk management procedures aligned with ISO 14971'
  },
  {
    id: 'mdr-qms-9',
    title: 'Design & Development Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Design and development process procedures'
  },
  {
    id: 'mdr-qms-10',
    title: 'Change Control Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Change control and management procedures'
  },
  {
    id: 'mdr-qms-11',
    title: 'Corrective and Preventive Action (CAPA) Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'CAPA procedures for quality management'
  },
  {
    id: 'mdr-qms-12',
    title: 'Complaint Handling Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Complaint handling and resolution procedures'
  },
  {
    id: 'mdr-qms-13',
    title: 'Post-Market Surveillance (PMS) Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'Post_Market_Surveillance_Plan_v1.md',
    description: 'Post-market surveillance procedures'
  },
  {
    id: 'mdr-qms-14',
    title: 'Vigilance & Incident Reporting Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Vigilance and incident reporting procedures'
  },
  {
    id: 'mdr-qms-15',
    title: 'Clinical Evaluation Procedure',
    category: 'MDR',
    subsection: 'QMS',
    fileName: 'Clinical_Evaluation_Report_v1.md',
    description: 'Clinical evaluation procedures'
  },
  
  // Technical Documentation (Annex II & III)
  {
    id: 'mdr-tech-1',
    title: 'Device Description & Specification Template',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'Technical_Documentation_Annex_II_v1.md',
    description: 'Device description and specification template'
  },
  {
    id: 'mdr-tech-2',
    title: 'Intended Purpose & Indications for Use',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'Technical_Documentation_Annex_II_v1.md',
    description: 'Intended purpose and indications for use'
  },
  {
    id: 'mdr-tech-3',
    title: 'Classification Rationale',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'MDR_GSPR_Clause_Matrix_v1.md',
    description: 'Classification rationale and justification'
  },
  {
    id: 'mdr-tech-4',
    title: 'Essential Requirements / GSPR Checklist',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'GSPR_Checklist_v2.md',
    description: 'GSPR checklist for compliance verification'
  },
  {
    id: 'mdr-tech-5',
    title: 'Risk Management File (RMF)',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'Risk_Management_File_v2.md',
    description: 'Risk management file template'
  },
  {
    id: 'mdr-tech-6',
    title: 'Benefit-Risk Analysis',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Benefit-risk analysis template'
  },
  {
    id: 'mdr-tech-7',
    title: 'Verification & Validation Plan',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Verification and validation planning'
  },
  {
    id: 'mdr-tech-8',
    title: 'Software Lifecycle File (IEC 62304)',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'Software_Lifecycle_File_IEC62304_v1.md',
    description: 'Software lifecycle management file'
  },
  {
    id: 'mdr-tech-9',
    title: 'Usability Engineering File (IEC 62366)',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'Usability_Engineering_File_IEC62366_v1.md',
    description: 'Usability engineering file template'
  },
  {
    id: 'mdr-tech-10',
    title: 'Biocompatibility Evaluation Report (ISO 10993)',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Biocompatibility evaluation report'
  },
  {
    id: 'mdr-tech-11',
    title: 'Electrical Safety & EMC Reports (IEC 60601)',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Electrical safety and EMC reports'
  },
  {
    id: 'mdr-tech-12',
    title: 'Performance Evaluation Report',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Performance evaluation report template'
  },
  {
    id: 'mdr-tech-13',
    title: 'Clinical Evaluation Report (CER)',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'Clinical_Evaluation_Report_v1.md',
    description: 'Clinical evaluation report template'
  },
  {
    id: 'mdr-tech-14',
    title: 'Post-Market Surveillance Plan',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'Post_Market_Surveillance_Plan_v1.md',
    description: 'Post-market surveillance plan'
  },
  {
    id: 'mdr-tech-15',
    title: 'Periodic Safety Update Report (PSUR)',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Periodic safety update report template'
  },
  {
    id: 'mdr-tech-16',
    title: 'Post-Market Clinical Follow-up (PMCF) Plan & Report',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'PMCF plan and report template'
  },
  {
    id: 'mdr-tech-17',
    title: 'Labeling & IFU Template',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Labeling and instructions for use template'
  },
  {
    id: 'mdr-tech-18',
    title: 'UDI Assignment & Traceability File',
    category: 'MDR',
    subsection: 'Technical Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'UDI assignment and traceability file'
  },
  
  // Regulatory & Conformity
  {
    id: 'mdr-reg-1',
    title: 'Declaration of Conformity (DoC)',
    category: 'MDR',
    subsection: 'Regulatory & Conformity',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Declaration of conformity template'
  },
  {
    id: 'mdr-reg-2',
    title: 'Economic Operator Agreements (Manufacturer, AR, Importer)',
    category: 'MDR',
    subsection: 'Regulatory & Conformity',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Economic operator agreements templates'
  },
  {
    id: 'mdr-reg-3',
    title: 'Notified Body Communication File',
    category: 'MDR',
    subsection: 'Regulatory & Conformity',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Notified body communication file template'
  },
  {
    id: 'mdr-reg-4',
    title: 'EUDAMED Registration Dossier',
    category: 'MDR',
    subsection: 'Regulatory & Conformity',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'EUDAMED registration dossier template'
  },
  {
    id: 'mdr-reg-5',
    title: 'Market Surveillance Authority Communication Log',
    category: 'MDR',
    subsection: 'Regulatory & Conformity',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Market surveillance authority communication log'
  },
  
  // GDPR (EU 2016/679)
  // Data Governance
  {
    id: 'gdpr-gov-1',
    title: 'Data Protection Policy',
    category: 'GDPR',
    subsection: 'Data Governance',
    fileName: 'Data_Protection_Policy_v2.md',
    description: 'Comprehensive data protection policy'
  },
  {
    id: 'gdpr-gov-2',
    title: 'Privacy by Design & Default Procedure',
    category: 'GDPR',
    subsection: 'Data Governance',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Privacy by design and default procedures'
  },
  {
    id: 'gdpr-gov-3',
    title: 'Data Classification & Handling Policy',
    category: 'GDPR',
    subsection: 'Data Governance',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Data classification and handling policy'
  },
  {
    id: 'gdpr-gov-4',
    title: 'Records of Processing Activities (ROPA)',
    category: 'GDPR',
    subsection: 'Data Governance',
    fileName: 'ROPA_v1.md',
    description: 'Records of processing activities template'
  },
  {
    id: 'gdpr-gov-5',
    title: 'Lawful Basis Assessment Template',
    category: 'GDPR',
    subsection: 'Data Governance',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Lawful basis assessment template'
  },
  {
    id: 'gdpr-gov-6',
    title: 'Data Protection Impact Assessment (DPIA)',
    category: 'GDPR',
    subsection: 'Data Governance',
    fileName: 'DPIA_v2.md',
    description: 'Data protection impact assessment template'
  },
  {
    id: 'gdpr-gov-7',
    title: 'Legitimate Interest Assessment (LIA)',
    category: 'GDPR',
    subsection: 'Data Governance',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Legitimate interest assessment template'
  },
  
  // Security & IT
  {
    id: 'gdpr-sec-1',
    title: 'Information Security Policy',
    category: 'GDPR',
    subsection: 'Security & IT',
    fileName: 'Information_Security_Policy_v2.md',
    description: 'Information security policy template'
  },
  {
    id: 'gdpr-sec-2',
    title: 'Access Control Policy',
    category: 'GDPR',
    subsection: 'Security & IT',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Access control policy template'
  },
  {
    id: 'gdpr-sec-3',
    title: 'Encryption & Key Management Policy',
    category: 'GDPR',
    subsection: 'Security & IT',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Encryption and key management policy'
  },
  {
    id: 'gdpr-sec-4',
    title: 'Incident Response & Breach Notification Procedure',
    category: 'GDPR',
    subsection: 'Security & IT',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Incident response and breach notification procedures'
  },
  {
    id: 'gdpr-sec-5',
    title: 'Business Continuity & Disaster Recovery Plan',
    category: 'GDPR',
    subsection: 'Security & IT',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Business continuity and disaster recovery plan'
  },
  {
    id: 'gdpr-sec-6',
    title: 'Data Retention & Deletion Policy',
    category: 'GDPR',
    subsection: 'Security & IT',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Data retention and deletion policy'
  },
  
  // Data Subject Rights
  {
    id: 'gdpr-rights-1',
    title: 'Consent Management Procedure',
    category: 'GDPR',
    subsection: 'Data Subject Rights',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Consent management procedures'
  },
  {
    id: 'gdpr-rights-2',
    title: 'Data Subject Request Handling Procedure',
    category: 'GDPR',
    subsection: 'Data Subject Rights',
    fileName: 'Data_Subject_Rights_Procedure_v1.md',
    description: 'Data subject request handling procedures'
  },
  {
    id: 'gdpr-rights-3',
    title: 'Erasure & Anonymization Procedure',
    category: 'GDPR',
    subsection: 'Data Subject Rights',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Data erasure and anonymization procedures'
  },
  {
    id: 'gdpr-rights-4',
    title: 'Portability & Interoperability Procedure',
    category: 'GDPR',
    subsection: 'Data Subject Rights',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Data portability and interoperability procedures'
  },
  
  // Third Parties
  {
    id: 'gdpr-third-1',
    title: 'Data Processing Agreement (DPA) Template',
    category: 'GDPR',
    subsection: 'Third Parties',
    fileName: 'Data_Processing_Agreement_v2.md',
    description: 'Data processing agreement template'
  },
  {
    id: 'gdpr-third-2',
    title: 'Sub-processor Assessment Template',
    category: 'GDPR',
    subsection: 'Third Parties',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Sub-processor assessment template'
  },
  {
    id: 'gdpr-third-3',
    title: 'Cross-Border Data Transfer Impact Assessment',
    category: 'GDPR',
    subsection: 'Third Parties',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Cross-border data transfer impact assessment'
  },
  {
    id: 'gdpr-third-4',
    title: 'Standard Contractual Clauses (SCC) Package',
    category: 'GDPR',
    subsection: 'Third Parties',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Standard contractual clauses package'
  },
  
  // EU Artificial Intelligence Act (AI Act – High-Risk Medical AI)
  // AI Governance
  {
    id: 'ai-gov-1',
    title: 'AI Risk Management Plan',
    category: 'AI Act',
    subsection: 'AI Governance',
    fileName: 'AI_Risk_Management_Plan.md',
    description: 'AI risk management plan template'
  },
  {
    id: 'ai-gov-2',
    title: 'AI Quality Management System Addendum',
    category: 'AI Act',
    subsection: 'AI Governance',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'AI QMS addendum template'
  },
  {
    id: 'ai-gov-3',
    title: 'Human Oversight Policy',
    category: 'AI Act',
    subsection: 'AI Governance',
    fileName: 'Human_Oversight_Plan.md',
    description: 'Human oversight policy template'
  },
  {
    id: 'ai-gov-4',
    title: 'AI Ethics & Compliance Policy',
    category: 'AI Act',
    subsection: 'AI Governance',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'AI ethics and compliance policy'
  },
  {
    id: 'ai-gov-5',
    title: 'AI Incident & Malfunction Reporting Procedure',
    category: 'AI Act',
    subsection: 'AI Governance',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'AI incident reporting procedures'
  },
  
  // Technical & Model Documentation
  {
    id: 'ai-tech-1',
    title: 'AI System Description & Intended Purpose',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'AI_Technical_Documentation.md',
    description: 'AI system description and intended purpose'
  },
  {
    id: 'ai-tech-2',
    title: 'Training Data Governance File',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'Training_Data_Governance_File.md',
    description: 'Training data governance file template'
  },
  {
    id: 'ai-tech-3',
    title: 'Data Bias & Representativeness Analysis',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Data bias and representativeness analysis'
  },
  {
    id: 'ai-tech-4',
    title: 'Model Architecture & Design Specification',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Model architecture and design specification'
  },
  {
    id: 'ai-tech-5',
    title: 'Feature Engineering & Preprocessing Description',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Feature engineering and preprocessing description'
  },
  {
    id: 'ai-tech-6',
    title: 'Model Performance & Robustness Report',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'Model_Performance_and_Bias_Report.md',
    description: 'Model performance and robustness report'
  },
  {
    id: 'ai-tech-7',
    title: 'Accuracy, Sensitivity, Specificity Validation Report',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Validation report for accuracy, sensitivity, specificity'
  },
  {
    id: 'ai-tech-8',
    title: 'Explainability & Interpretability Report',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Explainability and interpretability report'
  },
  {
    id: 'ai-tech-9',
    title: 'Cybersecurity & Model Integrity Assessment',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'Cybersecurity_Risk_Management_File_v1.md',
    description: 'Cybersecurity and model integrity assessment'
  },
  {
    id: 'ai-tech-10',
    title: 'Continuous Learning & Change Control Plan',
    category: 'AI Act',
    subsection: 'Technical & Model Documentation',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Continuous learning and change control plan'
  },
  
  // Transparency & User Information
  {
    id: 'ai-trans-1',
    title: 'Algorithmic Transparency Statement',
    category: 'AI Act',
    subsection: 'Transparency & User Information',
    fileName: 'AI_Transparency_and_User_Information.md',
    description: 'Algorithmic transparency statement'
  },
  {
    id: 'ai-trans-2',
    title: 'Instructions for Use (AI-Specific Section)',
    category: 'AI Act',
    subsection: 'Transparency & User Information',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'AI-specific instructions for use'
  },
  {
    id: 'ai-trans-3',
    title: 'Human-in-the-Loop Operating Instructions',
    category: 'AI Act',
    subsection: 'Transparency & User Information',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Human-in-the-loop operating instructions'
  },
  {
    id: 'ai-trans-4',
    title: 'Limitations & Known Failure Modes Document',
    category: 'AI Act',
    subsection: 'Transparency & User Information',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Limitations and known failure modes document'
  },
  
  // Post-Market & Monitoring
  {
    id: 'ai-post-1',
    title: 'AI Post-Market Monitoring Plan',
    category: 'AI Act',
    subsection: 'Post-Market & Monitoring',
    fileName: 'AI_Post_Market_Monitoring_Plan.md',
    description: 'AI post-market monitoring plan'
  },
  {
    id: 'ai-post-2',
    title: 'Drift Detection & Re-Validation Procedure',
    category: 'AI Act',
    subsection: 'Post-Market & Monitoring',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Drift detection and re-validation procedures'
  },
  {
    id: 'ai-post-3',
    title: 'Real-World Performance Monitoring Report',
    category: 'AI Act',
    subsection: 'Post-Market & Monitoring',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Real-world performance monitoring report'
  },
  {
    id: 'ai-post-4',
    title: 'AI System Logging & Traceability Specification',
    category: 'AI Act',
    subsection: 'Post-Market & Monitoring',
    fileName: 'Logging_and_Traceability_Specification.md',
    description: 'AI system logging and traceability specification'
  },
  
  // Cross-Regulatory (Integrated Files)
  {
    id: 'cross-1',
    title: 'Regulatory Compliance Matrix (MDR + GDPR + AI Act)',
    category: 'Cross-Regulatory',
    fileName: 'MDR_GSPR_Clause_Matrix_v1.md',
    description: 'Regulatory compliance matrix template'
  },
  {
    id: 'cross-2',
    title: 'Software Development Lifecycle Master File',
    category: 'Cross-Regulatory',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Software development lifecycle master file'
  },
  {
    id: 'cross-3',
    title: 'Cybersecurity Risk Management File (MDR + AI Act + GDPR)',
    category: 'Cross-Regulatory',
    fileName: 'Cybersecurity_Risk_Management_File_v1.md',
    description: 'Cybersecurity risk management file'
  },
  {
    id: 'cross-4',
    title: 'Data Lifecycle Management Plan',
    category: 'Cross-Regulatory',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Data lifecycle management plan'
  },
  {
    id: 'cross-5',
    title: 'Clinical-AI Performance Correlation Report',
    category: 'Cross-Regulatory',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Clinical-AI performance correlation report'
  },
  {
    id: 'cross-6',
    title: 'Ethical & Societal Impact Assessment',
    category: 'Cross-Regulatory',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Ethical and societal impact assessment'
  },
  {
    id: 'cross-7',
    title: 'Trustworthiness & Explainability Dossier',
    category: 'Cross-Regulatory',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Trustworthiness and explainability dossier'
  },
  {
    id: 'cross-8',
    title: 'Regulatory Change Impact Assessment Template',
    category: 'Cross-Regulatory',
    fileName: 'DEVELOPER_INTEGRATION_NOTES_v1.md',
    description: 'Regulatory change impact assessment template'
  }
];

const TemplatesPage: React.FC = () => {
  // Group templates by category and subsection
  const groupTemplatesByCategory = () => {
    const grouped: Record<string, Record<string, TemplateItem[]>> = {};
    
    templates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = {};
      }
      
      const subsection = template.subsection || 'General';
      if (!grouped[template.category][subsection]) {
        grouped[template.category][subsection] = [];
      }
      
      grouped[template.category][subsection].push(template);
    });
    
    return grouped;
  };
  
  const groupedTemplates = groupTemplatesByCategory();
  
  // List of actual template files that exist
  const actualFiles = [
    'QMS_Quality_Manual_v2.md',
    'Data_Protection_Policy_v2.md', 
    'AI_Risk_Management_Plan.md',
    'Risk_Management_File_v2.md',
    'Post_Market_Surveillance_Plan_v1.md',
    'Clinical_Evaluation_Report_v1.md',
    'DPIA_v2.md',
    'Information_Security_Policy_v2.md',
    'Software_Lifecycle_File_IEC62304_v1.md',
    'Usability_Engineering_File_IEC62366_v1.md',
    'Training_Data_Governance_File.md',
    'Human_Oversight_Plan.md',
    'AI_Technical_Documentation.md',
    'Model_Performance_and_Bias_Report.md',
    'Cybersecurity_Risk_Management_File_v1.md',
    'Logging_and_Traceability_Specification.md',
    'MDR_GSPR_Clause_Matrix_v1.md',
    'GSPR_Checklist_v2.md',
    'Technical_Documentation_Annex_II_v1.md',
    'Data_Processing_Agreement_v2.md',
    'Data_Subject_Rights_Procedure_v1.md',
    'ROPA_v1.md',
    'AI_Post_Market_Monitoring_Plan.md',
    'AI_Transparency_and_User_Information.md',
    'AI_Risk_Management_Plan.md',
    'Unified_Cybersecurity_and_Data_Lifecycle_File.md',
    'Unified_Risk_Management_Master_File.md'
  ];

  // Check if a file has an actual mapping (not just a placeholder)
  const fileExists = (fileName: string): boolean => {
    return actualFiles.includes(fileName);
  };
  
  // Get the backend base URL from API service
  const getBackendUrl = () => {
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '/api';

    try {
      // Try to get from API service if available
      return apiBaseUrl.replace('/api', '');
    } catch (e) {
      return apiBaseUrl.replace('/api', '');
    }
  };

  const backendBaseUrl = getBackendUrl();

  // Create a simple list view for templates
  const renderTemplateList = (category: string, subsection: string, templates: TemplateItem[]) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        {subsection}
      </Typography>

      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {templates.map(template => (
          <React.Fragment key={template.id}>
            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
              <ListItemText
                primary={template.title}
                secondary={template.description || 'No description available'}
                primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              />
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                {fileExists(template.fileName) ? (
                  <>
                    <Button 
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      component="a"
                      href={`${backendBaseUrl}/templates/${template.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Button>
                    <Button 
                      variant="contained"
                      size="small"
                      startIcon={<Download />}
                      href={`${backendBaseUrl}/api/templates/download/${template.fileName}`}
                      download={template.fileName}
                    >
                      Download
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outlined"
                    size="small"
                    color="secondary"
                    disabled
                  >
                    Coming Soon
                  </Button>
                )}
              </Box>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Regulatory Compliance Templates
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
        Browse and download structured templates to help you navigate MDR EU 2017/745, AI Act, and GDPR compliance.
        All templates are provided as Markdown files for easy integration into your documentation system.
      </Typography>

      <Alert severity="info" icon={<Info />} sx={{ mb: 4 }}>
        <AlertTitle>Important Notice</AlertTitle>
        These templates are provided for informational purposes only and require customization for your specific use case.
        Always consult with qualified regulatory professionals before using these templates for compliance purposes.
      </Alert>

      {/* EU Medical Device Regulation (MDR 2017/745) */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          1. EU Medical Device Regulation (MDR 2017/745)
        </Typography>

        {renderTemplateList('MDR', 'Quality Management System (QMS)', groupedTemplates['MDR']?.['QMS'] || [])}
        {renderTemplateList('MDR', 'Technical Documentation (Annex II & III)', groupedTemplates['MDR']?.['Technical Documentation'] || [])}
        {renderTemplateList('MDR', 'Regulatory & Conformity', groupedTemplates['MDR']?.['Regulatory & Conformity'] || [])}
      </Box>

      {/* GDPR (EU 2016/679) */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          2. GDPR (EU 2016/679)
        </Typography>

        {renderTemplateList('GDPR', 'Data Governance', groupedTemplates['GDPR']?.['Data Governance'] || [])}
        {renderTemplateList('GDPR', 'Security & IT', groupedTemplates['GDPR']?.['Security & IT'] || [])}
        {renderTemplateList('GDPR', 'Data Subject Rights', groupedTemplates['GDPR']?.['Data Subject Rights'] || [])}
        {renderTemplateList('GDPR', 'Third Parties', groupedTemplates['GDPR']?.['Third Parties'] || [])}
      </Box>

      {/* EU Artificial Intelligence Act */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          3. EU Artificial Intelligence Act (AI Act – High-Risk Medical AI)
        </Typography>

        {renderTemplateList('AI Act', 'AI Governance', groupedTemplates['AI Act']?.['AI Governance'] || [])}
        {renderTemplateList('AI Act', 'Technical & Model Documentation', groupedTemplates['AI Act']?.['Technical & Model Documentation'] || [])}
        {renderTemplateList('AI Act', 'Transparency & User Information', groupedTemplates['AI Act']?.['Transparency & User Information'] || [])}
        {renderTemplateList('AI Act', 'Post-Market & Monitoring', groupedTemplates['AI Act']?.['Post-Market & Monitoring'] || [])}
      </Box>

      {/* Cross-Regulatory (Integrated Files) */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          4. Cross-Regulatory (Integrated Files)
        </Typography>

        {renderTemplateList('Cross-Regulatory', 'Integrated Files', groupedTemplates['Cross-Regulatory']?.['General'] || [])}
      </Box>

      <Alert severity="info" icon={<Info />} sx={{ mt: 3 }}>
        <AlertTitle>Template Usage Guidelines</AlertTitle>
        These templates are provided as starting points for your compliance documentation.
        Each template requires customization to fit your specific product and regulatory requirements.
        Always consult with qualified regulatory professionals before submitting documentation to authorities.
      </Alert>
    </Box>
  );
};

export default TemplatesPage;