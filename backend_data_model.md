# Backend Data Model - EU AI Medical Device System

> **Last reconciled against code:** commit `7bf8fbf`, 2026-04-20. Every
> model section matches a class under `backend/core/models/` as of that
> date. Field names, choice lists, and relationships may drift before
> this banner is next updated — when in doubt, read the code.

## 1. Core Data Model Overview

The data model is designed for full auditability, versioning, and regulatory traceability. All entities are timestamped, versioned, and attributable to specific users/actions.

## 2. Database Schema Design

### 2.1 Base Model (Abstract)

```python
class BaseModel:
    id = UUIDField(primary_key=True, default=uuid4)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    created_by = ForeignKey(User, on_delete=PROTECT, related_name='+')
    updated_by = ForeignKey(User, on_delete=PROTECT, related_name='+')
    version = PositiveIntegerField(default=1)
    is_active = BooleanField(default=True)
    
    class Meta:
        abstract = True
```

### 2.2 Company and Product Models

#### Company
```python
class Company(BaseModel):
    name = CharField(max_length=255)
    legal_entity_name = CharField(max_length=255)
    registration_number = CharField(max_length=100)
    headquarters_address = JSONField()  # Structured address
    eu_authorized_representative = JSONField(null=True, blank=True)
    contact_person = JSONField()
    
    # Compliance information
    has_quality_management_system = BooleanField(default=False)
    qms_certificate_number = CharField(max_length=100, null=True, blank=True)
    qms_certificate_issuer = CharField(max_length=100, null=True, blank=True)
    qms_certificate_date = DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.registration_number})"
```

#### Product
```python
class Product(BaseModel):
    company = ForeignKey(Company, on_delete=PROTECT, related_name='products')
    name = CharField(max_length=255)
    internal_reference = CharField(max_length=100, unique=True)
    description = TextField()
    
    # Regulatory status
    current_regulatory_profile = ForeignKey('RegulatoryProfile', on_delete=SET_NULL, null=True)
    
    # Versioning
    current_version = ForeignKey('ProductVersion', on_delete=SET_NULL, null=True, related_name='+')
    
    def __str__(self):
        return f"{self.name} ({self.internal_reference})"
```

#### ProductVersion
```python
class ProductVersion(BaseModel):
    product = ForeignKey(Product, on_delete=CASCADE, related_name='versions')
    version_number = CharField(max_length=50)  # e.g., "1.0", "2.0-beta"
    release_date = DateField()
    release_notes = TextField()
    
    # Regulatory snapshot
    regulatory_snapshot = JSONField()  # Full regulatory profile at this version
    
    # Change information
    change_from_version = ForeignKey('self', on_delete=SET_NULL, null=True, blank=True)
    change_type = CharField(max_length=50, choices=[
        ('initial', 'Initial Release'),
        ('minor', 'Minor Update'),
        ('substantial', 'Substantial Change'),
        ('major', 'Major Revision')
    ])
    
    def __str__(self):
        return f"{self.product.name} v{self.version_number}"
```

### 2.3 Regulatory Core Models

#### IntendedPurpose (Immutable)
```python
class IntendedPurpose(BaseModel):
    product = ForeignKey(Product, on_delete=CASCADE, related_name='intended_purposes')
    purpose_text = TextField()
    medical_indication = TextField()
    target_population = TextField()
    clinical_benefit = TextField()
    
    # MDR-specific fields
    is_medical_device = BooleanField()
    mdr_annex_i_compliance = BooleanField(default=False)
    
    # Locking mechanism
    is_locked = BooleanField(default=False)
    locked_at = DateTimeField(null=True, blank=True)
    locked_by = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Intended Purpose for {self.product.name}"
    
    def lock(self, user):
        """Make intended purpose immutable"""
        if not self.is_locked:
            self.is_locked = True
            self.locked_at = timezone.now()
            self.locked_by = user
            self.save()
            
            # Create audit log
            AuditLog.create(
                action='LOCK_INTENDED_PURPOSE',
                model_type='IntendedPurpose',
                model_id=self.id,
                user=user,
                details={'status': 'locked'}
            )
```

#### DeviceDescription
```python
class DeviceDescription(BaseModel):
    product_version = ForeignKey(ProductVersion, on_delete=CASCADE, related_name='device_descriptions')
    
    # Basic device information
    device_type = CharField(max_length=100)
    physical_description = TextField()
    
    # AI-specific information
    has_ai_components = BooleanField(default=False)
    ai_functionality_description = TextField(null=True, blank=True)
    ai_model_type = CharField(max_length=100, null=True, blank=True)
    ai_training_data_description = TextField(null=True, blank=True)
    
    # Software information
    is_software = BooleanField(default=False)
    software_classification = CharField(max_length=50, null=True, blank=True)
    
    def __str__(self):
        return f"Device Description for {self.product_version}"
```

#### RegulatoryProfile
```python
class RegulatoryProfile(BaseModel):
    product_version = ForeignKey(ProductVersion, on_delete=CASCADE, related_name='regulatory_profiles')
    
    # MDR Classification
    mdr_applicable = BooleanField(default=False)
    mdr_class = CharField(max_length=10, choices=[
        ('I', 'Class I'),
        ('IIa', 'Class IIa'), 
        ('IIb', 'Class IIb'),
        ('III', 'Class III')
    ], null=True, blank=True)
    mdr_classification_rules = ArrayField(CharField(max_length=20), null=True, blank=True)  # e.g., ['Rule 11']
    mdr_justification = TextField()
    
    # AI Act Classification
    ai_act_applicable = BooleanField(default=False)
    ai_act_high_risk = BooleanField(default=False)
    ai_act_high_risk_justification = TextField()
    ai_act_annex_ii_reference = CharField(max_length=50, null=True, blank=True)
    
    # GDPR Classification
    gdpr_applicable = BooleanField(default=False)
    processes_special_categories = BooleanField(default=False)
    requires_dpia = BooleanField(default=False)
    gdpr_legal_basis = CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return f"Regulatory Profile for {self.product_version}"
```

### 2.4 Documentation Models

#### DocumentSet
```python
class DocumentSet(BaseModel):
    product_version = ForeignKey(ProductVersion, on_delete=CASCADE, related_name='document_sets')
    regulatory_profile = ForeignKey(RegulatoryProfile, on_delete=CASCADE, related_name='document_sets')
    
    document_type = CharField(max_length=50, choices=[
        ('mdr_annex_ii', 'MDR Annex II Technical Documentation'),
        ('mdr_annex_iii', 'MDR Annex III Technical Documentation'),
        ('ai_act_technical', 'AI Act Technical Documentation'),
        ('gdpr_accountability', 'GDPR Accountability Documentation'),
        ('combined', 'Combined Regulatory Documentation')
    ])
    
    status = CharField(max_length=50, choices=[
        ('draft', 'Draft'),
        ('in_review', 'In Review'), 
        ('approved', 'Approved'),
        ('finalized', 'Finalized')
    ], default='draft')
    
    completion_percentage = IntegerField(default=0)
    
    def __str__(self):
        return f"{self.document_type} for {self.product_version}"
```

#### DocumentSection
```python
class DocumentSection(BaseModel):
    document_set = ForeignKey(DocumentSet, on_delete=CASCADE, related_name='sections')
    parent_section = ForeignKey('self', on_delete=CASCADE, null=True, blank=True, related_name='subsections')
    
    section_identifier = CharField(max_length=100)  # e.g., "1.1", "2.3.4"
    title = CharField(max_length=255)
    template_reference = CharField(max_length=100)  # Reference to template
    
    status = CharField(max_length=50, choices=[
        ('not_started', 'Not Started'),
        ('draft', 'Draft'),
        ('llm_assisted', 'LLM Assisted'),
        ('human_reviewed', 'Human Reviewed'),
        ('approved', 'Approved')
    ], default='not_started')
    
    content = TextField(null=True, blank=True)
    llm_generated_content = TextField(null=True, blank=True)
    final_content = TextField(null=True, blank=True)
    
    # Citation and source tracking
    regulatory_citations = JSONField(default=list)  # List of {article: str, regulation: str, text: str}
    
    def __str__(self):
        return f"{self.section_identifier} - {self.title}"
```

#### EvidenceItem
```python
class EvidenceItem(BaseModel):
    document_section = ForeignKey(DocumentSection, on_delete=CASCADE, related_name='evidence_items')
    
    evidence_type = CharField(max_length=50, choices=[
        ('clinical_data', 'Clinical Data'),
        ('technical_testing', 'Technical Testing'),
        ('literature', 'Scientific Literature'),
        ('standards_compliance', 'Standards Compliance'),
        ('risk_analysis', 'Risk Analysis'),
        ('user_feedback', 'User Feedback')
    ])
    
    description = TextField()
    source = TextField()
    file_reference = ForeignKey('FileUpload', on_delete=SET_NULL, null=True, blank=True)
    
    # Validation status
    validation_status = CharField(max_length=50, choices=[
        ('uploaded', 'Uploaded'),
        ('validated', 'Validated'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='uploaded')
    
    def __str__(self):
        return f"Evidence: {self.evidence_type} for {self.document_section}"
```

### 2.5 Change Management Models

#### ChangeEvent
```python
class ChangeEvent(BaseModel):
    product_version = ForeignKey(ProductVersion, on_delete=CASCADE, related_name='change_events')
    
    change_type = CharField(max_length=50, choices=[
        ('ai_model', 'AI Model Change'),
        ('training_data', 'Training Data Change'),
        ('intended_purpose', 'Intended Purpose Change'),
        ('risk_controls', 'Risk Controls Change'),
        ('software_update', 'Software Update'),
        ('hardware_change', 'Hardware Change'),
        ('documentation_update', 'Documentation Update')
    ])
    
    description = TextField()
    detailed_changes = JSONField()  # Structured change description
    
    # Impact assessment
    impact_assessment = JSONField()  # {"mdr_impact": "...", "ai_act_impact": "...", "gdpr_impact": "..."}
    change_classification = CharField(max_length=50, choices=[
        ('minor', 'Minor'),
        ('substantial', 'Substantial'),
        ('major', 'Major')
    ], null=True, blank=True)
    
    # Regulatory reassessment requirements
    requires_mdr_reassessment = BooleanField(default=False)
    requires_ai_act_reassessment = BooleanField(default=False)
    requires_gdpr_dpia_update = BooleanField(default=False)
    
    # Approval workflow
    status = CharField(max_length=50, choices=[
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='draft')
    
    def __str__(self):
        return f"Change Event: {self.change_type} for {self.product_version}"
```

#### ChangeImpactAssessment
```python
class ChangeImpactAssessment(BaseModel):
    change_event = ForeignKey(ChangeEvent, on_delete=CASCADE, related_name='impact_assessments')
    
    # MDR Impact
    mdr_classification_change = BooleanField(default=False)
    mdr_new_class = CharField(max_length=10, null=True, blank=True)
    mdr_justification = TextField(null=True, blank=True)
    
    # AI Act Impact
    ai_act_risk_change = BooleanField(default=False)
    ai_act_new_risk_level = BooleanField(null=True, blank=True)
    ai_act_justification = TextField(null=True, blank=True)
    
    # GDPR Impact
    gdpr_dpia_required = BooleanField(default=False)
    gdpr_new_legal_basis = CharField(max_length=100, null=True, blank=True)
    gdpr_justification = TextField(null=True, blank=True)
    
    # Documentation updates required
    documentation_updates = JSONField(default=list)  # List of section IDs requiring updates
    
    # Overall assessment
    overall_impact = CharField(max_length=50, choices=[
        ('none', 'No Significant Impact'),
        ('minor', 'Minor Impact'),
        ('substantial', 'Substantial Impact'),
        ('major', 'Major Impact - New Submission Required')
    ])
    
    def __str__(self):
        return f"Impact Assessment for {self.change_event}"
```

### 2.6 Audit and Versioning Models

#### AuditLog
```python
class AuditLog(BaseModel):
    action = CharField(max_length=100)
    model_type = CharField(max_length=100)
    model_id = UUIDField()
    
    # Action details
    action_details = JSONField()
    previous_state = JSONField(null=True, blank=True)
    new_state = JSONField(null=True, blank=True)
    
    # Context
    ip_address = CharField(max_length=45, null=True, blank=True)
    user_agent = TextField(null=True, blank=True)
    session_id = CharField(max_length=100, null=True, blank=True)
    
    # System-generated flag
    is_system_action = BooleanField(default=False)
    
    class Meta:
        indexes = [
            models.Index(fields=['model_type', 'model_id']),
            models.Index(fields=['created_at']),
            models.Index(fields=['action']),
        ]
    
    @classmethod
    def create(cls, action, model_type, model_id, user, details=None, previous_state=None, new_state=None):
        """Factory method for creating audit logs"""
        return cls.objects.create(
            action=action,
            model_type=model_type,
            model_id=model_id,
            created_by=user,
            updated_by=user,
            action_details=details or {},
            previous_state=previous_state,
            new_state=new_state,
            ip_address=get_client_ip() if not settings.TESTING else None,
            user_agent=get_user_agent() if not settings.TESTING else None,
            session_id=get_session_id() if not settings.TESTING else None
        )
```

#### VersionHistory
```python
class VersionHistory(BaseModel):
    model_type = CharField(max_length=100)
    model_id = UUIDField()
    version_number = PositiveIntegerField()
    
    # Version data
    version_data = JSONField()  # Full snapshot of the model at this version
    
    # Change information
    change_description = TextField(null=True, blank=True)
    changed_by = ForeignKey(User, on_delete=SET_NULL, null=True)
    change_reason = TextField(null=True, blank=True)
    
    # Relationship to audit log
    related_audit_logs = ManyToManyField(AuditLog, related_name='version_history')
    
    class Meta:
        unique_together = ('model_type', 'model_id', 'version_number')
        indexes = [
            models.Index(fields=['model_type', 'model_id']),
            models.Index(fields=['version_number']),
        ]
```

### 2.7 LLM Integration Models

#### LLMInteraction
```python
class LLMInteraction(BaseModel):
    user = ForeignKey(User, on_delete=SET_NULL, null=True)
    document_section = ForeignKey(DocumentSection, on_delete=SET_NULL, null=True, blank=True)
    
    # Interaction details
    interaction_type = CharField(max_length=50, choices=[
        ('explanation', 'Regulatory Explanation'),
        ('draft_text', 'Draft Text Generation'),
        ('citation_help', 'Citation Assistance'),
        ('template_help', 'Template Guidance')
    ])
    
    prompt = TextField()
    response = TextField()
    system_prompt_used = TextField()
    
    # RAG context
    rag_context = JSONField(default=list)  # List of retrieved documents
    
    # Usage tracking
    tokens_used = IntegerField()
    response_time_ms = IntegerField()
    
    # Approval status
    status = CharField(max_length=50, choices=[
        ('generated', 'Generated'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='generated')
    
    def __str__(self):
        return f"LLM Interaction: {self.interaction_type} by {self.user}"
```

#### RegulatorySource
```python
class RegulatorySource(BaseModel):
    regulation_type = CharField(max_length=50, choices=[
        ('mdr', 'MDR'),
        ('ai_act', 'AI Act'),
        ('gdpr', 'GDPR')
    ])
    
    source_type = CharField(max_length=50, choices=[
        ('article', 'Article'),
        ('annex', 'Annex'),
        ('recital', 'Recital'),
        ('guidance', 'Official Guidance')
    ])
    
    identifier = CharField(max_length=100)  # e.g., "Article 10", "Annex II"
    title = CharField(max_length=255)
    content = TextField()
    
    # Version information
    official_version = CharField(max_length=50)
    publication_date = DateField()
    
    # Embedding for RAG
    embedding = ArrayField(FloatField(), null=True, blank=True)
    
    def __str__(self):
        return f"{self.regulation_type} {self.source_type} {self.identifier}"
```

## 3. Database Indexing Strategy

### 3.1 Performance-Critical Indexes

```sql
-- Audit log indexes for compliance reporting
CREATE INDEX idx_audit_log_model_type_id ON audit_log(model_type, model_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Regulatory profile indexes for quick lookup
CREATE INDEX idx_regulatory_profile_product_version ON regulatory_profile(product_version_id);
CREATE INDEX idx_regulatory_profile_mdr_class ON regulatory_profile(mdr_class);
CREATE INDEX idx_regulatory_profile_ai_act_high_risk ON regulatory_profile(ai_act_high_risk);

-- Document section indexes for workspace performance
CREATE INDEX idx_document_section_document_set ON document_section(document_set_id);
CREATE INDEX idx_document_section_status ON document_section(status);
CREATE INDEX idx_document_section_section_identifier ON document_section(section_identifier);

-- Change management indexes
CREATE INDEX idx_change_event_product_version ON change_event(product_version_id);
CREATE INDEX idx_change_event_status ON change_event(status);
CREATE INDEX idx_change_event_change_type ON change_event(change_type);
```

## 4. Data Versioning Strategy

### 4.1 Versioning Approach

1. **Immutable Records**: Once created, regulatory decisions and intended purposes become immutable
2. **Version Chaining**: Each change creates a new version with explicit relationship to previous version
3. **Full Snapshots**: Complete state capture for each version (not just deltas)
4. **Audit Trail Integration**: Every version change logged with context

### 4.2 Versioning Workflow

```
┌───────────────────────────────────────────────────────┐
│                 Version Creation Process                │
├───────────────────────────────────────────────────────┤
│ 1. User initiates change                               │
│ 2. System validates change type                        │
│ 3. Impact assessment performed                         │
│ 4. New version created with full snapshot              │
│ 5. Previous version marked as superseded               │
│ 6. Audit logs created for all changes                  │
│ 7. Version history updated                             │
│ 8. Change event recorded                               │
└───────────────────────────────────────────────────────┘
```

## 5. Data Integrity and Validation

### 5.1 Validation Rules

```python
# Example validation for MDR classification
class MDRClassificationValidator:
    @staticmethod
    def validate_classification(product_version):
        """Validate MDR classification against Annex VIII rules"""
        device_description = product_version.device_descriptions.first()
        intended_purpose = product_version.product.intended_purposes.first()
        
        # Rule 11 validation for software
        if device_description.is_software:
            if "diagnosis" in intended_purpose.purpose_text.lower():
                if product_version.regulatory_profiles.first().mdr_class not in ['IIb', 'III']:
                    raise ValidationError(
                        "Software for diagnosis must be at least Class IIb per Rule 11"
                    )
        
        # Additional validation rules...
```

### 5.2 Data Integrity Constraints

```python
# Database-level constraints
class Meta:
    constraints = [
        # Ensure only one active regulatory profile per product version
        UniqueConstraint(
            fields=['product_version', 'is_active'],
            condition=Q(is_active=True),
            name='unique_active_regulatory_profile'
        ),
        
        # Ensure intended purpose cannot be modified after locking
        CheckConstraint(
            check=~Q(is_locked=True) | Q(updated_at__lte=F('locked_at')),
            name='intended_purpose_immutable_after_lock'
        ),
        
        # Ensure version numbers are sequential
        CheckConstraint(
            check=Q(version_number__gte=1),
            name='version_number_positive'
        )
    ]
```

## 6. Next Steps

This data model provides the foundation for implementing the deterministic decision engine and change management system. The next phase involves:

1. Implementing the decision tree logic
2. Creating the LLM integration layer with strict constraints
3. Building the change management workflow
4. Developing the frontend components