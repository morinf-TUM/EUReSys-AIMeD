"""
Serializers for regulatory core application
"""

from rest_framework import serializers
from .models import (
    Product, ProductVersion, RegulatoryProfile,
    DocumentSet, DocumentSection, Company
)


class CompanySerializer(serializers.ModelSerializer):
    """Company serializer"""
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'legal_entity_name', 'registration_number',
            'headquarters_address', 'eu_authorized_representative',
            'contact_person', 'has_quality_management_system',
            'qms_certificate_number', 'qms_certificate_issuer',
            'qms_certificate_date', 'created_at', 'updated_at',
            'version', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version']


class ProductSerializer(serializers.ModelSerializer):
    """Product serializer"""
    company = CompanySerializer(read_only=True)
    company_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'company', 'company_id', 'name', 'internal_reference',
            'description', 'current_regulatory_profile', 'created_at',
            'updated_at', 'version', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version', 'current_regulatory_profile']


class ProductVersionSerializer(serializers.ModelSerializer):
    """Product version serializer"""
    class Meta:
        model = ProductVersion
        fields = [
            'id', 'product', 'version_number', 'release_date',
            'release_notes', 'change_type', 'change_from_version',
            'regulatory_snapshot', 'created_at', 'updated_at',
            'version', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version', 'regulatory_snapshot']


class RegulatoryProfileSerializer(serializers.ModelSerializer):
    """Regulatory profile serializer"""
    class Meta:
        model = RegulatoryProfile
        fields = [
            'id', 'product_version', 'mdr_applicable', 'mdr_class',
            'mdr_classification_rules', 'mdr_justification',
            'ai_act_applicable', 'ai_act_high_risk',
            'ai_act_high_risk_justification', 'ai_act_annex_ii_reference',
            'gdpr_applicable', 'processes_special_categories',
            'requires_dpia', 'gdpr_legal_basis', 'gdpr_justification',
            'overall_compliance_status', 'created_at', 'updated_at',
            'version', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version']


class DocumentSetSerializer(serializers.ModelSerializer):
    """Document set serializer"""
    class Meta:
        model = DocumentSet
        fields = [
            'id', 'product_version', 'regulatory_profile', 'status',
            'document_version', 'created_at', 'updated_at',
            'version', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version']


class DocumentSectionSerializer(serializers.ModelSerializer):
    """Document section serializer"""
    class Meta:
        model = DocumentSection
        fields = [
            'id', 'document_set', 'title', 'section_number',
            'template_reference', 'content', 'content_status',
            'regulatory_requirements', 'llm_generation_count',
            'last_llm_interaction', 'created_at', 'updated_at',
            'version', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version', 'llm_generation_count']