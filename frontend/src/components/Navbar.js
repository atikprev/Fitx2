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
  Badge,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  FitnessCenter,
  Chat,
  Person,
  Logout,
  Settings,
  NotificationsNone,
  Home,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
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

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Dashboard />, key: 'dashboard' },
    { path: '/routines', label: 'Rutinas', icon: <FitnessCenter />, key: 'routines' },
    { path: '/chat', label: 'Chat', icon: <Chat />, key: 'chat', badge: connected ? onlineUsers.length : 0 },
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        mb: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ minHeight: 70 }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ 
            mr: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.1),
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <FitnessCenter sx={{ mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FitManager360
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Tooltip key={item.key} title={item.label} arrow>
              <Button
                color="inherit"
                startIcon={item.icon}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  backgroundColor: isActive(item.path) 
                    ? alpha(theme.palette.common.white, 0.2)
                    : 'transparent',
                  border: isActive(item.path) 
                    ? `2px solid ${alpha(theme.palette.common.white, 0.3)}`
                    : '2px solid transparent',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                    transform: 'translateY(-2px)',
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                {item.badge !== undefined ? (
                  <Badge
                    badgeContent={item.badge}
                    color="error"
                    max={99}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#ff4444',
                        color: 'white',
                        fontWeight: 600,
                      }
                    }}
                  >
                    {item.label}
                  </Badge>
                ) : (
                  item.label
                )}
              </Button>
            </Tooltip>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notificaciones" arrow>
            <IconButton 
              color="inherit" 
              sx={{ 
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                }
              }}
            >
              <Badge badgeContent={0} color="error">
                <NotificationsNone />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Perfil de usuario" arrow>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
              sx={{
                ml: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                }
              }}
            >
              <Avatar
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    border: '2px solid rgba(255,255,255,0.6)',
                    transform: 'scale(1.05)',
                  }
                }}
                src={user?.profile?.avatar}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            
            <MenuItem onClick={() => handleNavigate('/profile')}>
              <Person sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Mi Perfil
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gestionar información personal
                </Typography>
              </Box>
            </MenuItem>
            
            <MenuItem onClick={() => handleNavigate('/settings')}>
              <Settings sx={{ mr: 2, color: 'warning.main' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Configuración
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Preferencias de la aplicación
                </Typography>
              </Box>
            </MenuItem>
            
            <Divider sx={{ my: 1 }} />
            
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                }
              }}
            >
              <Logout sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Cerrar Sesión
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Salir de la aplicación
                </Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;