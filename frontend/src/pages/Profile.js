import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  MonitorWeight,
  Height,
  FitnessCenter
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile: {
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      fitnessLevel: '',
      goals: []
    }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          age: user.profile?.age || '',
          gender: user.profile?.gender || '',
          height: user.profile?.height || '',
          weight: user.profile?.weight || '',
          fitnessLevel: user.profile?.fitnessLevel || '',
          goals: user.profile?.goals || []
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        [name]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // Clean up profile data
      const profileData = {
        profile: {
          ...formData.profile,
          age: formData.profile.age ? parseInt(formData.profile.age) : undefined,
          height: formData.profile.height ? parseInt(formData.profile.height) : undefined,
          weight: formData.profile.weight ? parseFloat(formData.profile.weight) : undefined
        }
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        setMessage('Perfil actualizado exitosamente');
        setEditing(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error al actualizar el perfil');
    }
  };

  const calculateBMI = () => {
    if (formData.profile.height && formData.profile.weight) {
      const height = parseFloat(formData.profile.height) / 100; // Convert to meters
      const weight = parseFloat(formData.profile.weight);
      const bmi = weight / (height * height);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'info' };
    if (bmi < 25) return { category: 'Normal', color: 'success' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'warning' };
    return { category: 'Obesidad', color: 'error' };
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, { sx: { color: color, mr: 2 } })}
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value || 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 4, 
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{ 
                width: 100, 
                height: 100, 
                mr: 4,
                border: '4px solid rgba(255,255,255,0.3)',
                fontSize: '2rem',
                fontWeight: 700
              }}
              src={user?.profile?.avatar}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                {user?.username}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {user?.email}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
                Miembro desde {new Date(user?.createdAt || Date.now()).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long'
                })}
              </Typography>
            </Box>
          </Box>
          </Paper>
        </Grid>

        {/* Messages */}
        {message && (
          <Grid item xs={12}>
            <Alert severity="success">{message}</Alert>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Peso"
            value={formData.profile.weight ? `${formData.profile.weight} kg` : null}
            icon={<MonitorWeight />}
            color="primary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Altura"
            value={formData.profile.height ? `${formData.profile.height} cm` : null}
            icon={<Height />}
            color="secondary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="IMC"
            value={calculateBMI()}
            icon={<FitnessCenter />}
            color="success.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Edad"
            value={formData.profile.age ? `${formData.profile.age} años` : null}
            icon={<Person />}
            color="info.main"
          />
        </Grid>

        {/* BMI Info */}
        {calculateBMI() && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Información del IMC
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">
                  Tu IMC es <strong>{calculateBMI()}</strong>
                </Typography>
                <Typography 
                  variant="body1" 
                  color={`${getBMICategory(calculateBMI()).color}.main`}
                >
                  ({getBMICategory(calculateBMI()).category})
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Profile Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Información Personal
              </Typography>
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                >
                  Editar
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                  >
                    Guardar
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="firstName"
                    value={formData.profile.firstName}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    name="lastName"
                    value={formData.profile.lastName}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Edad"
                    name="age"
                    type="number"
                    value={formData.profile.age}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Género</InputLabel>
                    <Select
                      name="gender"
                      value={formData.profile.gender}
                      onChange={handleChange}
                      disabled={!editing}
                    >
                      <MenuItem value="male">Masculino</MenuItem>
                      <MenuItem value="female">Femenino</MenuItem>
                      <MenuItem value="other">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Altura (cm)"
                    name="height"
                    type="number"
                    value={formData.profile.height}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Peso (kg)"
                    name="weight"
                    type="number"
                    value={formData.profile.weight}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Nivel de Fitness</InputLabel>
                    <Select
                      name="fitnessLevel"
                      value={formData.profile.fitnessLevel}
                      onChange={handleChange}
                      disabled={!editing}
                    >
                      <MenuItem value="beginner">Principiante</MenuItem>
                      <MenuItem value="intermediate">Intermedio</MenuItem>
                      <MenuItem value="advanced">Avanzado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
