import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Grid, Link, Alert, CircularProgress } from '@mui/material';
import { Lock, Email, Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiService from '../services/api';
import { UserSession } from '../types/regulatory';

interface LoginPageProps {
  onLogin: (user: UserSession, redirectTo?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(email, password);

      if (response.success && response.data) {
        enqueueSnackbar('Login successful!', { variant: 'success' });
        onLogin(response.data, redirectTo);
        // Note: The actual navigation is now handled in the onLogin callback in App.tsx
      } else {
        setError(response.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        py: 4,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Lock color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Access the  scoping service of the EUReSys-AIMeD Platform
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: <Email color="action" sx={{ mr: 1 }} />,
            }}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
              endAdornment: (
                <Button
                  onClick={handleTogglePassword}
                  size="small"
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
              ),
            }}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading || !email || !password}
            startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <Grid container sx={{ mb: 3 }}>
            <Grid item xs>
              <Link component={RouterLink} to="/register" variant="body2">
                Don't have an account? Register
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              By signing in, you agree to our
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="#" color="primary">Terms of Service</Link> and <Link href="#" color="primary">Privacy Policy</Link>
            </Typography>
          </Box>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            EUReSys-AIMeD Support Platform
          </Typography>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} TUM, TEF-Health
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;