import React from 'react';
import { Box, Typography, Paper, Link, Divider } from '@mui/material';
import { Gavel, Description, Security, Person, Lock, Balance, Warning, Info, AccessTime, PrivacyTip } from '@mui/icons-material';

const TermsOfService: React.FC = () => {
  return (
    <Box sx={{ py: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Gavel color="primary" sx={{ fontSize: 32 }} />
        Terms of Service
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        <strong>Last updated:</strong> [Insert Date]
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          These Terms of Service ("Terms") govern your access to and use of the EUReSys-AIMeD 
          online platform (the "Platform"), operated by {" "}
            <Box
              component="span"
              sx={{
                backgroundColor: "warning.light",
                px: 0.5,
                borderRadius: 0.5,
                fontWeight: 500,
              }}
            >
              TEF-Health
            </Box>
           ("we", "us", "our"). By creating an account or using the Platform, you agree to be bound by these Terms.
        </Typography>

        <Typography variant="body1" paragraph>
          If you do not agree, do not use the Platform.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description color="primary" />
          1. The Service
        </Typography>

        <Typography variant="body1" paragraph>
          The Platform provides access to a "scoping" service intended to support users in understanding and structuring regulatory or compliance-related topics. The Service is informational in nature and does not constitute legal, medical, or professional advice.
        </Typography>

        <Typography variant="body1" paragraph>
          You remain solely responsible for how you interpret and apply the output of the Service.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          2. Eligibility
        </Typography>

        <Typography variant="body1" paragraph>
          You must be at least 18 years old and capable of entering into a legally binding agreement to use the Platform.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          3. Account Creation and Access
        </Typography>

        <Typography variant="body1" paragraph>
          To access the Service, you must create an account using a valid email address.
        </Typography>

        <Typography variant="body1" paragraph>
          You agree to:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>Provide accurate and current information</li>
          <li>Maintain the confidentiality of any login credentials</li>
          <li>Notify us promptly of any unauthorized access</li>
        </Typography>

        <Typography variant="body1" paragraph>
          You are responsible for all activity occurring under your account.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock color="primary" />
          4. Acceptable Use
        </Typography>

        <Typography variant="body1" paragraph>
          You agree not to:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>Use the Platform for unlawful purposes</li>
          <li>Interfere with or disrupt the operation of the Platform</li>
          <li>Attempt to gain unauthorized access to systems or data</li>
          <li>Reverse engineer, copy, or resell the Service</li>
          <li>Upload or transmit harmful, malicious, or misleading content</li>
        </Typography>

        <Typography variant="body1" paragraph>
          We may suspend or terminate access if these Terms are violated.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          5. Intellectual Property
        </Typography>

        <Typography variant="body1" paragraph>
          All content, software, and materials provided on the Platform are owned by us. 
          All inputs and materials provided by you, as well as any content generated therefrom in the context of using the scoping service of the platform, belong to you.
          We do not store any information related to your medical device, nor the results of the scoping process.
        </Typography>

        <Typography variant="body1" paragraph>
          You are granted a limited, non-exclusive, non-transferable right to use the Platform solely for your own informational purposes.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime color="primary" />
          6. Availability and Changes
        </Typography>

        <Typography variant="body1" paragraph>
          We aim to provide continuous availability but do not guarantee uninterrupted or error-free operation.
        </Typography>

        <Typography variant="body1" paragraph>
          We may modify, suspend, or discontinue any part of the Platform at any time, with or without notice.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="primary" />
          7. Termination
        </Typography>

        <Typography variant="body1" paragraph>
          You may delete your account at any time.
        </Typography>

        <Typography variant="body1" paragraph>
          We may suspend or terminate your access if:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>You breach these Terms</li>
          <li>We are required to do so by law</li>
          <li>Continued operation becomes impracticable</li>
        </Typography>

        <Typography variant="body1" paragraph>
          Upon termination, your right to use the Platform ceases immediately.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info color="primary" />
          8. Disclaimer
        </Typography>

        <Typography variant="body1" paragraph>
          The Platform is provided "as is" and "as available."
        </Typography>

        <Typography variant="body1" paragraph>
          We make no warranties, express or implied, including:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>Fitness for a particular purpose</li>
          <li>Accuracy or completeness of outputs</li>
          <li>Regulatory or legal sufficiency of any results</li>
        </Typography>

        <Typography variant="body1" paragraph>
          The Service does not replace professional advice.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="primary" />
          9. Limitation of Liability
        </Typography>

        <Typography variant="body1" paragraph>
          To the maximum extent permitted by law:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>We shall not be liable for indirect, incidental, or consequential damages</li>
          <li>Our total liability arising from your use of the Platform shall be zero, as the Service is free.</li>
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrivacyTip color="primary" />
          10. Data Protection
        </Typography>

        <Typography variant="body1" paragraph>
          We process personal data in accordance with our <Link href="/privacy-policy">Privacy Policy</Link>. By using the Platform, you acknowledge and accept that processing.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Balance color="primary" />
          11. Governing Law and Jurisdiction
        </Typography>

        <Typography variant="body1" paragraph>
          These Terms are governed by the laws of [Member State].
        </Typography>

        <Typography variant="body1" paragraph>
          Any disputes shall be subject to the exclusive jurisdiction of the courts of [City, Country], unless otherwise required by mandatory consumer protection law.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime color="primary" />
          12. Changes to These Terms
        </Typography>

        <Typography variant="body1" paragraph>
          We may update these Terms from time to time. Updated versions will be published on the Platform with a revised "Last updated" date. Continued use constitutes acceptance of the revised Terms.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          <Typography variant="body2">
            For any questions regarding these Terms of Service, please contact us at: 
            <Link href="mailto:[Contact Email]">[Contact Email]</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TermsOfService;