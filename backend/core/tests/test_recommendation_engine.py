"""
Test suite for the recommendation engine
"""

import unittest

from backend.core.recommendation_engine import RecommendationEngine


class RecommendationEngineTest(unittest.TestCase):
    """Test the recommendation engine"""

    def test_medical_ai_diagnosis_device(self):
        """Test recommendation for medical AI diagnosis device"""
        engine = RecommendationEngine()

        result = engine.generate_recommendation({
            'deviceName': 'CardioAI Monitor',
            'deviceDescription': 'AI-powered cardiac monitor',
            'isMedicalPurpose': True,
            'usesAI': True
        }, 'Continuous monitoring of cardiac rhythms')

        self.assertEqual(result['mdr_classification'], 'IIa')
        self.assertEqual(result['ai_act_classification'], 'High-risk')
        self.assertEqual(result['gdpr_requirements'], 'DPIA required')
        self.assertEqual(result['confidence'], 'high')
        self.assertTrue(len(result['justification']) > 0)
        self.assertIn('regulatory_references', result)
        self.assertIn('integration_mode', result)
        self.assertTrue(len(result['justification']) >= 5)

    def test_non_medical_device(self):
        """Test recommendation for non-medical device"""
        engine = RecommendationEngine()

        result = engine.generate_recommendation({
            'deviceName': 'Fitness Tracker',
            'deviceDescription': 'Consumer fitness tracking',
            'isMedicalPurpose': False,
            'usesAI': False
        }, 'Track steps and calories')

        self.assertEqual(result['mdr_classification'], 'Not applicable')
        self.assertEqual(result['ai_act_classification'], 'Not applicable')
        self.assertEqual(result['gdpr_requirements'], 'Standard compliance')

    def test_edge_case(self):
        """Test ambiguous case"""
        engine = RecommendationEngine()

        result = engine.generate_recommendation({
            'deviceName': 'Wellness App',
            'deviceDescription': 'General wellness tracking with some health features',
            'isMedicalPurpose': False,
            'usesAI': True
        }, 'Provide general wellness advice')

        self.assertEqual(result['confidence'], 'medium')


if __name__ == '__main__':
    unittest.main()
