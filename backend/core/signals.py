"""
Signal handlers for regulatory core application
"""

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import (
    ProductVersion, RegulatoryProfile, AuditLog,
    LLMInteraction, DocumentSection
)


@receiver(post_save, sender=ProductVersion)
def log_product_version_change(sender, instance, created, **kwargs):
    """Log product version changes for audit trail"""
    action = 'CREATE_PRODUCT_VERSION' if created else 'UPDATE_PRODUCT_VERSION'
    
    AuditLog.objects.create(
        action=action,
        model_type='ProductVersion',
        model_id=instance.id,
        created_by=instance.created_by,
        updated_by=instance.updated_by,
        action_details={
            'version_number': instance.version_number,
            'change_type': instance.change_type,
            'release_date': instance.release_date.isoformat()
        },
        is_system_action=False
    )


@receiver(post_save, sender=RegulatoryProfile)
def log_regulatory_profile_change(sender, instance, created, **kwargs):
    """Log regulatory profile changes for compliance tracking"""
    action = 'CREATE_REGULATORY_PROFILE' if created else 'UPDATE_REGULATORY_PROFILE'
    
    AuditLog.objects.create(
        action=action,
        model_type='RegulatoryProfile',
        model_id=instance.id,
        created_by=instance.created_by,
        updated_by=instance.updated_by,
        action_details={
            'mdr_class': instance.mdr_class,
            'ai_act_high_risk': instance.ai_act_high_risk,
            'requires_dpia': instance.requires_dpia,
            'overall_compliance_status': instance.overall_compliance_status
        },
        is_compliance_critical=True
    )


@receiver(post_save, sender=LLMInteraction)
def log_llm_interaction(sender, instance, created, **kwargs):
    """Log LLM interactions for safety and compliance"""
    if created:
        AuditLog.objects.create(
            action='LLM_INTERACTION',
            model_type='LLMInteraction',
            model_id=instance.id,
            created_by=instance.user,
            updated_by=instance.user,
            action_details={
                'interaction_type': instance.interaction_type,
                'tokens_used': instance.tokens_used,
                'status': instance.status,
                'document_section': str(instance.document_section.id) if instance.document_section else None
            },
            is_system_action=False
        )


@receiver(pre_delete, sender=DocumentSection)
def log_document_section_deletion(sender, instance, **kwargs):
    """Log document section deletions for audit trail"""
    AuditLog.objects.create(
        action='DELETE_DOCUMENT_SECTION',
        model_type='DocumentSection',
        model_id=instance.id,
        created_by=instance.created_by,
        updated_by=instance.updated_by,
        action_details={
            'title': instance.title,
            'section_number': instance.section_number,
            'content_status': instance.content_status
        },
        is_compliance_critical=True
    )