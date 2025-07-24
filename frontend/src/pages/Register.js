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
} from '@mui/material';
import { PersonAdd, FitnessCenter } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
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
    <Container
      component='main'
      maxWidth='md'
    >
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{ padding: 4, width: '100%' }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <FitnessCenter
              sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}
            />
            <Typography
              component='h1'
              variant='h4'
              gutterBottom
            >
              FitManager360
            </Typography>
            <Typography
              component='h2'
              variant='h6'
              color='text.secondary'
              gutterBottom
            >
              Crear Cuenta
            </Typography>
          </Box>

          {error && (
            <Alert
              severity='error'
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}
          {bodyMetricsError && (
            <Alert
              severity='warning'
              sx={{ mb: 2 }}
            >
              {bodyMetricsError}
            </Alert>
          )}

          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <Grid
              container
              spacing={2}
            >
              {/* Account Information */}
              <Grid
                item
                xs={12}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                >
                  Información de Cuenta
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
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
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
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
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  required
                  fullWidth
                  name='password'
                  label='Contraseña'
                  type='password'
                  id='password'
                  autoComplete='new-password'
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  required
                  fullWidth
                  name='confirmPassword'
                  label='Confirmar Contraseña'
                  type='password'
                  id='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              {/* Profile Information */}
              <Grid
                item
                xs={12}
                sx={{ mt: 2 }}
              >
                <Typography
                  variant='h6'
                  gutterBottom
                >
                  Información Personal (Opcional)
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  fullWidth
                  id='firstName'
                  label='Nombre'
                  name='profile.firstName'
                  value={formData.profile.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  fullWidth
                  id='lastName'
                  label='Apellido'
                  name='profile.lastName'
                  value={formData.profile.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  fullWidth
                  id='age'
                  label='Edad'
                  name='profile.age'
                  type='number'
                  value={formData.profile.age}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <FormControl fullWidth>
                  <InputLabel>Género</InputLabel>
                  <Select
                    name='profile.gender'
                    value={formData.profile.gender}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value='male'>Masculino</MenuItem>
                    <MenuItem value='female'>Femenino</MenuItem>
                    <MenuItem value='other'>Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  fullWidth
                  id='height'
                  label='Altura (cm)'
                  name='profile.height'
                  type='number'
                  value={formData.profile.height}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  fullWidth
                  id='weight'
                  label='Peso (kg)'
                  name='profile.weight'
                  type='number'
                  value={formData.profile.weight}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid
                item
                xs={12}
              >
                <FormControl fullWidth>
                  <InputLabel>Nivel de Fitness</InputLabel>
                  <Select
                    name='profile.fitnessLevel'
                    value={formData.profile.fitnessLevel}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value='beginner'>Principiante</MenuItem>
                    <MenuItem value='intermediate'>Intermedio</MenuItem>
                    <MenuItem value='advanced'>Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <PersonAdd />
              }
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>

            <Grid
              container
              justifyContent='flex-end'
            >
              <Grid item>
                <Link
                  to='/login'
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant='body2'
                    color='primary'
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            © 2025 FitManager360. Todos los derechos reservados.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
