import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Tabs, Tab, TextField, Card, CardContent, CardActions, Divider, Chip, AlertTitle, Link } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Description, Edit, Save, AutoFixHigh, CheckCircle, Warning, Search, Add } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import apiService from '../services/api';
import { DocumentSet, DocumentSection } from '../types/regulatory';

const DocumentationCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [documentSets, setDocumentSets] = useState<DocumentSet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmRequirements, setLlmRequirements] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, we would fetch actual document sets
        // For now, we'll use mock data
        const mockDocumentSets: DocumentSet[] = [
          {
            id: '1',
            regulatoryProfileId: 'profile-1',
            documentType: 'technical-documentation',
            sections: [
              {
                id: '1-1',
                title: 'Device Description',
                templateReference: 'MDR Annex II 1.1',
                content: 'Detailed description of the AI medical device...',
                citations: ['MDR Annex II 1.1', 'MDR Article 10(2)'],
                status: 'draft',
                requiresApproval: true
              },
              {
                id: '1-2',
                title: 'Intended Purpose',
                templateReference: 'MDR Annex II 1.2',
                content: 'The device is intended for diagnosis of diabetic retinopathy...',
                citations: ['MDR Annex II 1.2', 'MDR Article 2(12)'],
                status: 'review-required',
                requiresApproval: true
              }
            ],
            version: 1,
            lastUpdated: new Date().toISOString()
          },
          {
            id: '2',
            regulatoryProfileId: 'profile-1',
            documentType: 'clinical-evaluation',
            sections: [
              {
                id: '2-1',
                title: 'Clinical Evidence',
                templateReference: 'MDR Annex XIV 1',
                content: 'Clinical evaluation report summarizing evidence...',
                citations: ['MDR Annex XIV 1', 'MDR Article 61'],
                status: 'draft',
                requiresApproval: true
              }
            ],
            version: 1,
            lastUpdated: new Date().toISOString()
          }
        ];
        
        setDocumentSets(mockDocumentSets);
      } catch (err) {
        setError('Failed to load documentation. Please try again.');
        console.error('Error fetching documentation:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentation();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditClick = (section: DocumentSection) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  };

  const handleSaveClick = async (sectionId: string, documentSetId: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Update the section content
      const response = await apiService.updateDocumentSection(
        documentSets[activeTab].regulatoryProfileId,
        sectionId,
        editContent
      );
      
      if (response.success && response.data) {
        // Update local state
        setDocumentSets(prevSets => {
          const updatedSets = [...prevSets];
          const sectionIndex = updatedSets[activeTab].sections.findIndex(s => s.id === sectionId);
          if (sectionIndex >= 0 && response.data) {
            updatedSets[activeTab].sections[sectionIndex] = response.data;
          }
          return updatedSets;
        });
        
        setEditingSection(null);
      } else {
        setError(response.error || 'Failed to update section');
      }
    } catch (err) {
      setError('Failed to update section. Please try again.');
      console.error('Error updating section:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLLMDraft = async (sectionId: string, documentSetId: string) => {
    if (!llmRequirements) {
      setError('Please provide requirements for the LLM draft');
      return;
    }
    
    try {
      setLlmLoading(true);
      setError('');
      
      const response = await apiService.requestLLMDraft(
        documentSets[activeTab].regulatoryProfileId,
        sectionId,
        llmRequirements
      );
      
      if (response.success && response.data) {
        // Pre-fill the edit content with LLM draft
        setEditContent(response.data);
        setEditingSection(sectionId);
        
        // Show warnings if any
        if (response.warnings && response.warnings.length > 0) {
          response.warnings.forEach(warning => {
            console.warn('LLM Warning:', warning);
          });
        }
      } else {
        setError(response.error || 'Failed to generate LLM draft');
      }
    } catch (err) {
      setError('Failed to generate LLM draft. Please try again.');
      console.error('Error generating LLM draft:', err);
    } finally {
      setLlmLoading(false);
    }
  };

  const currentDocumentSet = documentSets[activeTab];
  
  const filteredSections = currentDocumentSet?.sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Documentation Center
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
        Kickstart your regulatory documentation journey with the structured templates below.
        All content requires human review and approval before final submission.
      </Typography>

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <AlertTitle>Important Notice</AlertTitle>
        All LLM-generated content is marked as DRAFT and requires human review by qualified professionals.
        The system implements conservative interpretations and safety constraints.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {documentSets.map((set, index) => (
            <Tab 
              key={set.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {set.documentType.replace('-', ' ')}
                  <Chip 
                    label={`v${set.version}`}
                    size="small"
                    color="primary"
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {currentDocumentSet && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {currentDocumentSet.documentType.replace('-', ' ').toUpperCase()}
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ width: 300 }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            Found {filteredSections.length} of {currentDocumentSet.sections.length} sections
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filteredSections.map(section => (
                <Card key={section.id} elevation={2} sx={{ borderLeft: '4px solid', borderColor: getStatusColor(section.status) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {section.title}
                      </Typography>
                      <Chip 
                        label={section.status.replace('-', ' ')}
                        size="small"
                        color={getStatusColor(section.status)}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" paragraph>
                      Template: {section.templateReference}
                    </Typography>
                    
                    {editingSection === section.id ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={6}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                        
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => setEditingSection(null)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleSaveClick(section.id, currentDocumentSet.id)}
                            disabled={loading}
                            startIcon={<Save />}
                          >
                            Save
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                          {section.content}
                        </Typography>
                        
                        {section.requiresApproval && (
                          <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
                            This section requires approval before final submission
                          </Alert>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleEditClick(section)}
                            startIcon={<Edit />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setEditingSection(section.id)}
                            startIcon={<AutoFixHigh />}
                          >
                            Request LLM Draft
                          </Button>
                        </Box>
                        
                        {editingSection === section.id && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              LLM Draft Requirements
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              placeholder="Describe what you need the LLM to generate..."
                              value={llmRequirements}
                              onChange={(e) => setLlmRequirements(e.target.value)}
                              variant="outlined"
                              sx={{ mb: 2 }}
                            />
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => handleLLMDraft(section.id, currentDocumentSet.id)}
                              disabled={llmLoading || !llmRequirements}
                              startIcon={llmLoading ? <CircularProgress size={20} /> : <AutoFixHigh />}
                            >
                              {llmLoading ? 'Generating...' : 'Generate Draft'}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {section.citations.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Citations:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {section.citations.map(citation => (
                            <Chip key={citation} label={citation} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/profiles')}
          disabled={loading}
        >
          Back to Profiles
        </Button>
        
        <Button
          variant="contained"
          color="success"
          disabled={loading}
          startIcon={<CheckCircle />}
        >
          Submit for Review
        </Button>
      </Box>

      <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
        <AlertTitle>Documentation Guidelines</AlertTitle>
        All documentation must follow the required templates and include proper citations.
        LLM-generated content is marked with [DRAFT] and [END DRAFT] markers and requires human review.
        Consult our <Link href="/help" component="a">Help Center</Link> for detailed documentation requirements.
      </Alert>
    </Box>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'info';
    case 'review-required':
      return 'warning';
    case 'approved':
      return 'success';
    default:
      return 'default';
  }
}

export default DocumentationCenter;