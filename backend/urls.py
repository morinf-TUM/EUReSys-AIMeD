"""
URL configuration for EU AI Medical Device Regulatory System
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints for regulatory system
    path('api/', include('backend.core.urls')),
]

# Add static files URL patterns for development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Add templates URL pattern
    from django.views.static import serve
    import os
    # Use the current project directory (TEF root) - BASE_DIR is already the TEF root
    templates_root = os.path.join(settings.BASE_DIR, 'extracted_templates')
    print(f"📁 Templates will be served from: {templates_root}")
    print(f"📁 Templates directory exists: {os.path.exists(templates_root)}")
    if os.path.exists(templates_root):
        print(f"📁 Found {len(os.listdir(templates_root))} files in templates directory")
    else:
        print(f"❌ Templates directory not found at: {templates_root}")
    urlpatterns += [
        path('templates/<path:path>', serve, {'document_root': templates_root}),
    ]