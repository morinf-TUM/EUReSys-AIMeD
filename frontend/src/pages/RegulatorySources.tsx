import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert, Tabs, Tab, List, ListItem, ListItemText, Divider, Chip, Card, CardContent, CardActions, Pagination, AlertTitle, Grid } from '@mui/material';
import { Search, Article, Gavel, Book, MenuBook } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import apiService from '../services/api';

const RegulatorySources: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [regulations, setRegulations] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const fetchRegulatorySources = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, we would fetch actual regulatory sources
        // For now, we'll use mock data
        const mockRegulations = [
          {
            id: '1',
            title: 'MDR EU 2017/745 - Medical Device Regulation',
            reference: 'MDR',
            type: 'regulation',
            description: 'Complete text of the Medical Device Regulation including all articles and annexes',
            sections: [
              { id: '1-1', title: 'Article 1 - Subject Matter and Scope', reference: 'MDR Article 1' },
              { id: '1-2', title: 'Article 2 - Definitions', reference: 'MDR Article 2' },
              { id: '1-3', title: 'Annex I - General Safety and Performance Requirements', reference: 'MDR Annex I' },
              { id: '1-4', title: 'Annex VIII - Classification Rules', reference: 'MDR Annex VIII' },
              { id: '1-5', title: 'Annex IX - Conformity Assessment Procedures', reference: 'MDR Annex IX' },
            ]
          },
          {
            id: '2',
            title: 'AI Act - Artificial Intelligence Act',
            reference: 'AI Act',
            type: 'regulation',
            description: 'Proposal for a regulation laying down harmonized rules on artificial intelligence',
            sections: [
              { id: '2-1', title: 'Article 1 - Subject Matter', reference: 'AI Act Article 1' },
              { id: '2-2', title: 'Article 6 - Classification of AI Systems', reference: 'AI Act Article 6' },
              { id: '2-3', title: 'Annex II - High-Risk AI Systems', reference: 'AI Act Annex II' },
              { id: '2-4', title: 'Annex III - Technical Documentation', reference: 'AI Act Annex III' },
            ]
          },
          {
            id: '3',
            title: 'GDPR EU 2016/679 - General Data Protection Regulation',
            reference: 'GDPR',
            type: 'regulation',
            description: 'Complete text of the General Data Protection Regulation',
            sections: [
              { id: '3-1', title: 'Article 4 - Definitions', reference: 'GDPR Article 4' },
              { id: '3-2', title: 'Article 6 - Lawfulness of Processing', reference: 'GDPR Article 6' },
              { id: '3-3', title: 'Article 9 - Processing of Special Categories', reference: 'GDPR Article 9' },
              { id: '3-4', title: 'Article 22 - Automated Decision Making', reference: 'GDPR Article 22' },
              { id: '3-5', title: 'Article 35 - Data Protection Impact Assessment', reference: 'GDPR Article 35' },
            ]
          },
          {
            id: '4',
            title: 'MDR Guidance Documents',
            reference: 'MDR Guidance',
            type: 'guidance',
            description: 'Official guidance documents and interpretations for MDR implementation',
            sections: [
              { id: '4-1', title: 'Guidance on Software Classification', reference: 'MDCG 2019-11' },
              { id: '4-2', title: 'Guidance on Clinical Evaluation', reference: 'MDCG 2020-13' },
              { id: '4-3', title: 'Guidance on UDI System', reference: 'MDCG 2018-1' },
            ]
          },
          {
            id: '5',
            title: 'AI Act Guidance',
            reference: 'AI Act Guidance',
            type: 'guidance',
            description: 'Guidance on the application of the AI Act to medical devices',
            sections: [
              { id: '5-1', title: 'Guidance on High-Risk Classification', reference: 'AI Act Guidance 1' },
              { id: '5-2', title: 'Technical Documentation Requirements', reference: 'AI Act Guidance 2' },
            ]
          }
        ];
        
        setRegulations(mockRegulations);
      } catch (err) {
        setError('Failed to load regulatory sources. Please try again.');
        console.error('Error fetching regulatory sources:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegulatorySources();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const getRegulationIcon = (type: string) => {
    switch (type) {
      case 'regulation': return <Gavel color="primary" />;
      case 'guidance': return <MenuBook color="secondary" />;
      case 'standard': return <DescriptionIcon color="success" />;
      default: return <Article />;
    }
  };

  const filteredRegulations = regulations.filter(regulation =>
    regulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regulation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regulation.sections.some((section: any) => 
      section.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedRegulations = filteredRegulations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleViewSource = async (reference: string) => {
    try {
      setLoading(true);
      const response = await apiService.getRegulatorySource(reference);
      
      if (response.success && response.data) {
        // In a real implementation, we would show the source content
        console.log('Regulatory source:', response.data);
      } else {
        setError(response.error || 'Failed to load regulatory source');
      }
    } catch (err) {
      setError('Failed to load regulatory source. Please try again.');
      console.error('Error fetching regulatory source:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Regulatory Sources
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
        Access the full text of EU regulations, guidance documents, and standards relevant to AI medical devices.
        Search and browse regulatory sources to support your compliance efforts.
      </Typography>

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <AlertTitle>Regulatory Reference</AlertTitle>
        All regulatory sources are provided for informational purposes. Always consult the official EU publications
        for the most current and authoritative versions of regulations.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search regulations, articles, and annexes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
          }}
          sx={{ mb: 3 }}
        />

        <Typography variant="body2" color="text.secondary">
          Found {filteredRegulations.length} regulatory sources
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="All Regulations" icon={<Gavel />} iconPosition="start" />
          <Tab label="MDR" icon={<Article />} iconPosition="start" />
          <Tab label="AI Act" icon={<Article />} iconPosition="start" />
          <Tab label="GDPR" icon={<Article />} iconPosition="start" />
          <Tab label="Guidance" icon={<MenuBook />} iconPosition="start" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {paginatedRegulations.length > 0 ? (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {paginatedRegulations.map(regulation => (
                <Grid item xs={12} key={regulation.id}>
                  <Card elevation={1} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getRegulationIcon(regulation.type)}
                        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
                          {regulation.title}
                        </Typography>
                        <Chip 
                          label={regulation.reference}
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {regulation.description}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Key Sections:
                      </Typography>
                      <List dense>
                        {regulation.sections.slice(0, 5).map((section: any) => (
                          <ListItem key={section.id} sx={{ pl: 0 }}>
                            <ListItemText 
                              primary={section.title}
                              secondary={section.reference}
                            />
                          </ListItem>
                        ))}
                        {regulation.sections.length > 5 && (
                          <ListItem sx={{ pl: 0 }}>
                            <ListItemText 
                              primary={`+ ${regulation.sections.length - 5} more sections`}
                              secondary="Click to view all"
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small"
                        onClick={() => handleViewSource(regulation.reference)}
                        startIcon={<Article />}
                      >
                        View Full Text
                      </Button>
                      <Button 
                        size="small"
                        color="secondary"
                        startIcon={<Book />}
                      >
                        Related Guidance
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No regulatory sources match your search criteria.
            </Alert>
          )}
          
          {filteredRegulations.length > pageSize && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(filteredRegulations.length / pageSize)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      )}

      <Alert severity="info" icon={<InfoIcon />}>
        <AlertTitle>Regulatory Updates</AlertTitle>
        Stay informed about regulatory changes by subscribing to our newsletter.
        We regularly update our regulatory database with the latest EU publications and guidance documents.
      </Alert>
    </Box>
  );
};

export default RegulatorySources;