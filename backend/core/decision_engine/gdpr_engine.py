from django.utils import timezone
from ..models import DeviceDescription, IntendedPurpose

class GDPRApplicabilityEngine:
    """
    Determines if GDPR applies to a device
    """
    
    @staticmethod
    def is_gdpr_applicable(device_desc: DeviceDescription) -> bool:
        """
        Determine if GDPR applies based on device characteristics
        """
        # GDPR applies if:
        # 1. Device processes personal data
        # 2. Device is used in the EU or targets EU citizens
        # 3. Device is not for purely personal/household use
        
        # For medical devices, GDPR typically applies if they process any patient data
        # This includes most AI medical devices that analyze patient-specific data
        
        # Check if device processes personal data (conservative approach for medical devices)
        processes_personal_data = False
        
        # Medical devices typically process personal data
        if device_desc.device_type.lower() in ['software', 'ai system', 'medical device']:
            processes_personal_data = True
        
        # Check AI training data description for personal data indicators
        if device_desc.ai_training_data_description and \
           any(term in device_desc.ai_training_data_description.lower() 
               for term in ['patient', 'personal', 'health', 'medical', 'clinical']):
            processes_personal_data = True
        
        return processes_personal_data

class GDPRClassificationEngine:
    """
    Determines GDPR requirements for a device
    """
    
    @staticmethod
    def determine_gdpr_requirements(product_version) -> tuple:
        """
        Determine GDPR requirements based on device characteristics
        
        Returns:
            tuple: (requires_dpia, legal_bases, justification)
        """
        device_desc = product_version.device_descriptions.first()
        intended_purpose = product_version.product.intended_purposes.first()
        
        if not device_desc or not intended_purpose:
            return False, [], ['Insufficient information for GDPR assessment']
            
        requires_dpia = False
        legal_bases = []
        justification = []
        
        # Medical devices typically process special categories of personal data
        # Article 9 GDPR: processing of special categories requires DPIA
        processes_special_categories = True  # Conservative for medical devices
        
        if processes_special_categories:
            requires_dpia = True
            legal_bases.append('Article 9(2)(h) - Health data processing')
            
            justification.append(
                'Medical devices processing health data fall under GDPR Article 9(2)(h) '
                'which requires processing to be necessary for health purposes and '
                'subject to appropriate safeguards.'
            )
            
            justification.append(
                'Data Protection Impact Assessment (DPIA) is required under GDPR '
                'Article 35 due to large-scale processing of special categories '
                'of personal data (health data).'
            )
        
        # Check for additional legal bases
        if 'diagnosis' in intended_purpose.purpose_text.lower():
            legal_bases.append('Article 6(1)(e) - Public interest in health')
            justification.append(
                'Diagnostic medical devices may rely on public interest legal basis '
                'for processing under Article 6(1)(e) GDPR.'
            )
        
        if 'treatment' in intended_purpose.purpose_text.lower():
            legal_bases.append('Article 6(1)(d) - Vital interests')
            justification.append(
                'Medical devices used for treatment may rely on vital interests '
                'legal basis under Article 6(1)(d) GDPR.'
            )
        
        # Check for AI-specific GDPR considerations
        if device_desc.has_ai_components:
            justification.append(
                'AI systems processing personal data must comply with GDPR principles '
                'of data minimization, purpose limitation, and transparency. '
                'Automated decision-making provisions (Article 22) may apply.'
            )
            
            if 'automated' in device_desc.ai_functionality_description.lower() or \
               'decision' in device_desc.ai_functionality_description.lower():
                justification.append(
                    'AI system appears to make automated decisions that may significantly '
                    'affect individuals, potentially triggering Article 22 GDPR rights '
                    'regarding automated decision-making.'
                )
        
        # Additional GDPR requirements for medical devices
        justification.append(
            'Medical device manufacturers must implement appropriate technical and '
            'organizational measures (Article 24 GDPR) including data encryption, '
            'access controls, and regular security audits.'
        )
        
        justification.append(
            'Data subject rights (Articles 12-22 GDPR) must be respected, including '
            'rights to access, rectification, erasure, and objection to processing.'
        )
        
        return requires_dpia, legal_bases, justification