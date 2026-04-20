from django.utils import timezone
from ..models import DeviceDescription, IntendedPurpose

class AIActApplicabilityEngine:
    """
    Determines if AI Act applies to a device
    """
    
    @staticmethod
    def is_ai_act_applicable(device_desc: DeviceDescription) -> bool:
        """
        Determine if AI Act applies based on device characteristics
        """
        # AI Act applies if:
        # 1. Device has AI components
        # 2. Device is placed on the market in the EU
        # 3. Device is not explicitly excluded
        
        if not device_desc.has_ai_components:
            return False
            
        # Check if device falls under AI Act scope
        # AI Act applies to AI systems placed on the market in the EU
        # Medical devices with AI components are typically in scope
        
        return True

class AIActClassificationEngine:
    """
    Classifies devices according to AI Act risk categories
    """
    
    @staticmethod
    def classify_ai_act(product_version) -> tuple:
        """
        Classify device according to AI Act Annex II (High-Risk AI Systems)
        
        Returns:
            tuple: (is_high_risk, justification, annex_reference)
        """
        device_desc = product_version.device_descriptions.first()
        intended_purpose = product_version.product.intended_purposes.first()
        
        if not device_desc or not intended_purpose:
            return False, ['Insufficient information for classification'], None
            
        is_high_risk = False
        justification = []
        annex_reference = None
        
        # Check Annex II categories for medical devices
        # Annex II.1: AI systems intended to be used for the purpose of 
        # determining access to educational and vocational training institutions
        
        # Annex II.2: AI systems intended to be used for the purpose of 
        # determining access to employment, self-employment and contract work
        
        # Annex II.3: AI systems intended to be used for the purpose of 
        # evaluating creditworthiness or establishing credit score
        
        # Annex II.4: AI systems intended to be used for the purpose of 
        # determining access to essential private and public services
        
        # Annex II.5: AI systems intended to be used for the purpose of 
        # law enforcement risk assessment
        
        # Annex II.6: AI systems intended to be used for the purpose of 
        # migration, asylum and border control management
        
        # Annex II.7: AI systems intended to be used for the purpose of 
        # administration of justice and democratic processes
        
        # For medical devices, the most relevant is typically:
        # Medical devices that are also AI systems fall under MDR primarily,
        # but may have additional AI Act requirements if they process personal data
        
        # Check if this is a medical device with AI components
        if intended_purpose.is_medical_device and device_desc.has_ai_components:
            # Medical AI devices are typically high-risk under AI Act
            is_high_risk = True
            annex_reference = 'Annex II.1(a)'  # Specific medical AI category
            
            justification.append(
                f'Device is a medical AI system as defined by AI Act Article 6(1). '
                f'Medical devices with AI components that make or support medical decisions '
                f'are considered high-risk under AI Act Annex II.'
            )
            
            # Additional justification based on intended purpose
            if 'diagnosis' in intended_purpose.purpose_text.lower():
                justification.append(
                    'AI system used for medical diagnosis is explicitly mentioned in AI Act '
                    'recitals as requiring high-risk classification due to potential impact '
                    'on health and safety.'
                )
            
            if 'treatment' in intended_purpose.purpose_text.lower():
                justification.append(
                    'AI system used for treatment decisions falls under high-risk category '
                    'due to potential impact on patient outcomes and safety.'
                )
        
        # Check if device processes biometric data (special category)
        if device_desc.ai_training_data_description and \
           any(term in device_desc.ai_training_data_description.lower() 
               for term in ['biometric', 'facial', 'retinal', 'genetic', 'health']):
            justification.append(
                'Device processes biometric or health data, which increases risk classification '
                'under AI Act Article 5.'
            )
        
        return is_high_risk, justification, annex_reference