import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, Link } from '@mui/material';
import { Email, Send, Info } from '@mui/icons-material';

const ContactPage: React.FC = () => {
  const [regulatoryScopingText, setRegulatoryScopingText] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that the text field is not blank
    if (!regulatoryScopingText.trim()) {
      setErrorMessage('Please provide your regulatory scoping information.');
      setSubmissionStatus('error');
      return;
    }

    try {
      setSubmissionStatus('submitting');
      setErrorMessage('');
      
      // In a real implementation, this would send the data to the backend
      // For now, we'll simulate a successful submission
      console.log('Contact request submitted with data:', {
        regulatoryScopingText,
        // In a real app, we would also include the user's email from their account
        // userEmail: getCurrentUserEmail()
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmissionStatus('success');
      
    } catch (error) {
      console.error('Error submitting contact request:', error);
      setErrorMessage('Failed to send your request. Please try again later.');
      setSubmissionStatus('error');
    }
  };

  return (
    <Box sx={{ py: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Email color="primary" sx={{ fontSize: 32 }} />
        Contact TEF-Health
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4 }}>
        If you have questions regarding the tests you need to obtain CE certification for your product,
        please provide your regulatory scoping information below and we will contact you as soon as possible.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="body1" paragraph>
          To know more about TEF-Health, visit: 
          <Link href="https://tefhealth.eu/home" target="_blank" rel="noopener noreferrer" sx={{ ml: 1 }}>
            https://tefhealth.eu/home
          </Link>
        </Typography>

        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          To evaluate how TEF-Health can help you on the basis of the regulatory scoping evaluation, 
          please paste the latter below.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            label="Regulatory Scoping Information"
            multiline
            rows={8}
            fullWidth
            variant="outlined"
            value={regulatoryScopingText}
            onChange={(e) => setRegulatoryScopingText(e.target.value)}
            placeholder="Paste your regulatory scoping evaluation here..."
            disabled={submissionStatus === 'submitting'}
            sx={{ mb: 3 }}
          />

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Info sx={{ mr: 1 }} />
              {errorMessage}
            </Alert>
          )}

          {submissionStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Info sx={{ mr: 1 }} />
              Information sent. We will contact you as soon as possible.
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Send />}
            disabled={submissionStatus === 'submitting' || submissionStatus === 'success'}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500
            }
            }
          >
            {submissionStatus === 'submitting' ? 'Sending...' : 'Send contact request'}
          </Button>
        </Box>
      </Paper>

      {process.env.REACT_APP_CONTACT_EMAIL && (
        <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          <Typography variant="body2">
            For urgent matters, you can also contact us directly at:{' '}
            <Link href={`mailto:${process.env.REACT_APP_CONTACT_EMAIL}`}>
              {process.env.REACT_APP_CONTACT_EMAIL}
            </Link>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContactPage;