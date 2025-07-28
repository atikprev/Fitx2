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
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchProgressData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/exercises/stats');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      const response = await axios.get(
        '/api/stats/progress/weight?period=weekly&limit=12'
      );
      // Formatear los datos para el gráfico
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
      setProgressData([]);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card
      elevation={2}
      sx={{ height: '100%' }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton sx={{ color: color, mr: 2 }}>{icon}</IconButton>
          <Typography
            variant='h6'
            component='div'
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant='h4'
          component='div'
          sx={{ mb: 1 }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const GoalCard = ({ goal }) => (
    <Card
      elevation={1}
      sx={{ mb: 2 }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant='h6'>{goal.title}</Typography>
          <Chip
            label={goal.type}
            color='primary'
            size='small'
          />
        </Box>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 2 }}
        >
          {goal.description}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant='body2'>
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {goal.progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant='determinate'
          value={goal.progress}
          sx={{ mb: 1 }}
        />
        <Typography
          variant='body2'
          color='text.secondary'
        >
          Fecha límite: {new Date(goal.targetDate).toLocaleDateString('es-ES')}
        </Typography>
      </CardContent>
    </Card>
  );

  const AchievementCard = ({ achievement }) => (
    <Card
      elevation={1}
      sx={{ mb: 2 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmojiEvents sx={{ color: 'gold', mr: 2 }} />
          <Typography variant='h6'>{achievement.title}</Typography>
        </Box>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 1 }}
        >
          {achievement.description}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Chip
            label={`${achievement.points} pts`}
            color='secondary'
            size='small'
          />
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {new Date(achievement.unlockedAt).toLocaleDateString('es-ES')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container
        maxWidth='lg'
        sx={{ mt: 4, mb: 4 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <Typography>Cargando dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth='lg'
      sx={{ mt: 4, mb: 4 }}
    >
      <Grid
        container
        spacing={3}
      >
        {/* Header */}
        <Grid
          item
          xs={12}
        >
          <Typography
            variant='h4'
            gutterBottom
          >
            ¡Bienvenido, {user?.profile?.firstName || user?.username}!
          </Typography>
          <Typography
            variant='subtitle1'
            color='text.secondary'
          >
            Email: {user?.email}
          </Typography>
        </Grid>

        {/* Estadísticas principales */}
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <StatCard
            title='Total de Ejercicios'
            value={dashboardData.totalExercises}
            icon={<FitnessCenter />}
            color='primary.main'
            subtitle='Ejercicios registrados'
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <StatCard
            title='Grupos Musculares'
            value={dashboardData.stats.byMuscleGroup.length}
            icon={<Timeline />}
            color='green'
            subtitle='Tipos de grupo muscular'
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <StatCard
            title='Dificultades'
            value={dashboardData.stats.byDifficulty.length}
            icon={<TrendingUp />}
            color='orange'
            subtitle='Niveles de dificultad'
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <StatCard
            title='Equipos'
            value={dashboardData.stats.byEquipment.length}
            icon={<MonitorWeight />}
            color='blue'
            subtitle='Tipos de equipo'
          />
        </Grid>

        {/* Gráficos de distribución */}
        <Grid
          item
          xs={12}
          md={6}
        >
          <Paper sx={{ p: 2 }}>
            <Typography
              variant='h6'
              gutterBottom
            >
              Ejercicios por Grupo Muscular
            </Typography>
            <ResponsiveContainer
              width='100%'
              height={250}
            >
              <BarChart data={dashboardData.stats.byMuscleGroup}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='_id' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey='count'
                  fill='#8884d8'
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
        >
          <Paper sx={{ p: 2 }}>
            <Typography
              variant='h6'
              gutterBottom
            >
              Ejercicios por Dificultad
            </Typography>
            <ResponsiveContainer
              width='100%'
              height={250}
            >
              <BarChart data={dashboardData.stats.byDifficulty}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='_id' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey='count'
                  fill='#82ca9d'
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
        >
          <Paper sx={{ p: 2 }}>
            <Typography
              variant='h6'
              gutterBottom
            >
              Ejercicios por Equipo
            </Typography>
            <ResponsiveContainer
              width='100%'
              height={250}
            >
              <BarChart data={dashboardData.stats.byEquipment}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='_id' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey='count'
                  fill='#ffc658'
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Ejercicios recientes */}
        <Grid
          item
          xs={12}
          md={6}
        >
          <Paper sx={{ p: 2 }}>
            <Typography
              variant='h6'
              gutterBottom
            >
              Ejercicios Recientes
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {dashboardData.recentExercises.length > 0 ? (
                dashboardData.recentExercises.map((ex) => (
                  <Card
                    key={ex.id}
                    elevation={1}
                    sx={{ mb: 2 }}
                  >
                    <CardContent>
                      <Typography variant='h6'>{ex.name}</Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Dificultad: {ex.difficulty}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Grupos Musculares: {ex.muscleGroups.join(', ')}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Creado:{' '}
                        {new Date(ex.createdAt).toLocaleDateString('es-ES')}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  No hay ejercicios recientes.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
