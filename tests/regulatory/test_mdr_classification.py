# MDR Classification Tests
import pytest
from django.test import TestCase
from backend.core.models import Product, ProductVersion, IntendedPurpose, DeviceDescription
from backend.core.decision_engine.mdr_engine import MDRClassificationEngine
from backend.core.decision_engine.decision_engine import DecisionEngine

class TestMDRClassification(TestCase):
    """Test MDR classification according to Annex VIII rules"""
    
    def setUp(self):
        """Set up test data"""
        # Create test product
        self.product = Product.objects.create(
            name="Test AI Diagnostic Software",
            internal_reference="TEST-AI-001",
            description="AI software for medical diagnosis"
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
            purpose_text="AI software for early detection of diabetic retinopathy from retinal images",
            medical_indication="Diabetic retinopathy detection",
            target_population="Adults with diabetes",
            clinical_benefit="Early detection to prevent vision loss",
            is_medical_device=True,
            mdr_annex_i_compliance=True
        )
    
    def test_diagnosis_software_rule_11a(self):
        """Test Rule 11(a) - Software for diagnosis should be Class IIb"""
        # Create device description for diagnosis software
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="software",
            physical_description="Cloud-based AI application",
            has_ai_components=True,
            ai_functionality_description="Deep learning model for retinal image analysis",
            ai_training_data_description="10,000 annotated retinal images",
            is_software=True,
            software_classification="AI/ML medical device software"
        )
        
        # Run classification
        mdr_class, rules, justification = MDRClassificationEngine.classify_device(
            self.product_version
        )
        
        # Assertions
        self.assertEqual(mdr_class, 'IIb')
        self.assertIn('Rule 11', rules)
        self.assertTrue(any('diagnosis' in j.lower() for j in justification))
    
    def test_monitoring_software_rule_11b(self):
        """Test Rule 11(b) - Software for monitoring should be Class IIa"""
        # Update intended purpose for monitoring
        self.intended_purpose.purpose_text = "Continuous glucose monitoring with AI alerts"
        self.intended_purpose.medical_indication = "Glucose level monitoring"
        self.intended_purpose.save()
        
        # Create device description for monitoring software
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="software",
            physical_description="Mobile app with cloud backend",
            has_ai_components=True,
            ai_functionality_description="Real-time glucose level monitoring and prediction",
            ai_training_data_description="Continuous glucose monitoring data from 500 patients",
            is_software=True,
            software_classification="AI monitoring software"
        )
        
        # Run classification
        mdr_class, rules, justification = MDRClassificationEngine.classify_device(
            self.product_version
        )
        
        # Assertions
        self.assertEqual(mdr_class, 'IIa')
        self.assertIn('Rule 11', rules)
        self.assertTrue(any('monitor' in j.lower() for j in justification))
    
    def test_therapeutic_software_rule_11c(self):
        """Test Rule 11(c) - Software for therapeutic decisions should be Class III"""
        # Update intended purpose for therapeutic decisions
        self.intended_purpose.purpose_text = "AI software for chemotherapy dosage recommendations"
        self.intended_purpose.medical_indication = "Cancer treatment planning"
        self.intended_purpose.save()
        
        # Create device description for therapeutic software
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="software",
            physical_description="Clinical decision support system",
            has_ai_components=True,
            ai_functionality_description="AI model for chemotherapy dosage calculation",
            ai_training_data_description="Oncology treatment data from clinical trials",
            is_software=True,
            software_classification="AI therapeutic decision support"
        )
        
        # Run classification
        mdr_class, rules, justification = MDRClassificationEngine.classify_device(
            self.product_version
        )
        
        # Assertions
        self.assertEqual(mdr_class, 'III')
        self.assertIn('Rule 11', rules)
        self.assertTrue(any('therapeutic' in j.lower() for j in justification))
    
    def test_non_ai_medical_device(self):
        """Test traditional medical device without AI"""
        # Update intended purpose for non-AI device
        self.intended_purpose.purpose_text = "Surgical scalpel for general use"
        self.intended_purpose.medical_indication = "Surgical procedures"
        self.intended_purpose.save()
        
        # Create device description for non-AI device
        device_desc = DeviceDescription.objects.create(
            product_version=self.product_version,
            device_type="surgical instrument",
            physical_description="Stainless steel surgical scalpel",
            has_ai_components=False,
            is_software=False,
            software_classification=None
        )
        
        # Run classification
        mdr_class, rules, justification = MDRClassificationEngine.classify_device(
            self.product_version
        )
        
        # Assertions - should default to Class I for non-software
        self.assertEqual(mdr_class, 'I')
        self.assertEqual(len(rules), 0)  # No specific rules applied

class TestMDRApplicability(TestCase):
    """Test MDR applicability determination"""
    
    def test_mdr_applicable_medical_device(self):
        """Test that MDR applies to medical devices"""
        product = Product.objects.create(
            name="Test Medical Device",
            internal_reference="TEST-MD-001",
            description="Medical device"
        )
        
        product_version = ProductVersion.objects.create(
            product=product,
            version_number="1.0",
            release_date="2023-01-01",
            release_notes="Initial release",
            change_type="initial"
        )
        
        intended_purpose = IntendedPurpose.objects.create(
            product=product,
            purpose_text="Medical device for diagnosis",
            medical_indication="Diagnosis",
            target_population="Patients",
            clinical_benefit="Diagnosis",
            is_medical_device=True,
            mdr_annex_i_compliance=True
        )
        
        device_desc = DeviceDescription.objects.create(
            product_version=product_version,
            device_type="device",
            physical_description="Medical device",
            has_ai_components=False,
            is_software=False
        )
        
        # Test applicability
        from backend.core.decision_engine.mdr_engine import MDRApplicabilityEngine
        is_applicable = MDRApplicabilityEngine.is_mdr_applicable(device_desc, intended_purpose)
        
        self.assertTrue(is_applicable)
    
    def test_mdr_not_applicable_non_medical(self):
        """Test that MDR does not apply to non-medical devices"""
        product = Product.objects.create(
            name="Test Non-Medical Device",
            internal_reference="TEST-NMD-001",
            description="Non-medical device"
        )
        
        product_version = ProductVersion.objects.create(
            product=product,
            version_number="1.0",
            release_date="2023-01-01",
            release_notes="Initial release",
            change_type="initial"
        )
        
        intended_purpose = IntendedPurpose.objects.create(
            product=product,
            purpose_text="General purpose software",
            medical_indication="None",
            target_population="General public",
            clinical_benefit="None",
            is_medical_device=False,
            mdr_annex_i_compliance=False
        )
        
        device_desc = DeviceDescription.objects.create(
            product_version=product_version,
            device_type="software",
            physical_description="General software",
            has_ai_components=True,
            is_software=True
        )
        
        # Test applicability
        from backend.core.decision_engine.mdr_engine import MDRApplicabilityEngine
        is_applicable = MDRApplicabilityEngine.is_mdr_applicable(device_desc, intended_purpose)
        
        self.assertFalse(is_applicable)