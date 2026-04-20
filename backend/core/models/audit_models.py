from django.db import models
from .base_model import BaseModel

class AuditLog(BaseModel):
    """
    Comprehensive audit log for all system actions
    """
    # Action metadata
    action = models.CharField(max_length=100)
    model_type = models.CharField(max_length=100)
    model_id = models.UUIDField(null=True, blank=True)
    
    # User information
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    updated_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    
    # Action details
    action_details = models.JSONField(default=dict)
    
    # System flags
    is_system_action = models.BooleanField(default=False)
    is_compliance_critical = models.BooleanField(default=False)
    
    # IP and session tracking (would be populated by middleware)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return f"{self.action} on {self.model_type} by {self.created_by}"

class VersionHistory(BaseModel):
    """
    Version history for regulatory documents and profiles
    """
    # Reference to the versioned object
    content_type = models.CharField(max_length=100)  # e.g., 'RegulatoryProfile', 'DocumentSection'
    object_id = models.UUIDField()
    
    # Version metadata
    version_number = models.PositiveIntegerField()
    version_date = models.DateTimeField(auto_now_add=True)
    
    # Version content
    version_data = models.JSONField()  # Full snapshot of the object at this version
    
    # Change information
    changed_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    change_reason = models.TextField(blank=True, null=True)
    
    # Audit trail
    audit_log = models.ForeignKey(AuditLog, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Version {self.version_number} of {self.content_type} {self.object_id}"