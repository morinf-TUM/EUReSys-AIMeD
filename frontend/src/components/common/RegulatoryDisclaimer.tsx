import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const RegulatoryDisclaimer: React.FC = () => {
  return (
    <Box sx={{ mb: 2, px: { xs: 2, md: 0 } }}>
      <Alert 
        severity="info"
        icon={<InfoIcon fontSize="inherit" />}
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'primary.light',
          '& .MuiAlert-icon': {
            color: 'primary.main',
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>Regulatory Compliance Notice</AlertTitle>
        This platform provides support for certification of AI-enabled medical devices in the EU market
         with <strong>conservative</strong> evaluations. 
        All determinations carried out therein require <strong>human review</strong> by <strong>qualified professionals</strong>.
        The system cannot and must not be considered as either making or enabling to make final legal determinations.
        <strong> Always consult with notified bodies and legal experts</strong> for official compliance.
      </Alert>
    </Box>
  );
};

export default RegulatoryDisclaimer;