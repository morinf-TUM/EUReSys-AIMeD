from django.db import models
from django.utils import timezone
import uuid

class BaseModel(models.Model):
    """
    Abstract base model with common fields for all regulatory models
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.PROTECT, related_name='+')
    updated_by = models.ForeignKey('auth.User', on_delete=models.PROTECT, related_name='+')
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        abstract = True
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.__class__.__name__} {self.id}"
    
    def save(self, *args, **kwargs):
        """Override save to handle versioning"""
        if self.pk:
            # Update existing instance - increment version
            try:
                original = self.__class__.objects.get(pk=self.pk)
                if original.version != self.version:
                    self.version = original.version + 1
            except self.__class__.DoesNotExist:
                # This is a new instance, don't increment version
                pass
        super().save(*args, **kwargs)