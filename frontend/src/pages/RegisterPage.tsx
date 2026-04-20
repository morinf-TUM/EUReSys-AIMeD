import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Grid, Link, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Lock, Email, Person, Business, Home, Flag, CheckCircle } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import apiService from '../services/api';
import { UserSession } from '../types/regulatory';

interface RegisterPageProps {
  onLogin: (user: UserSession, redirectTo?: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    country: '',
    role: 'developer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
    // Clear password error when user types
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    if (!formData.company.trim()) {
      setError('Company name is required');
      return false;
    }

    if (!formData.country) {
      setError('Country is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.company
      );

      if (response.success && response.data) {
        enqueueSnackbar('Registration successful! Please login.', { variant: 'success' });
        navigate('/login');
      } else {
        setError(response.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
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
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <CheckCircle color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Join the EU AI Medical Compliance platform
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Person color="action" sx={{ mr: 1 }} />,
                }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
                }}
                disabled={loading}
                error={!!passwordError}
                helperText={passwordError || 'Minimum 8 characters'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
                }}
                disabled={loading}
                error={!!passwordError}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                name="company"
                value={formData.company}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Business color="action" sx={{ mr: 1 }} />,
                }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <Flag color="action" sx={{ mr: 1 }} />,
                }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required disabled={loading}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleSelectChange}
                  label="Role"
                  startAdornment={<Person color="action" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="developer">Developer</MenuItem>
                  <MenuItem value="compliance-officer">Compliance Officer</MenuItem>
                  <MenuItem value="regulatory-affairs">Regulatory Affairs</MenuItem>
                  <MenuItem value="quality-assurance">Quality Assurance</MenuItem>
                  <MenuItem value="executive">Executive</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                <FormHelperText>Your primary role in the organization</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </Button>

          <Grid container sx={{ mb: 3 }}>
            <Grid item xs>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              By creating an account, you agree to our
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="#" color="primary">Terms of Service</Link> and <Link href="#" color="primary">Privacy Policy</Link>
            </Typography>
          </Box>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            EU AI Medical Compliance System
          </Typography>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} EU AI Medical Compliance
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;