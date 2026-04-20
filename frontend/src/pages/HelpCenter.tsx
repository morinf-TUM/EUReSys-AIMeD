import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Divider, Chip, Tabs, Tab, Link, Alert, AlertTitle, Grid, Card, CardContent, CardActions } from '@mui/material';
import { HelpOutline, Search, ExpandMore, Lightbulb, Article, ContactSupport, School, Forum, VideoLibrary, Description } from '@mui/icons-material';

const HelpCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const faqItems = [
    {
      id: 'faq-1',
      question: 'What is the EU AI Medical Device Regulatory System?',
      answer: 'The EU AI Medical Device Regulatory System is a comprehensive platform designed to help manufacturers and developers of AI-enabled medical devices navigate the complex regulatory landscape of the European Union. It provides structured guidance for MDR EU 2017/745, AI Act, and GDPR compliance.'
    },
    {
      id: 'faq-2',
      question: 'How does the classification process work?',
      answer: 'Our system uses a rule-based approach to classify your AI medical device. You answer a series of questions about your device, and our system applies the relevant regulatory rules to determine the appropriate classification under MDR, AI Act, and GDPR.'
    },
    {
      id: 'faq-3',
      question: 'Is the classification legally binding?',
      answer: 'No, our system provides conservative guidance and recommendations, but all classifications require human review by qualified regulatory professionals. We always err on the side of compliance to ensure safety.'
    },
    {
      id: 'faq-4',
      question: 'How does the LLM assistance work?',
      answer: 'Our LLM assistance provides draft text and explanations to help you create regulatory documentation. All LLM-generated content is clearly marked as DRAFT and requires human review. The system implements safety constraints to prevent legal determinations.'
    },
    {
      id: 'faq-5',
      question: 'What regulations does the system cover?',
      answer: 'The system covers three main EU regulations: MDR EU 2017/745 (Medical Device Regulation), AI Act (Artificial Intelligence Act), and GDPR (General Data Protection Regulation). We provide integrated analysis across all three regulations.'
    },
    {
      id: 'faq-6',
      question: 'How secure is my data?',
      answer: 'We implement industry-standard security measures to protect your data. All communications are encrypted, and we follow strict data protection practices in accordance with GDPR requirements.'
    }
  ];

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gettingStartedSteps = [
    {
      title: 'Create an Account',
      description: 'Register for free to save your progress and access all features',
      link: '/register'
    },
    {
      title: 'Start Regulatory Scoping',
      description: 'Begin the step-by-step classification process for your AI device',
      link: '/scoping'
    },
    {
      title: 'Answer Questions',
      description: 'Provide information about your device through our guided questionnaire',
      link: '/decision-tree'
    },
    {
      title: 'Review Classification',
      description: 'Examine the preliminary classification results and justifications',
      link: '/profiles'
    },
    {
      title: 'Create Documentation',
      description: 'Use our templates and LLM assistance to generate required documents',
      link: '/documentation'
    },
    {
      title: 'Consult Experts',
      description: 'Review results with qualified regulatory professionals before submission'
    }
  ];

  const resources = [
    {
      title: 'MDR EU 2017/745 Full Text',
      description: 'Complete text of the Medical Device Regulation',
      type: 'regulation',
      link: '/sources?regulation=MDR'
    },
    {
      title: 'AI Act Proposal',
      description: 'Full text of the Artificial Intelligence Act proposal',
      type: 'regulation',
      link: '/sources?regulation=AI Act'
    },
    {
      title: 'GDPR EU 2016/679',
      description: 'Complete text of the General Data Protection Regulation',
      type: 'regulation',
      link: '/sources?regulation=GDPR'
    },
    {
      title: 'Regulatory Classification Guide',
      description: 'Comprehensive guide to device classification',
      type: 'guide',
      link: '#'
    },
    {
      title: 'Documentation Templates',
      description: 'Downloadable templates for regulatory documentation',
      type: 'template',
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for using the system',
      type: 'video',
      link: '#'
    }
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'regulation': return <Article color="primary" />;
      case 'guide': return <School color="secondary" />;
      case 'template': return <Description color="success" />;
      case 'video': return <VideoLibrary color="error" />;
      default: return <HelpOutline />;
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Help Center
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
        Find answers to common questions, learn how to use the system effectively, and access regulatory resources.
        Our comprehensive help center is designed to assist you throughout your compliance journey.
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Getting Started" icon={<Lightbulb />} iconPosition="start" />
          <Tab label="FAQ" icon={<Forum />} iconPosition="start" />
          <Tab label="Resources" icon={<Article />} iconPosition="start" />
          <Tab label="Contact Support" icon={<ContactSupport />} iconPosition="start" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Getting Started Guide
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Follow these steps to begin your regulatory compliance journey:
          </Typography>

          <List sx={{ mb: 4 }}>
            {gettingStartedSteps.map((step, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {index + 1}. {step.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {step.description}
                        {step.link && (
                          <Link href={step.link} color="primary" sx={{ ml: 1 }}>
                            Learn more
                          </Link>
                        )}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < gettingStartedSteps.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>

          <Alert severity="info" icon={<HelpOutline />}>
            <AlertTitle>Pro Tip</AlertTitle>
            Start with our Regulatory Scoping tool to get a comprehensive overview of your device's classification
            before diving into detailed documentation.
          </Alert>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Frequently Asked Questions
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ mb: 3 }}
          />

          <Typography variant="body2" color="text.secondary" paragraph>
            Found {filteredFaqs.length} of {faqItems.length} questions
          </Typography>

          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => (
              <Accordion
                key={item.id}
                expanded={expandedFaq === item.id}
                onChange={handleFaqChange(item.id)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Alert severity="info">
              No FAQs match your search. Try different keywords.
            </Alert>
          )}

          <Alert severity="info" icon={<HelpOutline />} sx={{ mt: 3 }}>
            <AlertTitle>Need More Help?</AlertTitle>
            If you can't find the answer you're looking for, please contact our support team.
          </Alert>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Regulatory Resources
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Access comprehensive regulatory resources to support your compliance efforts:
          </Typography>

          <Grid container spacing={3}>
            {resources.map((resource, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getResourceIcon(resource.type)}
                      <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
                        {resource.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {resource.description}
                    </Typography>
                    <Chip label={resource.type} size="small" variant="outlined" />
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small"
                      component={Link}
                      href={resource.link}
                      startIcon={<Article />}
                    >
                      Access Resource
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" icon={<HelpOutline />} sx={{ mt: 3 }}>
            <AlertTitle>Regulatory Updates</AlertTitle>
            Stay informed about the latest regulatory changes by subscribing to our newsletter
            and checking our resources section regularly.
          </Alert>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Contact Support
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Our support team is available to assist you with any questions or issues you may encounter.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Email Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For general inquiries and support requests:
              </Typography>
              <Link href="mailto:support@eu-ai-compliance.eu" color="primary">
                support@eu-ai-compliance.eu
              </Link>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Technical Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For technical issues and system questions:
              </Typography>
              <Link href="mailto:technical@eu-ai-compliance.eu" color="primary">
                technical@eu-ai-compliance.eu
              </Link>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Regulatory Consultation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For expert regulatory advice (premium service):
              </Typography>
              <Link href="mailto:consulting@eu-ai-compliance.eu" color="primary">
                consulting@eu-ai-compliance.eu
              </Link>
            </Box>
          </Box>

          <Alert severity="info" icon={<HelpOutline />}>
            <AlertTitle>Support Hours</AlertTitle>
            Our standard support hours are Monday to Friday, 9:00 AM to 5:00 PM CET.
            Emergency support is available for premium subscribers.
          </Alert>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Response Times
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Standard Support"
                  secondary="Response within 24 hours"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Premium Support"
                  secondary="Response within 4 hours"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Emergency Support"
                  secondary="Response within 1 hour"
                />
              </ListItem>
            </List>
          </Box>
        </Paper>
      )}

      <Alert severity="info" icon={<HelpOutline />}>
        <AlertTitle>Additional Assistance</AlertTitle>
        For urgent regulatory matters, we recommend consulting with qualified professionals or notified bodies.
        Our system provides guidance but does not replace official regulatory advice.
      </Alert>
    </Box>
  );
};

export default HelpCenter;