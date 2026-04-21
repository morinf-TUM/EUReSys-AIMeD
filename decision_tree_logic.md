# Deterministic Decision Tree Logic - EU AI Medical Device System

> **Last reconciled against code:** commit `7bf8fbf`, 2026-04-20. The
> engine classes (`MDRClassificationEngine`, `AIActClassificationEngine`,
> `GDPRApplicabilityEngine`, `DecisionEngine`, etc.) match
> `backend/core/decision_engine/` as of that date. Rule text and
> classification thresholds may drift before this banner is next updated
> — when in doubt, read the code.

## 1. Decision Engine Overview

The decision engine implements hard-coded rules reflecting:
- **MDR Annex VIII** classification rules (especially Rule 11 for software)
- **AI Act Annex II** high-risk criteria (via MDR linkage)
- **GDPR** applicability and DPIA requirements

## 2. Decision Tree Architecture

```
┌───────────────────────────────────────────────────────┐
│                 Decision Engine Architecture            │
├───────────────────────────────────────────────────────┤
│ 1. Input Validation Layer                              │
│ 2. MDR Classification Engine                           │
│ 3. AI Act Classification Engine                        │
│ 4. GDPR Applicability Engine                           │
│ 5. Combined Regulatory Profile Generator              │
│ 6. Audit Trail Integration                             │
└───────────────────────────────────────────────────────┘
```

## 3. MDR Classification Engine

### 3.1 MDR Applicability Decision Tree

```python
class MDRApplicabilityEngine:
    @staticmethod
    def is_mdr_applicable(device_description, intended_purpose):
        """
        Determine if MDR applies based on Article 2(1) and Annex I
        """
        # Check if it's a medical device per MDR Article 2(1)
        is_medical_device = intended_purpose.is_medical_device
        
        # Check Annex I compliance
        annex_i_compliance = intended_purpose.mdr_annex_i_compliance
        
        # MDR applies if:
        # 1. It's a medical device per Article 2(1)
        # 2. It meets Annex I general safety and performance requirements
        return is_medical_device and annex_i_compliance
```

### 3.2 MDR Classification Rules (Annex VIII)

```python
class MDRClassificationEngine:
    @staticmethod
    def classify_device(product_version):
        """
        Apply MDR Annex VIII classification rules
        Returns: (class, applicable_rules, justification)
        """
        device_desc = product_version.device_descriptions.first()
        intended_purpose = product_version.product.intended_purposes.first()
        
        applicable_rules = []
        justification = []
        
        # Rule 11: Software
        if device_desc.is_software:
            class_result, rule_justification = MDRClassificationEngine._apply_rule_11(
                device_desc, intended_purpose
            )
            if class_result:
                applicable_rules.append('Rule 11')
                justification.extend(rule_justification)
                return class_result, applicable_rules, justification
        
        # Rule 10: Active devices for diagnosis and monitoring
        if device_desc.device_type in ['active', 'software']:
            class_result, rule_justification = MDRClassificationEngine._apply_rule_10(
                device_desc, intended_purpose
            )
            if class_result:
                applicable_rules.append('Rule 10')
                justification.extend(rule_justification)
                return class_result, applicable_rules, justification
        
        # Rule 9: Active therapeutic devices
        if device_desc.device_type == 'active':
            class_result, rule_justification = MDRClassificationEngine._apply_rule_9(
                device_desc, intended_purpose
            )
            if class_result:
                applicable_rules.append('Rule 9')
                justification.extend(rule_justification)
                return class_result, applicable_rules, justification
        
        # Default to Class I if no other rules apply
        return 'I', applicable_rules, justification
    
    @staticmethod
    def _apply_rule_11(device_desc, intended_purpose):
        """
        Rule 11: Software
        """
        justification = ["Applied MDR Annex VIII Rule 11 (Software)"]
        
        # Rule 11(a): Software intended to provide information for diagnosis
        if MDRClassificationEngine._is_diagnosis_software(intended_purpose):
            justification.append("Software provides information for diagnosis")
            return 'IIb', justification
        
        # Rule 11(b): Software for monitoring of physiological processes
        if MDRClassificationEngine._is_monitoring_software(intended_purpose):
            justification.append("Software monitors physiological processes")
            return 'IIa', justification
        
        # Rule 11(c): Software for therapeutic decisions
        if MDRClassificationEngine._is_therapeutic_decision_software(intended_purpose):
            justification.append("Software provides information for therapeutic decisions")
            return 'III', justification
        
        # Default for other software
        justification.append("Software does not fall under specific Rule 11 categories")
        return 'I', justification
    
    @staticmethod
    def _is_diagnosis_software(intended_purpose):
        """Check if software is for diagnosis per Rule 11(a)"""
        purpose_text = intended_purpose.purpose_text.lower()
        
        diagnosis_keywords = [
            'diagnosis', 'diagnose', 'diagnostic',
            'identify disease', 'detect condition',
            'disease detection', 'condition identification'
        ]
        
        return any(keyword in purpose_text for keyword in diagnosis_keywords)
    
    @staticmethod
    def _is_monitoring_software(intended_purpose):
        """Check if software is for monitoring per Rule 11(b)"""
        purpose_text = intended_purpose.purpose_text.lower()
        
        monitoring_keywords = [
            'monitor', 'monitoring', 'track', 'tracking',
            'continuous measurement', 'real-time analysis',
            'physiological monitoring', 'vital signs'
        ]
        
        return any(keyword in purpose_text for keyword in monitoring_keywords)
    
    @staticmethod
    def _is_therapeutic_decision_software(intended_purpose):
        """Check if software is for therapeutic decisions per Rule 11(c)"""
        purpose_text = intended_purpose.purpose_text.lower()
        
        therapeutic_keywords = [
            'treatment recommendation', 'therapy decision',
            'dosage calculation', 'treatment planning',
            'therapeutic intervention', 'medication management'
        ]
        
        return any(keyword in purpose_text for keyword in therapeutic_keywords)
```

## 4. AI Act Classification Engine

### 4.1 AI Act Applicability

```python
class AIActApplicabilityEngine:
    @staticmethod
    def is_ai_act_applicable(device_description):
        """
        Determine if AI Act applies based on Article 3
        """
        # AI Act applies to AI systems as defined in Article 3(1)
        has_ai_components = device_description.has_ai_components
        
        if not has_ai_components:
            return False
        
        # Check if it's an AI system per Article 3(1)
        ai_functionality = device_description.ai_functionality_description or ""
        
        ai_keywords = [
            'machine learning', 'deep learning', 'neural network',
            'ai model', 'artificial intelligence', 'predictive algorithm',
            'automated decision', 'pattern recognition', 'natural language processing'
        ]
        
        return any(keyword in ai_functionality.lower() for keyword in ai_keywords)
```

### 4.2 High-Risk Classification (Annex II)

```python
class AIActClassificationEngine:
    @staticmethod
    def classify_ai_act(product_version):
        """
        Determine if AI system is high-risk per Annex II
        Returns: (is_high_risk, justification, annex_ii_reference)
        """
        regulatory_profile = product_version.regulatory_profiles.first()
        device_desc = product_version.device_descriptions.first()
        
        # Only proceed if MDR applies and device is Class IIa or higher
        if not regulatory_profile.mdr_applicable:
            return False, ["MDR does not apply"], None
        
        if regulatory_profile.mdr_class not in ['IIa', 'IIb', 'III']:
            return False, ["Device is MDR Class I - not high-risk under AI Act"], None
        
        # Check Annex II criteria for medical devices
        is_high_risk, justification = AIActClassificationEngine._check_annex_ii_medical_devices(
            product_version
        )
        
        if is_high_risk:
            return True, justification, "Annex II.1(a)"
        
        return False, justification, None
    
    @staticmethod
    def _check_annex_ii_medical_devices(product_version):
        """
        Check Annex II criteria for medical devices
        """
        device_desc = product_version.device_descriptions.first()
        intended_purpose = product_version.product.intended_purposes.first()
        regulatory_profile = product_version.regulatory_profiles.first()
        
        justification = ["Evaluating AI Act Annex II criteria for medical devices"]
        
        # Annex II.1(a): Medical devices that are also AI systems
        if device_desc.has_ai_components and regulatory_profile.mdr_applicable:
            justification.append("Device is an AI system and subject to MDR")
            
            # High-risk if Class IIa or higher
            if regulatory_profile.mdr_class in ['IIa', 'IIb', 'III']:
                justification.append(
                    f"Device is MDR Class {regulatory_profile.mdr_class} - automatically high-risk under AI Act"
                )
                return True, justification
        
        justification.append("Device does not meet AI Act high-risk criteria")
        return False, justification
```

## 5. GDPR Applicability Engine

### 5.1 GDPR Applicability

```python
class GDPRApplicabilityEngine:
    @staticmethod
    def is_gdpr_applicable(device_description):
        """
        Determine if GDPR applies based on data processing
        """
        # GDPR applies if personal data is processed
        # For medical devices, this is almost always true
        
        # Check if device processes personal data
        processes_personal_data = True  # Conservative default for medical devices
        
        # Check training data description for personal data indicators
        training_data_desc = device_description.ai_training_data_description or ""
        
        personal_data_indicators = [
            'patient data', 'personal health', 'medical records',
            'biometric data', 'genetic data', 'health information',
            'personal identifiable', 'sensitive personal'
        ]
        
        if any(indicator in training_data_desc.lower() for indicator in personal_data_indicators):
            return True
        
        # Even if not explicitly mentioned, medical devices typically process personal data
        return processes_personal_data
```

### 5.2 DPIA Requirements (Article 35)

```python
class GDPRClassificationEngine:
    @staticmethod
    def determine_gdpr_requirements(product_version):
        """
        Determine GDPR requirements including DPIA
        Returns: (requires_dpia, legal_basis_suggestions, justification)
        """
        device_desc = product_version.device_descriptions.first()
        intended_purpose = product_version.product.intended_purposes.first()
        
        requires_dpia = False
        justification = []
        legal_basis_suggestions = []
        
        # Check for special categories of data (Article 9)
        processes_special_categories = GDPRClassificationEngine._processes_special_categories(
            device_desc, intended_purpose
        )
        
        if processes_special_categories:
            justification.append("Processes special categories of personal data (health data)")
            requires_dpia = True
        
        # Check for systematic monitoring
        if GDPRClassificationEngine._is_systematic_monitoring(device_desc):
            justification.append("Involves systematic monitoring of individuals")
            requires_dpia = True
        
        # Check for large-scale processing
        if GDPRClassificationEngine._is_large_scale_processing(intended_purpose):
            justification.append("Involves large-scale processing of personal data")
            requires_dpia = True
        
        # Suggest legal bases
        legal_basis_suggestions = [
            'Article 6(1)(c) - Legal obligation',
            'Article 6(1)(d) - Vital interests',
            'Article 6(1)(e) - Public task'
        ]
        
        if processes_special_categories:
            legal_basis_suggestions.append('Article 9(2)(h) - Health or social care')
            legal_basis_suggestions.append('Article 9(2)(i) - Public health')
        
        return requires_dpia, legal_basis_suggestions, justification
    
    @staticmethod
    def _processes_special_categories(device_desc, intended_purpose):
        """Check if special categories of data are processed"""
        # Medical devices almost always process health data
        purpose_text = intended_purpose.purpose_text.lower()
        training_data = device_desc.ai_training_data_description or ""
        
        health_data_indicators = [
            'health data', 'medical information', 'patient records',
            'diagnostic data', 'treatment data', 'clinical data',
            'biometric data', 'genetic data', 'disease information'
        ]
        
        return any(indicator in purpose_text for indicator in health_data_indicators) or \
               any(indicator in training_data for indicator in health_data_indicators)
    
    @staticmethod
    def _is_systematic_monitoring(device_desc):
        """Check if systematic monitoring occurs"""
        functionality = device_desc.ai_functionality_description or ""
        
        monitoring_indicators = [
            'continuous monitoring', 'real-time tracking',
            'ongoing surveillance', 'regular assessment',
            'long-term monitoring', 'persistent observation'
        ]
        
        return any(indicator in functionality.lower() for indicator in monitoring_indicators)
    
    @staticmethod
    def _is_large_scale_processing(intended_purpose):
        """Check if large-scale processing occurs"""
        # For medical devices, this is often the case
        purpose_text = intended_purpose.purpose_text.lower()
        
        large_scale_indicators = [
            'population-level', 'large patient groups',
            'hospital-wide', 'healthcare system',
            'national database', 'regional deployment'
        ]
        
        return any(indicator in purpose_text for indicator in large_scale_indicators)
```

## 6. Combined Regulatory Profile Generator

```python
class RegulatoryProfileGenerator:
    @staticmethod
    def generate_regulatory_profile(product_version):
        """
        Generate comprehensive regulatory profile
        """
        device_desc = product_version.device_descriptions.first()
        intended_purpose = product_version.product.intended_purposes.first()
        
        # Initialize profile
        profile_data = {
            'mdr_applicable': False,
            'mdr_class': None,
            'mdr_classification_rules': [],
            'mdr_justification': [],
            'ai_act_applicable': False,
            'ai_act_high_risk': False,
            'ai_act_high_risk_justification': [],
            'ai_act_annex_ii_reference': None,
            'gdpr_applicable': False,
            'processes_special_categories': False,
            'requires_dpia': False,
            'gdpr_legal_basis': []
        }
        
        # 1. MDR Classification
        profile_data['mdr_applicable'] = MDRApplicabilityEngine.is_mdr_applicable(
            device_desc, intended_purpose
        )
        
        if profile_data['mdr_applicable']:
            mdr_class, rules, justification = MDRClassificationEngine.classify_device(
                product_version
            )
            profile_data.update({
                'mdr_class': mdr_class,
                'mdr_classification_rules': rules,
                'mdr_justification': justification
            })
        
        # 2. AI Act Classification
        profile_data['ai_act_applicable'] = AIActApplicabilityEngine.is_ai_act_applicable(
            device_desc
        )
        
        if profile_data['ai_act_applicable']:
            is_high_risk, justification, annex_ref = AIActClassificationEngine.classify_ai_act(
                product_version
            )
            profile_data.update({
                'ai_act_high_risk': is_high_risk,
                'ai_act_high_risk_justification': justification,
                'ai_act_annex_ii_reference': annex_ref
            })
        
        # 3. GDPR Requirements
        profile_data['gdpr_applicable'] = GDPRApplicabilityEngine.is_gdpr_applicable(
            device_desc
        )
        
        if profile_data['gdpr_applicable']:
            requires_dpia, legal_bases, justification = GDPRClassificationEngine.determine_gdpr_requirements(
                product_version
            )
            profile_data.update({
                'processes_special_categories': True,  # Conservative for medical devices
                'requires_dpia': requires_dpia,
                'gdpr_legal_basis': legal_bases,
                'gdpr_justification': justification
            })
        
        # 4. Determine overall status
        profile_data['overall_compliance_status'] = 
            RegulatoryProfileGenerator._determine_overall_status(profile_data)
        
        return profile_data
    
    @staticmethod
    def _determine_overall_status(profile_data):
        """Determine overall compliance status"""
        if not profile_data['mdr_applicable'] and not profile_data['ai_act_applicable']:
            return 'not_started'
        
        # If MDR applies and we have a classification, we're making progress
        if profile_data['mdr_applicable'] and profile_data['mdr_class']:
            if profile_data['ai_act_applicable']:
                return 'in_progress'
            else:
                return 'documentation_complete'
        
        return 'in_progress'
```

## 7. Decision Engine Integration

### 7.1 Engine Orchestration

```python
class DecisionEngine:
    @staticmethod
    def run_decision_tree(product_version, user):
        """
        Run complete decision tree and create regulatory profile
        """
        # Generate regulatory profile
        profile_data = RegulatoryProfileGenerator.generate_regulatory_profile(
            product_version
        )
        
        # Create or update regulatory profile
        regulatory_profile, created = RegulatoryProfile.objects.update_or_create(
            product_version=product_version,
            defaults=profile_data
        )
        
        # Create audit log
        action = 'CREATE_REGULATORY_PROFILE' if created else 'UPDATE_REGULATORY_PROFILE'
        AuditLog.create(
            action=action,
            model_type='RegulatoryProfile',
            model_id=regulatory_profile.id,
            user=user,
            details={
                'mdr_class': regulatory_profile.mdr_class,
                'ai_act_high_risk': regulatory_profile.ai_act_high_risk,
                'requires_dpia': regulatory_profile.requires_dpia
            }
        )
        
        # Update product version with regulatory snapshot
        product_version.regulatory_snapshot = {
            'regulatory_profile_id': regulatory_profile.id,
            'timestamp': timezone.now().isoformat(),
            'profile_data': model_to_dict(regulatory_profile)
        }
        product_version.save()
        
        return regulatory_profile
```

### 7.2 Decision Tree Visualization

```
┌───────────────────────────────────────────────────────┐
│               Regulatory Decision Tree Flow             │
├───────────────────────────────────────────────────────┤
│ 1. Start with Device Description and Intended Purpose   │
│    ├─ Is it a medical device? (MDR Article 2(1))        │
│    ├─ Does it meet Annex I requirements?               │
│    └─ Does it have AI components?                      │
│                                                           │
│ 2. MDR Classification (Annex VIII)                      │
│    ├─ Apply Rule 11 for software                        │
│    ├─ Apply Rule 10 for active diagnostic devices       │
│    ├─ Apply Rule 9 for active therapeutic devices       │
│    └─ Determine final MDR class                         │
│                                                           │
│ 3. AI Act Classification (Annex II)                     │
│    ├─ Is AI Act applicable? (Article 3)                 │
│    ├─ Is it high-risk via MDR linkage? (Annex II.1(a)) │
│    └─ Determine AI Act status                           │
│                                                           │
│ 4. GDPR Requirements                                      │
│    ├─ Is GDPR applicable? (Articles 5-6)                │
│    ├─ Does it process special categories? (Article 9)   │
│    ├─ Is DPIA required? (Article 35)                    │
│    └─ Suggest legal bases                               │
│                                                           │
│ 5. Generate Combined Regulatory Profile                  │
│    ├─ Create RegulatoryProfile record                   │
│    ├─ Create audit log entry                            │
│    └─ Update product version snapshot                   │
└───────────────────────────────────────────────────────┘
```

## 8. Decision Tree Validation and Testing

> The `DecisionTreeTestCases` and `DecisionTreeValidator` classes
> below are **illustrative** — they show what a structured test suite
> for the decision engine would look like, not code that lives in the
> repo. The only current decision-engine-adjacent test is
> `backend/core/tests/test_recommendation_engine.py`.

### 8.1 Test Cases (illustrative)

```python
class DecisionTreeTestCases:
    @staticmethod
    def test_diagnosis_software():
        """Test Rule 11(a) - Diagnosis software"""
        # Setup test data
        intended_purpose = IntendedPurpose.objects.create(
            purpose_text="AI software for early detection of diabetic retinopathy",
            is_medical_device=True,
            mdr_annex_i_compliance=True
        )
        
        device_desc = DeviceDescription.objects.create(
            is_software=True,
            has_ai_components=True,
            ai_functionality_description="Deep learning model for retinal image analysis"
        )
        
        # Run decision tree
        profile = DecisionEngine.run_decision_tree(product_version, test_user)
        
        # Assertions
        assert profile.mdr_applicable == True
        assert profile.mdr_class == 'IIb'
        assert 'Rule 11' in profile.mdr_classification_rules
        assert profile.ai_act_applicable == True
        assert profile.ai_act_high_risk == True
    
    @staticmethod
    def test_monitoring_software():
        """Test Rule 11(b) - Monitoring software"""
        intended_purpose = IntendedPurpose.objects.create(
            purpose_text="Continuous glucose monitoring with AI alerts",
            is_medical_device=True,
            mdr_annex_i_compliance=True
        )
        
        device_desc = DeviceDescription.objects.create(
            is_software=True,
            has_ai_components=True,
            ai_functionality_description="Real-time glucose level monitoring and prediction"
        )
        
        profile = DecisionEngine.run_decision_tree(product_version, test_user)
        
        assert profile.mdr_class == 'IIa'
        assert profile.ai_act_high_risk == True  # Class IIa is high-risk
    
    @staticmethod
    def test_non_ai_medical_device():
        """Test traditional medical device without AI"""
        intended_purpose = IntendedPurpose.objects.create(
            purpose_text="Surgical scalpel for general use",
            is_medical_device=True,
            mdr_annex_i_compliance=True
        )
        
        device_desc = DeviceDescription.objects.create(
            is_software=False,
            has_ai_components=False,
            device_type="surgical instrument"
        )
        
        profile = DecisionEngine.run_decision_tree(product_version, test_user)
        
        assert profile.mdr_applicable == True
        assert profile.mdr_class == 'I'  # Default for non-software
        assert profile.ai_act_applicable == False
```

### 8.2 Decision Tree Validation Rules (illustrative)

```python
class DecisionTreeValidator:
    @staticmethod
    def validate_decision_tree_result(profile_data):
        """Validate that decision tree results are consistent"""
        errors = []
        
        # Rule: If MDR Class IIa or higher and AI Act applicable, should be high-risk
        if (profile_data['mdr_class'] in ['IIa', 'IIb', 'III'] and 
            profile_data['ai_act_applicable'] and 
            not profile_data['ai_act_high_risk']):
            errors.append("MDR Class IIa+ with AI should be AI Act high-risk")
        
        # Rule: Medical devices processing health data should require DPIA
        if (profile_data['gdpr_applicable'] and 
            profile_data['processes_special_categories'] and 
            not profile_data['requires_dpia']):
            errors.append("GDPR applicable with special categories should require DPIA")
        
        # Rule: If MDR applicable, should have classification rules
        if profile_data['mdr_applicable'] and not profile_data['mdr_classification_rules']:
            errors.append("MDR applicable devices must have classification rules")
        
        return errors
```

## 9. Decision Tree Documentation and Traceability

### 9.1 Decision Tree Output Format

```json
{
    "decision_tree_run_id": "uuid",
    "timestamp": "2023-11-15T14:30:00Z",
    "input_data": {
        "device_description": {...},
        "intended_purpose": {...}
    },
    "decision_steps": [
        {
            "step": "MDR_APPLICABILITY",
            "rule": "Article 2(1) + Annex I",
            "result": true,
            "justification": ["Device meets medical device definition", "Complies with Annex I"]
        },
        {
            "step": "MDR_CLASSIFICATION",
            "rule": "Annex VIII Rule 11",
            "result": "IIb",
            "justification": ["Software for diagnosis", "Rule 11(a) applies"]
        },
        {
            "step": "AI_ACT_APPLICABILITY",
            "rule": "Article 3(1)",
            "result": true,
            "justification": ["Contains AI components", "Uses machine learning"]
        },
        {
            "step": "AI_ACT_HIGH_RISK",
            "rule": "Annex II.1(a)",
            "result": true,
            "justification": ["MDR Class IIb device", "Automatic high-risk classification"]
        },
        {
            "step": "GDPR_APPLICABILITY",
            "rule": "Articles 5-6",
            "result": true,
            "justification": ["Processes personal health data"]
        },
        {
            "step": "GDPR_DPIA",
            "rule": "Article 35",
            "result": true,
            "justification": ["Processes special categories", "Large-scale health data"]
        }
    ],
    "final_profile": {
        "mdr_class": "IIb",
        "ai_act_high_risk": true,
        "requires_dpia": true,
        "documentation_requirements": ["MDR Annex II", "AI Act Technical Documentation", "GDPR DPIA"]
    },
    "regulatory_citations": [
        {"regulation": "MDR", "article": "Annex VIII Rule 11", "text": "Software for diagnosis"},
        {"regulation": "AI Act", "article": "Annex II.1(a)", "text": "Medical devices"},
        {"regulation": "GDPR", "article": "Article 35", "text": "DPIA requirement"}
    ]
}
```

### 9.2 Traceability Matrix

```
┌───────────────────────────────────────────────────────┐
│           Decision Tree Traceability Matrix            │
├─────────────────┬─────────────────┬─────────────────┤
│    Decision      │    Regulation    │    Implementation│
├─────────────────┼─────────────────┼─────────────────┤
│ MDR Applicability│ Article 2(1)    │ MDRApplicabilityEngine│
│                 │ Annex I         │                 │
├─────────────────┼─────────────────┼─────────────────┤
│ Software Class  │ Annex VIII R11  │ MDRClassificationEngine│
├─────────────────┼─────────────────┼─────────────────┤
│ AI Act High-Risk│ Annex II.1(a)   │ AIActClassificationEngine│
├─────────────────┼─────────────────┼─────────────────┤
│ GDPR DPIA       │ Article 35      │ GDPRClassificationEngine│
├─────────────────┼─────────────────┼─────────────────┤
│ Legal Basis     │ Articles 6, 9   │ GDPRClassificationEngine│
└─────────────────┴─────────────────┴─────────────────┘
```

## 10. Next Steps

The decision tree logic is now complete. Next steps include:

1. **LLM Integration**: Design the constrained LLM system with strict prompts and RAG
2. **Change Management Engine**: Implement logic for detecting and classifying changes
3. **Frontend Implementation**: Build the UI components that interact with this decision engine
4. **Testing and Validation**: Create comprehensive test suite for all regulatory scenarios