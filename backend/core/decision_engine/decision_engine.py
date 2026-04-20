from django.utils import timezone
from django.forms.models import model_to_dict
from ..models import RegulatoryProfile, AuditLog
from .mdr_engine import MDRApplicabilityEngine, MDRClassificationEngine
from .ai_act_engine import AIActApplicabilityEngine, AIActClassificationEngine
from .gdpr_engine import GDPRApplicabilityEngine, GDPRClassificationEngine
from .profile_generator import RegulatoryProfileGenerator

class DecisionEngine:
    """
    Main decision engine that orchestrates the complete regulatory classification process
    """
    
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
        AuditLog.objects.create(
            action=action,
            model_type='RegulatoryProfile',
            model_id=regulatory_profile.id,
            created_by=user,
            updated_by=user,
            action_details={
                'mdr_class': regulatory_profile.mdr_class,
                'ai_act_high_risk': regulatory_profile.ai_act_high_risk,
                'requires_dpia': regulatory_profile.requires_dpia
            }
        )
        
        # Update product version with regulatory snapshot
        product_version.regulatory_snapshot = {
            'regulatory_profile_id': str(regulatory_profile.id),
            'timestamp': timezone.now().isoformat(),
            'profile_data': model_to_dict(regulatory_profile)
        }
        product_version.save()
        
        return regulatory_profile

class RegulatoryProfileGenerator:
    """
    Generates comprehensive regulatory profiles
    """
    
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
            'gdpr_legal_basis': [],
            'overall_compliance_status': 'not_started'
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
        profile_data['overall_compliance_status'] = RegulatoryProfileGenerator._determine_overall_status(profile_data)
        
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