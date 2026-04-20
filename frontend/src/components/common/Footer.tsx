import React from 'react';
import { Box, Typography, Link, Container, Grid, Divider } from '@mui/material';
import { Facebook, Twitter, LinkedIn, GitHub } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        mt: 4,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              EUReSys-AIMeD Support Platform
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Regulatory support for certification of AI-enabled medical devices in the EU market.
              Covers MDR, AI Act, and GDPR in particular.
            </Typography>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom>
              Resources
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <Link href="/scoping" color="inherit" display="block" sx={{ my: 0.5 }}>
                Regulatory Scoping
              </Link>
              <Link href="/sources" color="inherit" display="block" sx={{ my: 0.5 }}>
                Legal ressources
              </Link>
              <Link href="/templates" color="inherit" display="block" sx={{ my: 0.5 }}>
                Document templates
              </Link>
            </Typography>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom>
              TEF-Health
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <Link href="https://tefhealth.eu" color="inherit" display="block" sx={{ my: 0.5 }}>
                Website
              </Link>
              <Link href="https://tef.charite.de/helpdesk" color="inherit" display="block" sx={{ my: 0.5 }}>
                Helpdesk
              </Link>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Link href="#" color="inherit" aria-label="Facebook">
                  <Facebook fontSize="small" />
                </Link>
                <Link href="https://x.com/TefHealth" color="inherit" aria-label="Twitter">
                  <Twitter fontSize="small" />
                </Link>
                <Link href="https://de.linkedin.com/company/tef-health" color="inherit" aria-label="LinkedIn">
                  <LinkedIn fontSize="small" />
                </Link>
                <Link href="#" color="inherit" aria-label="GitHub">
                  <GitHub fontSize="small" />
                </Link>
              </Box>
            </Typography>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom>
              Legal
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <Link href="/privacy-policy" color="inherit" display="block" sx={{ my: 0.5 }}>
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" color="inherit" display="block" sx={{ my: 0.5 }}>
                Terms of Service
              </Link>
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Regulatory support for AI-enabled medical devices. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This system provides conservative support in EU regulatory matters.
            Always consult with qualified professionals.
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Disclaimer: This system is designed to assist with regulatory compliance but does not provide legal advice.
            All regulatory determinations should be reviewed by qualified professionals.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;