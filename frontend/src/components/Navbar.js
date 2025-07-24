import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  FitnessCenter,
  Chat,
  Person,
  Logout,
  Settings,
  NotificationsNone
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { connected, onlineUsers } = useSocket();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Don't show navbar if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FitManager360
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => handleNavigate('/')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Dashboard
          </Button>
          
          <Button
            color="inherit"
            startIcon={<FitnessCenter />}
            onClick={() => handleNavigate('/routines')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Rutinas
          </Button>
          
          <Button
            color="inherit"
            startIcon={<Chat />}
            onClick={() => handleNavigate('/chat')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <Badge
              badgeContent={connected ? onlineUsers.length : 0}
              color="secondary"
              max={99}
            >
              Chat
            </Badge>
          </Button>

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={0} color="secondary">
              <NotificationsNone />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={user?.profile?.avatar}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.username}
              </Typography>
            </MenuItem>
            <Divider />
            
            <MenuItem onClick={() => handleNavigate('/profile')}>
              <Person sx={{ mr: 2 }} />
              Perfil
            </MenuItem>
            
            <MenuItem onClick={() => handleNavigate('/settings')}>
              <Settings sx={{ mr: 2 }} />
              Configuración
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
