# AI Act Classification Tests
import pytest
from django.test import TestCase
from backend.core.models import Product, ProductVersion, IntendedPurpose, DeviceDescription, RegulatoryProfile
from backend.core.decision_engine.ai_act_engine import AIActApplicabilityEngine, AIActClassificationEngine
from backend.core.decision_engine.decision_engine import DecisionEngine

class TestAIActClassification(TestCase):
    """Test AI Act classification according to Annex II"""
    
    def setUp(self):
        """Set up test data"""
        # Create test product
        self.product = Product.objects.create(
            name="Test AI Medical Device",
            internal_reference="TEST-AI-002",
            description="AI-enabled medical device"
        )
        
        # Create product version
        self.product_version = ProductVersion.objects.create(
            product=self.product,
            version_number="1.0",
            release_date="2023-01-01",
            release_notes="Initial release",
            change_type="initial"
        )
        
        # Create intended purpose
        self.intended_purpose = IntendedPurpose.objects.create(
            product=self.product,
            purpose_text="AI software for medical diagnosis",
            medical_indication="Diagnostic support",
            target_population="Healthcare professionals",
            clinical_benefit="Improved diagnostic accuracy",
            is_medical_device=True,
            mdr_annex_i_compliance=True
        )
    
    def test_ai_act_applicable_ai_system(self):
        """Test that AI Act applies to AI systems"""
        # Create device description with AI components
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="software",
            physical_description="AI diagnostic software",
            has_ai_components=True,
            ai_functionality_description="Machine learning model for medical image analysis",
            ai_training_data_description="Medical imaging data",
            is_software=True,
            software_classification="AI medical device"
        )
        
        # Test AI Act applicability
        is_applicable = AIActApplicabilityEngine.is_ai_act_applicable(device_desc)
        
        self.assertTrue(is_applicable)
    
    def test_ai_act_not_applicable_non_ai(self):
        """Test that AI Act does not apply to non-AI devices"""
        # Create device description without AI components
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="device",
            physical_description="Traditional medical device",
            has_ai_components=False,
            is_software=False
        )
        
        # Test AI Act applicability
        is_applicable = AIActApplicabilityEngine.is_ai_act_applicable(device_desc)
        
        self.assertFalse(is_applicable)
    
    def test_high_risk_class_ii_device(self):
        """Test high-risk classification for MDR Class IIa device with AI"""
        # Create device description
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="software",
            physical_description="AI diagnostic software",
            has_ai_components=True,
            ai_functionality_description="Machine learning for diagnosis",
            is_software=True
        )
        
        # Create regulatory profile with MDR Class IIa
        regulatory_profile = RegulatoryProfile.objects.create(
            product_version=self.product_version,
            mdr_applicable=True,
            mdr_class='IIa',
            mdr_classification_rules=['Rule 11'],
            mdr_justification=['Software for diagnosis'],
            ai_act_applicable=True,
            ai_act_high_risk=False,  # Will be updated
            ai_act_high_risk_justification=[],
            ai_act_annex_ii_reference=None,
            gdpr_applicable=True,
            processes_special_categories=True,
            requires_dpia=True,
            gdpr_legal_basis=['Article 6(1)(e)'],
            overall_compliance_status='in_progress'
        )
        
        # Test AI Act classification
        is_high_risk, justification, annex_ref = AIActClassificationEngine.classify_ai_act(
            self.product_version
        )
        
        # Assertions
        self.assertTrue(is_high_risk)
        self.assertEqual(annex_ref, "Annex II.1(a)")
        self.assertTrue(any('MDR Class IIa' in j for j in justification))
        self.assertTrue(any('high-risk' in j.lower() for j in justification))
    
    def test_high_risk_class_iii_device(self):
        """Test high-risk classification for MDR Class III device with AI"""
        # Update intended purpose for higher risk
        self.intended_purpose.purpose_text = "AI software for therapeutic decisions"
        self.intended_purpose.save()
        
        # Create device description
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="software",
            physical_description="AI therapeutic decision support",
            has_ai_components=True,
            ai_functionality_description="AI for treatment recommendations",
            is_software=True
        )
        
        # Create regulatory profile with MDR Class III
        regulatory_profile = RegulatoryProfile.objects.create(
            product_version=self.product_version,
            mdr_applicable=True,
            mdr_class='III',
            mdr_classification_rules=['Rule 11'],
            mdr_justification=['Software for therapeutic decisions'],
            ai_act_applicable=True,
            ai_act_high_risk=False,  # Will be updated
            ai_act_high_risk_justification=[],
            ai_act_annex_ii_reference=None,
            gdpr_applicable=True,
            processes_special_categories=True,
            requires_dpia=True,
            gdpr_legal_basis=['Article 6(1)(e)'],
            overall_compliance_status='in_progress'
        )
        
        # Test AI Act classification
        is_high_risk, justification, annex_ref = AIActClassificationEngine.classify_ai_act(
            self.product_version
        )
        
        # Assertions
        self.assertTrue(is_high_risk)
        self.assertEqual(annex_ref, "Annex II.1(a)")
        self.assertTrue(any('MDR Class III' in j for j in justification))
    
    def test_not_high_risk_class_i_device(self):
        """Test that Class I devices are not high-risk under AI Act"""
        # Create device description for low-risk device
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="software",
            physical_description="Wellness tracking app",
            has_ai_components=True,
            ai_functionality_description="AI for general wellness suggestions",
            is_software=True
        )
        
        # Create regulatory profile with MDR Class I
        regulatory_profile = RegulatoryProfile.objects.create(
            product_version=self.product_version,
            mdr_applicable=True,
            mdr_class='I',
            mdr_classification_rules=[],
            mdr_justification=['Low-risk wellness software'],
            ai_act_applicable=True,
            ai_act_high_risk=False,  # Should remain False
            ai_act_high_risk_justification=[],
            ai_act_annex_ii_reference=None,
            gdpr_applicable=True,
            processes_special_categories=False,
            requires_dpia=False,
            gdpr_legal_basis=['Article 6(1)(a)'],
            overall_compliance_status='in_progress'
        )
        
        # Test AI Act classification
        is_high_risk, justification, annex_ref = AIActClassificationEngine.classify_ai_act(
            self.product_version
        )
        
        # Assertions
        self.assertFalse(is_high_risk)
        self.assertIsNone(annex_ref)
        self.assertTrue(any('Class I' in j for j in justification))
        self.assertTrue(any('not high-risk' in j.lower() for j in justification))

class TestAIActApplicability(TestCase):
    """Test AI Act applicability determination"""
    
    def test_ai_system_detection(self):
        """Test detection of AI systems"""
        product = Product.objects.create(
            name="Test AI System",
            internal_reference="TEST-AI-003",
            description="AI system"
        )
        
        product_version = ProductVersion.objects.create(
            product=product,
            version_number="1.0",
            release_date="2023-01-01",
            release_notes="Initial release",
            change_type="initial"
        )
        
        # Test various AI descriptions
        ai_descriptions = [
            "Machine learning model",
            "Deep learning neural network",
            "AI model for predictions",
            "Artificial intelligence algorithm",
            "Neural network for pattern recognition"
        ]
        
        for desc in ai_descriptions:
            device_desc = DeviceDescription.objects.create(
                product_version=product_version,
                device_type="software",
                physical_description="AI system",
                has_ai_components=True,
                ai_functionality_description=desc,
                is_software=True
            )
            
            is_applicable = AIActApplicabilityEngine.is_ai_act_applicable(device_desc)
            self.assertTrue(is_applicable, f"Failed for description: {desc}")
    
    def test_non_ai_system_detection(self):
        """Test detection of non-AI systems"""
        product = Product.objects.create(
            name="Test Non-AI System",
            internal_reference="TEST-NAI-001",
            description="Non-AI system"
        )
        
        product_version = ProductVersion.objects.create(
            product=product,
            version_number="1.0",
            release_date="2023-01-01",
            release_notes="Initial release",
            change_type="initial"
        )
        
        # Test non-AI description
        device_desc = DeviceDescription.objects.create(
            product_version=product_version,
            device_type="software",
            physical_description="Traditional software",
            has_ai_components=False,
            ai_functionality_description="Rule-based decision system",
            is_software=True
        )
        
        is_applicable = AIActApplicabilityEngine.is_ai_act_applicable(device_desc)
        self.assertFalse(is_applicable)