"""
Configuration for the regulatory core application
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Core application configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.core'
    verbose_name = 'EU AI Medical Device Regulatory Core'
    
    def ready(self):
        """Application ready hook"""
        # Import and register signals
        import backend.core.signals