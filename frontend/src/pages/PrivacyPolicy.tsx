import React from 'react';
import { Box, Typography, Paper, Link, Divider } from '@mui/material';
import { PrivacyTip, Security, Email, AccessTime, Gavel } from '@mui/icons-material';

const PrivacyPolicy: React.FC = () => {
  return (
    <Box sx={{ py: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PrivacyTip color="primary" sx={{ fontSize: 32 }} />
        Privacy Policy
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        <strong>Last updated:</strong> [Insert Date]
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          This Privacy Policy explains how we collect, use, and protect personal data when 
          you use our EUReSys-AIMeD online platform (the "Platform").
           We are committed to protecting your privacy and complying with the General Data Protection Regulation (EU) 2016/679 ("GDPR").
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gavel color="primary" />
          1. Data Controller
        </Typography>

        <Typography variant="body1" paragraph>
          {" "}
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
            </Box><br/>
          {" "}
            <Box
              component="span"
              sx={{
                backgroundColor: "warning.light",
                px: 0.5,
                borderRadius: 0.5,
                fontWeight: 500,
              }}
            >
              [Registered Address]
            </Box>
          <br/>
          <Link href="mailto:[Email Address for Privacy Inquiries]">
          {" "}
            <Box
              component="span"
              sx={{
                backgroundColor: "warning.light",
                px: 0.5,
                borderRadius: 0.5,
                fontWeight: 500,
              }}
            >
              [Email Address for Privacy Inquiries]
            </Box>   
          </Link>
        </Typography>

        <Typography variant="body1" paragraph>
          We are the data controller responsible for your personal data.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email color="primary" />
          2. Personal Data We Collect
        </Typography>

        <Typography variant="body1" paragraph>
          We collect only the minimum data necessary to operate the Platform:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li><strong>Email address</strong> – collected when you create an account to access the scoping service.</li>
        </Typography>

        <Typography variant="body1" paragraph>
          We do not collect names, phone numbers, addresses, payment information, or any special categories of personal data.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          3. Purpose of Processing
        </Typography>

        <Typography variant="body1" paragraph>
          We process your email address for the following purposes:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>To create and manage your account</li>
          <li>To provide access to the scoping service</li>
          <li>To communicate essential service-related information (e.g., account confirmation, service updates, security notices)</li>
        </Typography>

        <Typography variant="body1" paragraph>
          We do not use your email address for marketing unless you explicitly opt in.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gavel color="primary" />
          4. Legal Basis
        </Typography>

        <Typography variant="body1" paragraph>
          Under Article 6 of the GDPR, our processing is based on:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li><strong>Contractual necessity (Art. 6(1)(b))</strong> – to provide you with access to the Platform</li>
          <li><strong>Legitimate interests (Art. 6(1)(f))</strong> – to ensure the security and proper operation of the service</li>
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          5. Cookies and Tracking
        </Typography>

        <Typography variant="body1" paragraph>
          The Platform does <strong>not</strong> use cookies or similar tracking technologies.
        </Typography>

        <Typography variant="body1" paragraph>
          We do not perform behavioral tracking, profiling, or analytics that identify individual users.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          6. Data Sharing
        </Typography>

        <Typography variant="body1" paragraph>
          We do not sell or rent your personal data. We may share your email address only with:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>Trusted service providers who host or operate the Platform on our behalf (e.g., infrastructure or email delivery providers), under strict data processing agreements</li>
        </Typography>

        <Typography variant="body1" paragraph>
          All processors are bound by confidentiality and GDPR-compliant obligations.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime color="primary" />
          7. Data Retention
        </Typography>

        <Typography variant="body1" paragraph>
          We retain your email address only for as long as your account remains active.
        </Typography>

        <Typography variant="body1" paragraph>
          You may delete your account at any time. Upon deletion:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>Your email address is removed from active systems</li>
          <li>Residual backups are erased within a reasonable technical timeframe</li>
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gavel color="primary" />
          8. Your Rights
        </Typography>

        <Typography variant="body1" paragraph>
          Under the GDPR, you have the right to:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>Access your personal data</li>
          <li>Rectify inaccurate data</li>
          <li>Erase your data ("right to be forgotten")</li>
          <li>Restrict or object to processing</li>
          <li>Receive a copy of your data (data portability)</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </Typography>

        <Typography variant="body1" paragraph>
          To exercise these rights, contact us at: 
          <Link href="mailto:[Privacy Email Address]">
          {" "}
            <Box
              component="span"
              sx={{
                backgroundColor: "warning.light",
                px: 0.5,
                borderRadius: 0.5,
                fontWeight: 500,
              }}
            >
              [Email Address for Privacy Inquiries]
            </Box> 
          </Link>
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          9. Data Security
        </Typography>

        <Typography variant="body1" paragraph>
          We implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, or alteration, including:
        </Typography>

        <Typography variant="body1" component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>Encrypted data transmission</li>
          <li>Access controls</li>
          <li>Secure hosting environments</li>
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gavel color="primary" />
          10. International Transfers
        </Typography>

        <Typography variant="body1" paragraph>
          If your data is processed outside the European Economic Area, we ensure appropriate safeguards, such as Standard Contractual Clauses, are in place.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrivacyTip color="primary" />
          11. Changes to This Policy
        </Typography>

        <Typography variant="body1" paragraph>
          We may update this Privacy Policy from time to time. Any changes will be published on this page with an updated "Last updated" date.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          <Typography variant="body2">
            For any questions regarding this Privacy Policy, please contact us at: 
            <Link href="mailto:[Privacy Email Address]">
            {" "}
              <Box
                component="span"
                sx={{
                  backgroundColor: "warning.light",
                  px: 0.5,
                  borderRadius: 0.5,
                  fontWeight: 500,
                }}
              >
                [Email Address for Privacy Inquiries]
              </Box> 
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PrivacyPolicy;