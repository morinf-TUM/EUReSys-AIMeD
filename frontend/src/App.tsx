import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { SnackbarProvider } from 'notistack';

// Import components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import RegulatoryDisclaimer from './components/common/RegulatoryDisclaimer';
import HomePage from './pages/HomePage';
import RegulatoryScoping from './pages/RegulatoryScoping';
import DecisionTree from './pages/DecisionTree';
import DocumentationCenter from './pages/DocumentationCenter';
import ProfileDashboard from './pages/ProfileDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import RegulatorySources from './pages/RegulatorySources';
import HelpCenter from './pages/HelpCenter';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import TemplatesPage from './pages/TemplatesPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SelfChecklist from './pages/SelfChecklist';

// Import API service
import apiService from './services/api';

import { UserSession } from './types/regulatory';

// Component to handle post-login redirect
const PostLoginRedirect = () => {
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  useEffect(() => {
    if (hasRedirected) return;
    
    console.log('PostLoginRedirect: Component rendered');
    const redirectPath = localStorage.getItem('postLoginRedirect');
    console.log('PostLoginRedirect: redirectPath from localStorage:', redirectPath);
    
    if (redirectPath) {
      console.log('PostLoginRedirect: Navigating to:', redirectPath);
      setHasRedirected(true);
      navigate(redirectPath);
      // Clear localStorage after navigation to prevent issues if component re-renders
      setTimeout(() => {
        localStorage.removeItem('postLoginRedirect');
      }, 100);
    } else {
      console.log('PostLoginRedirect: No redirect path found, going to homepage');
      setHasRedirected(true);
      navigate('/');
    }
  }, [navigate, hasRedirected]);
  
  return null;
};

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    success: {
      main: '#2e7d32',
    },
    info: {
      main: '#0288d1',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = apiService.isAuthenticated();
      const currentUser = apiService.getCurrentUser();
      
      setIsAuthenticated(authStatus);
      setUser(currentUser);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = (userData: UserSession, redirectTo?: string) => {
    console.log('handleLogin: Called with redirectTo:', redirectTo);
    setIsAuthenticated(true);
    setUser(userData);
    
    // Store the redirect path in localStorage temporarily
    if (redirectTo) {
      console.log('handleLogin: Storing redirect path in localStorage:', redirectTo);
      localStorage.setItem('postLoginRedirect', redirectTo);
    } else {
      console.log('handleLogin: No redirect path provided, removing from localStorage');
      localStorage.removeItem('postLoginRedirect');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={5000}>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
            
            <Box component="main" sx={{ flex: 1, py: 4 }}>
              <Container maxWidth="lg">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={isAuthenticated ? <PostLoginRedirect /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage onLogin={handleLogin} />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/sources" element={<RegulatorySources />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  
                  {/* Protected routes */}
                  <Route 
                    path="/scoping" 
                    element={isAuthenticated ? <RegulatoryScoping /> : <Navigate to="/login" state={{ from: "/scoping?step=1" }} />}
                  />
                  <Route 
                    path="/decision-tree" 
                    element={isAuthenticated ? <DecisionTree /> : <Navigate to="/login" state={{ from: "/decision-tree" }} />}
                  />
                  <Route 
                    path="/checklist" 
                    element={isAuthenticated ? <SelfChecklist /> : <Navigate to="/login" />}
                  />
                  <Route 
                    path="/contact" 
                    element={isAuthenticated ? <ContactPage /> : <Navigate to="/login" />}
                  />
                  <Route 
                    path="/documentation" 
                    element={isAuthenticated ? <DocumentationCenter /> : <Navigate to="/login" />}
                  />
                  <Route 
                    path="/templates" 
                    element={isAuthenticated ? <TemplatesPage /> : <Navigate to="/login" />}
                  />
                  <Route 
                    path="/profiles" 
                    element={isAuthenticated ? <ProfileDashboard /> : <Navigate to="/login" />}
                  />

                  
                  {/* Admin routes */}
                  <Route 
                    path="/admin" 
                    element={isAuthenticated && user?.permissions?.includes('admin') ? <AdminDashboard /> : <Navigate to="/" />}
                  />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Container>
            </Box>
            
            <RegulatoryDisclaimer />
            <Footer />
          </Box>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;