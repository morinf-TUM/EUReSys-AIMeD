from django.db import models
from django.contrib.postgres.fields import ArrayField

class MDRApplicabilityEngine:
    """
    Determines if MDR applies to a device based on Article 2(1) and Annex I
    """
    
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

class MDRClassificationEngine:
    """
    Applies MDR Annex VIII classification rules
    """
    
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