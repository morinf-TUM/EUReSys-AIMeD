import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { UserSession } from '../../types/regulatory';

interface HeaderProps {
  isAuthenticated: boolean;
  user: UserSession | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
    navigate('/');
  };

  const renderAuthButtons = () => {
    if (isAuthenticated && user) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user.permissions?.includes('admin') && (
            <Button color="inherit" component={Link} to="/admin">
              Admin
            </Button>
          )}
          <IconButton 
            size="small" 
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
            aria-controls="profile-menu"
            aria-haspopup="true"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
              {user.username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem onClick={handleProfileMenuClose} component={Link} to="/profiles">
              <Avatar /> Latest evaluation summary
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button 
            variant="outlined"
            color="inherit"
            component={Link} 
            to="/register"
            sx={{ borderColor: 'white', '&:hover': { borderColor: 'white' } }}
          >
            Register
          </Button>
        </Box>
      );
    }
  };

  const renderMobileMenu = () => (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: { width: 250 },
      }}
    >
      <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
        Home
      </MenuItem>
      <MenuItem component={Link} to="/scoping" onClick={handleMobileMenuClose}>
        Regulatory Scoping
      </MenuItem>
      <MenuItem component={Link} to="/sources" onClick={handleMobileMenuClose}>
        Regulatory Sources
      </MenuItem>
      <MenuItem component={Link} to="/help" onClick={handleMobileMenuClose}>
        Help Center
      </MenuItem>
      {isAuthenticated ? (
        <>
          <MenuItem component={Link} to="/profiles" onClick={handleMobileMenuClose}>
            My Profiles
          </MenuItem>
          <MenuItem component={Link} to="/documentation" onClick={handleMobileMenuClose}>
            Documentation
          </MenuItem>
          <MenuItem onClick={() => { handleMobileMenuClose(); handleLogout(); }}>
            Logout
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem component={Link} to="/login" onClick={handleMobileMenuClose}>
            Login
          </MenuItem>
          <MenuItem component={Link} to="/register" onClick={handleMobileMenuClose}>
            Register
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.dark' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMobileMenuOpen}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          EUReSys-AIMeD Support Platform v0.1
        </Typography>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/sources">
            Regulatory Sources
          </Button>
          <Button color="inherit" component={Link} to="/help">
            Help
          </Button>
        </Box>
        
        {renderAuthButtons()}
        {renderMobileMenu()}
      </Toolbar>
    </AppBar>
  );
};

export default Header;