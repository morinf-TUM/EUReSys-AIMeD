import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Grid, Card, CardContent, CardActions, Divider, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, AlertTitle } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { AdminPanelSettings, People, Assessment, Description, Settings, Security, History, BarChart, PieChart, Timeline } from '@mui/icons-material';
import apiService from '../services/api';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProfiles: 0,
    pendingAssessments: 0,
    totalDocuments: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, we would fetch actual admin data
        // For now, we'll use mock data
        const mockStats = {
          totalUsers: 42,
          activeProfiles: 18,
          pendingAssessments: 3,
          totalDocuments: 75
        };
        
        const mockRecentActivity = [
          {
            id: '1',
            user: 'john.doe@medtech.com',
            action: 'Created new regulatory profile',
            profile: 'AI Diabetic Retinopathy System',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            id: '2',
            user: 'jane.smith@healthai.com',
            action: 'Submitted change impact assessment',
            profile: 'Cardiac Monitoring AI',
            timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
          },
          {
            id: '3',
            user: 'mike.wilson@biotech.com',
            action: 'Updated documentation section',
            profile: 'Neurological Analysis Tool',
            timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
          }
        ];
        
        setStats(mockStats);
        setRecentActivity(mockRecentActivity);
      } catch (err) {
        setError('Failed to load admin data. Please try again.');
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage user accounts, permissions, and access levels',
      icon: <People color="primary" sx={{ fontSize: 40 }} />,
      buttonText: 'Manage Users',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters and regulatory rules',
      icon: <Settings color="secondary" sx={{ fontSize: 40 }} />,
      buttonText: 'System Settings',
      onClick: () => navigate('/admin/settings')
    },
    {
      title: 'Audit Logs',
      description: 'View comprehensive system activity and audit trails',
      icon: <History color="success" sx={{ fontSize: 40 }} />,
      buttonText: 'View Audit Logs',
      onClick: () => navigate('/admin/audit')
    },
    {
      title: 'Regulatory Updates',
      description: 'Manage regulatory content and updates',
      icon: <Assessment color="info" sx={{ fontSize: 40 }} />,
      buttonText: 'Manage Regulations',
      onClick: () => navigate('/admin/regulations')
    }
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
        Administrative interface for managing the EU AI Medical Device Regulatory System.
        Monitor system activity, manage users, and configure regulatory parameters.
      </Typography>

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <AlertTitle>Admin Access</AlertTitle>
        This dashboard provides comprehensive administrative control over the regulatory compliance system.
        All actions are logged for audit purposes.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              System Overview
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="secondary" sx={{ fontWeight: 600 }}>
                    {stats.activeProfiles}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Profiles
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                    {stats.pendingAssessments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Assessments
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                    {stats.totalDocuments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Documents
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" icon={<InfoIcon />}>
              <AlertTitle>System Status</AlertTitle>
              All systems are operational. Last updated: {new Date().toLocaleString()}
            </Alert>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Admin Tools" icon={<AdminPanelSettings />} iconPosition="start" />
              <Tab label="Recent Activity" icon={<Timeline />} iconPosition="start" />
              <Tab label="Reports" icon={<BarChart />} iconPosition="start" />
            </Tabs>
          </Paper>

          {activeTab === 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Administrative Tools
              </Typography>

              <Grid container spacing={3}>
                {adminCards.map((card, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          {card.icon}
                        </Box>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {card.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {card.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center' }}>
                        <Button 
                          size="small"
                          variant="contained"
                          onClick={card.onClick}
                          startIcon={card.buttonText.includes('Manage') ? <Settings /> : <AdminPanelSettings />}
                        >
                          {card.buttonText}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent System Activity
              </Typography>

              {recentActivity.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentActivity.map(activity => (
                        <TableRow key={activity.id} hover>
                          <TableCell>
                            {new Date(activity.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{activity.user}</TableCell>
                          <TableCell>{activity.action}</TableCell>
                          <TableCell>{activity.profile}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No recent activity found.
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" startIcon={<History />}>
                  View Full Activity Log
                </Button>
              </Box>
            </Paper>
          )}

          {activeTab === 2 && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                System Reports
              </Typography>

              <Alert severity="info" icon={<InfoIcon />}>
                <AlertTitle>Reporting Features</AlertTitle>
                Generate comprehensive reports on system usage, compliance trends, and regulatory classifications.
                Export data for analysis and audit purposes.
              </Alert>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BarChart color="primary" sx={{ mr: 1, fontSize: 32 }} />
                        <Typography variant="h6" component="h3">
                          Usage Reports
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Generate reports on system usage, user activity, and feature adoption
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<BarChart />} disabled>
                        Generate Usage Report
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PieChart color="secondary" sx={{ mr: 1, fontSize: 32 }} />
                        <Typography variant="h6" component="h3">
                          Compliance Reports
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Analyze compliance trends, classifications, and regulatory patterns
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<PieChart />} disabled>
                        Generate Compliance Report
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="outlined" startIcon={<Description />} disabled>
                  Export All Reports
                </Button>
              </Box>
            </Paper>
          )}

          <Alert severity="info" icon={<Security />}>
            <AlertTitle>Security Reminder</AlertTitle>
            Administrative actions have significant impact on system security and compliance.
            Always follow security best practices and maintain comprehensive audit trails.
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;