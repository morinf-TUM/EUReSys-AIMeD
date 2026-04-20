import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardActions} from '@mui/material';
import { Link } from 'react-router-dom';
import { CheckCircle, Assessment, Description, AdminPanelSettings } from '@mui/icons-material';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Approaching the EU Regulatory System for AI-enabled Medical Devices 
      </Typography>

      {/* <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
        Designed for manufacturers, developers, and compliance professionals working with AI-enabled medical devices in the European market, our platform provides a starting point to help you navigate MDR EU 2017/745,
        AI Act, and GDPR compliance.
      </Typography> */}

      {/*import { Grid, Typography, Box, Link } from "@mui/material";*/}

      <Grid container spacing={4}>
        {/* Left: 2/3 width */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" color="text.secondary" paragraph>
            Free compliance information for AI-enabled medical devices
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ mb: 2 }}
          >
            Designed for manufacturers and developers working on AI-enabled medical devices to be commercialized in the European market, our platform provides a starting point to help you navigate MDR EU 2017/745,
            AI Act, and GDPR compliance. It provides you with the three types of resources and services described below.
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ mb: 2 }}
          >
            Beyond the direct purpose of helping you understand your regulatory obligations, it is also meant to 
            connect you with apposite services provided by the <strong>European Testing and Experimentation Facility for Health</strong>, should you need them.
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ mb: 2 }}
          >
            The only thing you will need to access those resources is 
            to login by clicking the top right link 'login' or 
            to create a valid account by clicking 'register'. 
            The procedure is free, does not generate any commitment on your part and only takes a few seconds. 
            See our {" "}
              <Link to="/help">
                'Getting Started'
              </Link> 
              {" "}
              guide for more information.
          </Typography>
        </Grid>

        {/* Right: 1/3 width */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Box
                component="img"
                src="/tefhires3-small.png"
                alt="TEF-Health Logo"
                sx={{
                  width: 220,
                  height: "auto",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  alignItems: "center",
                }}
              />
            </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "flex-start",
            }}
          >
            
            <Typography variant="body2">
              The creation of this platform was supported by the European Commission and EU member states through the TEF-Health project.
            </Typography>

            {/* <Box>
              <Link href="#" underline="none">
                  component="img"
                  src="/logo.png"
                  alt="Platform Logo"
                  sx={{
                    width: 120,
                    cursor: "pointer",
                  }}
              </Link>
            </Box> */}
          </Box>
        </Grid>
      </Grid>


      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Typography variant="h5" component="h3">
                  Regulatory Scoping
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Classification process for your AI medical device. Determine applicability
                of MDR, AI Act, and GDPR with clear explanations.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button 
                size="small"
                component={Link} 
                to="/scoping"
                variant="contained"
                color="primary"
              >
                Start Scoping
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Description color="success" sx={{ mr: 1, fontSize: 40 }} />
                <Typography variant="h5" component="h3">
                  Documentation Center
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Learn about regulatory documentation by exploring legal texts and structured templates.
              </Typography>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'center' }}> {/*'space-between'*/}
              <Button 
                size="small"
                component={Link} 
                to="/templates"
                variant="contained"
                color="success"
                sx={{ textAlign: 'center' }}
              >
                Template List
              </Button>
              <Button 
                size="small"
                component={Link} 
                to="/sources"
                variant="contained"
                color="success"
                sx={{ textAlign: 'center' }}
              >
                Legal Resources
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="secondary" sx={{ mr: 1, fontSize: 40 }} />
                <Typography variant="h5" component="h3">
                  Planning CE marking
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                If you have any question regarding the steps required to obtain CE certification for your product, check out our self-assessment cheklist and contact TEF-Health.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button 
                size="small"
                component={Link} 
                to="/checklist"
                variant="contained"
                color="secondary"
                sx={{ textAlign: 'center' }}
              >
                Self-Assessment Checklist
              </Button>
              <Button 
                size="small"
                component={Link} 
                to="/contact"
                variant="contained"
                color="secondary"
                sx={{ textAlign: 'center' }}
              >
                Contact TEF-Health
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>



      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Key Features
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircle color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <div>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Classification according to MDR
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rule-based regulatory classification provided with justifications.
                </Typography>
              </div>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircle color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <div>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Cross-Regulation Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Integrated MDR, AI Act, and GDPR compliance assessment
                </Typography>
              </div>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircle color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <div>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Conservative evaluations and suggestions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The system is meant to always err on the side of caution.
                </Typography>
              </div>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <CheckCircle color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <div>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  LLM-Assisted Documentation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Constrained AI assistance with human review requirements.
                </Typography>
              </div>
            </Box>
          </Grid> 
        </Grid>
      </Box>



      <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: '600px', mx: 'auto', mb: 3 }}>
          Begin your regulatory compliance journey with our platform.  <br />
          Create an account to access the scoping tool.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained"
            size="large"
            component={Link}
            to="/scoping"
            startIcon={<CheckCircle />}
          >
            Start Regulatory Scoping
          </Button>
          <Button 
            variant="outlined"
            size="large"
            component={Link}
            to="/register"
            startIcon={<AdminPanelSettings />}
          >
            Create Account
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;