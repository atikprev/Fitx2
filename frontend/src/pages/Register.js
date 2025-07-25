import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Fade,
  Slide,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  PersonAdd, 
  FitnessCenter, 
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Height,
  MonitorWeight,
  Cake,
  Wc,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      fitnessLevel: '',
      goals: [],
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bodyMetricsError, setBodyMetricsError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Clean up profile data
      const profileData = {
        ...formData.profile,
        age: formData.profile.age ? parseInt(formData.profile.age) : undefined,
        height: formData.profile.height
          ? parseInt(formData.profile.height)
          : undefined,
        weight: formData.profile.weight
          ? parseFloat(formData.profile.weight)
          : undefined,
      };

      // 1. Registrar usuario
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        profile: profileData,
      });

      // 2. Si registro exitoso y hay datos de peso, crear body metrics
      if (result.success && profileData.weight) {
        try {
          const bodyMetrics = {
            weight: profileData.weight,
            bodyFat: profileData.bodyFat,
            muscleMass: profileData.muscleMass,
            measurements: profileData.measurements,
            notes: 'Registro inicial',
          };
          await axios.post('/api/stats/body-metrics', bodyMetrics, {
            headers: {
              Authorization: `Bearer ${result.token}`,
            },
          });
        } catch (err) {
          setBodyMetricsError(
            'El usuario fue creado, pero no se pudo registrar las métricas corporales.'
          );
          console.error('Error creando body metrics:', err);
        }
      }

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container component='main' maxWidth='md'>
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Header Card */}
            <Slide direction="down" in={true} timeout={600}>
              <Card
                elevation={8}
                sx={{
                  mb: 3,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      mb: 2,
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <FitnessCenter sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography
                    component='h1'
                    variant='h3'
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    FitManager360
                  </Typography>
                  <Typography
                    variant='h6'
                    color='text.secondary'
                    sx={{ fontWeight: 400 }}
                  >
                    Comienza tu transformación hoy
                  </Typography>
                </CardContent>
              </Card>
            </Slide>

            {/* Main Form Card */}
            <Slide direction="up" in={true} timeout={800}>
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  width: '100%',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Alerts */}
                {error && (
                  <Fade in={true}>
                    <Alert
                      severity='error'
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem',
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}
                {bodyMetricsError && (
                  <Fade in={true}>
                    <Alert
                      severity='warning'
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem',
                        },
                      }}
                    >
                      {bodyMetricsError}
                    </Alert>
                  </Fade>
                )}

                <Box component='form' onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Account Information Section */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                        <Typography
                          variant='h5'
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                          }}
                        >
                          Información de Cuenta
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #667eea, transparent)' }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id='username'
                        label='Nombre de Usuario'
                        name='username'
                        autoComplete='username'
                        value={formData.username}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id='email'
                        label='Correo Electrónico'
                        name='email'
                        autoComplete='email'
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        name='password'
                        label='Contraseña'
                        type={showPassword ? 'text' : 'password'}
                        id='password'
                        autoComplete='new-password'
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        name='confirmPassword'
                        label='Confirmar Contraseña'
                        type={showConfirmPassword ? 'text' : 'password'}
                        id='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* Profile Information Section */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FitnessCenter sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                        <Typography
                          variant='h5'
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                          }}
                        >
                          Información Personal
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ ml: 2, fontStyle: 'italic' }}
                        >
                          (Opcional)
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #667eea, transparent)' }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id='firstName'
                        label='Nombre'
                        name='profile.firstName'
                        value={formData.profile.firstName}
                        onChange={handleChange}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id='lastName'
                        label='Apellido'
                        name='profile.lastName'
                        value={formData.profile.lastName}
                        onChange={handleChange}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id='age'
                        label='Edad'
                        name='profile.age'
                        type='number'
                        value={formData.profile.age}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Cake color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      >
                        <InputLabel>Género</InputLabel>
                        <Select
                          name='profile.gender'
                          value={formData.profile.gender}
                          onChange={handleChange}
                          disabled={loading}
                          startAdornment={
                            <InputAdornment position="start">
                              <Wc color="action" />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value='male'>Masculino</MenuItem>
                          <MenuItem value='female'>Femenino</MenuItem>
                          <MenuItem value='other'>Otro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id='height'
                        label='Altura (cm)'
                        name='profile.height'
                        type='number'
                        value={formData.profile.height}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Height color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id='weight'
                        label='Peso (kg)'
                        name='profile.weight'
                        type='number'
                        value={formData.profile.weight}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MonitorWeight color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                            },
                          },
                        }}
                      >
                        <InputLabel>Nivel de Fitness</InputLabel>
                        <Select
                          name='profile.fitnessLevel'
                          value={formData.profile.fitnessLevel}
                          onChange={handleChange}
                          disabled={loading}
                          startAdornment={
                            <InputAdornment position="start">
                              <TrendingUp color="action" />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value='beginner'>Principiante</MenuItem>
                          <MenuItem value='intermediate'>Intermedio</MenuItem>
                          <MenuItem value='advanced'>Avanzado</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Submit Button */}
                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    size='large'
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />
                    }
                    sx={{
                      mt: 4,
                      mb: 3,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        transform: 'none',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>

                  {/* Login Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      to='/login'
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography
                        variant='body1'
                        sx={{
                          color: 'primary.main',
                          fontWeight: 500,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            textDecoration: 'underline',
                            transform: 'scale(1.02)',
                          },
                        }}
                      >
                        ¿Ya tienes cuenta? Inicia sesión
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              </Paper>
            </Slide>

            {/* Footer */}
            <Fade in={true} timeout={1200}>
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography
                  variant='body2'
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 400,
                  }}
                >
                  © 2025 FitManager360. Todos los derechos reservados.
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;