import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  FitnessCenter,
  Timeline,
  TrendingUp,
  EmojiEvents,
  CalendarToday,
  Timer,
  LocalFireDepartment,
  MonitorWeight,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalExercises: 0,
    stats: {
      byMuscleGroup: [],
      byDifficulty: [],
      byEquipment: [],
    },
    recentExercises: [],
  });
  const [userRoutines, setUserRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressData, setProgressData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchUserRoutines();
      fetchProgressData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const response = await axios.get('/api/exercises/stats');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error al cargar las estadísticas de ejercicios');
    }
  };

  const fetchUserRoutines = async () => {
    try {
      const response = await axios.get('/api/routines', {
        params: { limit: 5 } // Solo las 5 más recientes para el dashboard
      });
      setUserRoutines(response.data.routines || []);
    } catch (error) {
      console.error('Error fetching user routines:', error);
      setError('Error al cargar las rutinas del usuario');
    }
  };

  const fetchProgressData = async () => {
    try {
      const response = await axios.get(
        '/api/stats/progress/weight?period=weekly&limit=12'
      );
      const formattedData =
        response.data.data?.map((item) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
          }),
        })) || [];
      setProgressData(formattedData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      // No mostrar error para datos de progreso ya que es opcional
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(),
      fetchUserRoutines(),
      fetchProgressData()
    ]);
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, subtitle, loading = false }) => (
    <Card
      elevation={3}
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            sx={{ 
              color: color, 
              mr: 2,
              backgroundColor: 'rgba(255,255,255,0.8)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
            }}
          >
            {icon}
          </IconButton>
          <Typography
            variant='h6'
            component='div'
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography
            variant='h3'
            component='div'
            sx={{ mb: 1, fontWeight: 700, color: color }}
          >
            {value}
          </Typography>
        )}
        {subtitle && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontWeight: 500 }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const RoutineCard = ({ routine }) => (
    <Card
      elevation={2}
      sx={{ 
        mb: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateX(8px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            {routine.name}
          </Typography>
          <Chip
            label={routine.difficulty}
            color={getDifficultyColor(routine.difficulty)}
            size='small'
          />
        </Box>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 1 }}
        >
          {routine.description || 'Sin descripción'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Timer sx={{ mr: 0.5, fontSize: 16, color: 'primary.main' }} />
            <Typography variant='body2' color='text.secondary'>
              {routine.estimatedDuration} min
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FitnessCenter sx={{ mr: 0.5, fontSize: 16, color: 'secondary.main' }} />
            <Typography variant='body2' color='text.secondary'>
              {routine.exercises?.length || 0} ejercicios
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'error',
    };
    return colors[difficulty] || 'default';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="text" width="40%" height={60} />
            <Skeleton variant="text" width="60%" height={30} />
          </Grid>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant='h3'
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ¡Bienvenido, {user?.profile?.firstName || user?.username}!
              </Typography>
              <Typography
                variant='h6'
                color='text.secondary'
                sx={{ fontWeight: 500 }}
              >
                {user?.email}
              </Typography>
            </Box>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              <Refresh />
            </IconButton>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>

        {/* Estadísticas principales */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Total de Ejercicios'
            value={dashboardData.totalExercises}
            icon={<FitnessCenter />}
            color='primary.main'
            subtitle='Ejercicios disponibles'
            loading={refreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Mis Rutinas'
            value={userRoutines.length}
            icon={<Timeline />}
            color='success.main'
            subtitle='Rutinas creadas'
            loading={refreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Grupos Musculares'
            value={dashboardData.stats.byMuscleGroup.length}
            icon={<TrendingUp />}
            color='warning.main'
            subtitle='Tipos disponibles'
            loading={refreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Equipos'
            value={dashboardData.stats.byEquipment.length}
            icon={<MonitorWeight />}
            color='info.main'
            subtitle='Tipos de equipo'
            loading={refreshing}
          />
        </Grid>

        {/* Mis Rutinas */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Typography
              variant='h5'
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Mis Rutinas Recientes
            </Typography>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {userRoutines.length > 0 ? (
                userRoutines.map((routine) => (
                  <Box key={routine._id} sx={{ mb: 2 }}>
                    <Card sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                      <CardContent>
                        <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 600 }}>
                          {routine.name}
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
                          {routine.description || 'Sin descripción'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={routine.category}
                            size='small'
                            color='primary'
                          />
                          <Chip
                            label={routine.difficulty}
                            size='small'
                            color={getDifficultyColor(routine.difficulty)}
                          />
                          <Chip
                            label={`${routine.estimatedDuration} min`}
                            size='small'
                            variant='outlined'
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))
              ) : (
                <Card sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <FitnessCenter sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant='h6' sx={{ color: 'text.primary', mb: 1 }}>
                      No tienes rutinas creadas
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      Ve a la sección de Rutinas para crear tu primera rutina
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de distribución por grupo muscular */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Ejercicios por Grupo Muscular
            </Typography>
            {dashboardData.stats.byMuscleGroup.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.stats.byMuscleGroup}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='count'
                  >
                    {dashboardData.stats.byMuscleGroup.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='body1' color='text.secondary'>
                  No hay datos de ejercicios disponibles
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Gráficos de distribución */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Ejercicios por Dificultad
            </Typography>
            <ResponsiveContainer width='100%' height={250}>
              <BarChart data={dashboardData.stats.byDifficulty}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='_id' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey='count' fill='#82ca9d' />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant='h6'
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Ejercicios por Equipo
            </Typography>
            <ResponsiveContainer width='100%' height={250}>
              <BarChart data={dashboardData.stats.byEquipment}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='_id' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey='count' fill='#ffc658' />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Ejercicios recientes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Ejercicios Recientes
            </Typography>
            <Grid container spacing={2}>
              {dashboardData.recentExercises.length > 0 ? (
                dashboardData.recentExercises.map((ex) => (
                  <Grid item xs={12} sm={6} md={4} key={ex._id}>
                    <Card 
                      elevation={2}
                      sx={{
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                          {ex.name}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={ex.difficulty}
                            color={getDifficultyColor(ex.difficulty)}
                            size='small'
                            sx={{ mr: 1 }}
                          />
                        </Box>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ mb: 1 }}
                        >
                          <strong>Grupos:</strong> {ex.muscleGroups.join(', ')}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          <strong>Creado:</strong>{' '}
                          {new Date(ex.createdAt).toLocaleDateString('es-ES')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <FitnessCenter sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant='h6' color='text.secondary'>
                      No hay ejercicios recientes disponibles
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;