import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  FitnessCenter,
  AccessTime,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openExercisesDialog, setOpenExercisesDialog] = useState(false);
  const [exercisesToShow, setExercisesToShow] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRoutines();
      fetchExercises();
    }
  }, [user]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/routines');
      setRoutines(response.data.routines || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
      setError('Error al cargar las rutinas');
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoadingExercises(true);
      const res = await axios.get('/api/exercises');
      setAvailableExercises(res.data.exercises || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoadingExercises(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      strength: 'primary',
      cardio: 'secondary',
      flexibility: 'success',
      sports: 'warning',
      rehabilitation: 'info',
      weight_loss: 'error',
      muscle_gain: 'primary',
    };
    return colors[category] || 'default';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'error',
    };
    return colors[difficulty] || 'default';
  };

  const RoutineCard = ({ routine }) => (
    <Card
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography
            variant='h5'
            component='div'
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            {routine.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={routine.category}
              color={getCategoryColor(routine.category)}
              size='small'
            />
            <Chip
              label={routine.difficulty}
              color={getDifficultyColor(routine.difficulty)}
              size='small'
            />
          </Stack>
        </Box>
        
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          {routine.description || 'Sin descripción'}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
            <Typography variant='body2' color='text.secondary'>
              {routine.estimatedDuration} minutos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FitnessCenter sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
            <Typography variant='body2' color='text.secondary'>
              {routine.exercises?.length || 0} ejercicios
            </Typography>
          </Box>
        </Stack>
        
        {routine.isPublic && (
          <Chip
            label='Público'
            color='info'
            size='small'
            sx={{ mt: 2 }}
          />
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <IconButton
          size='small'
          onClick={() => {
            setExercisesToShow(routine.exercises || []);
            setOpenExercisesDialog(true);
          }}
          color='primary'
        >
          <Visibility />
        </IconButton>
      </CardActions>
    </Card>
  );
  
  const ExercisesDialog = () => (
    <Dialog
      open={openExercisesDialog}
      onClose={() => setOpenExercisesDialog(false)}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Ejercicios de la rutina</DialogTitle>
      <DialogContent>
        {exercisesToShow && exercisesToShow.length > 0 ? (
          <Box>
            {exercisesToShow.map((ex, idx) => {
              const exObj =
                ex.exercise && typeof ex.exercise === 'object'
                  ? ex.exercise
                  : availableExercises.find(
                      (e) => e._id === (ex.exercise?._id || ex.exercise)
                    );
              return (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 1,
                    border: '1px solid #eee',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant='subtitle1'>
                    <b>{exObj ? exObj.name : `Ejercicio ${idx + 1}`}</b>
                  </Typography>
                  {exObj && exObj.description && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      {exObj.description}
                    </Typography>
                  )}
                  {ex.sets && ex.sets.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant='body2'>
                        <b>Sets:</b>
                      </Typography>
                      {ex.sets.map((set, sidx) => (
                        <Typography
                          key={sidx}
                          variant='body2'
                          sx={{ ml: 2 }}
                        >
                          {`Set ${sidx + 1}: ${set.reps || 0} reps, ${
                            set.weight || 0
                          } kg, ${set.duration || 0} seg, descanso ${
                            set.rest || 0
                          } seg`}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography>No hay ejercicios en esta rutina.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenExercisesDialog(false)}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );

  const handleCreateNewExercise = async () => {
    try {
      const created = await createExercise(newExerciseData);
      await fetchExercises();
      setFormData((prev) => ({
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            exercise: created._id,
            sets: [
              {
                reps: '',
                weight: '',
                duration: '',
                rest: '',
              },
            ],
          },
        ],
      }));
      setOpenNewExerciseDialog(false);
      setNewExerciseData({
        name: '',
        description: '',
        muscleGroups: [],
        equipment: [],
        difficulty: 'beginner',
        instructions: [],
        tips: [],
      });
    } catch (error) {
      setError('Error creando ejercicio');
    }
  };

  if (loading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Cargando rutinas...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper sx={{ p: 4, mb: 4, backgroundColor: 'white' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant='h3'
                sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                Dashboard
              </Typography>
              <Typography variant='h6' color='text.secondary'>
                Resumen de tus rutinas de entrenamiento
              </Typography>
            </Box>
          </Box>
        </Paper>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Routines Section */}
        <Paper sx={{ p: 4, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant='h5' sx={{ fontWeight: 600 }}>
              Mis Rutinas ({routines.length})
            </Typography>
            <Button
              variant='contained'
              onClick={() => navigate('/routines')}
              sx={{ px: 3, py: 1 }}
            >
              Ver Todas las Rutinas
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {routines.length > 0 ? (
            <Grid container spacing={3}>
              {routines.slice(0, 6).map((routine) => (
                <Grid item xs={12} sm={6} md={4} key={routine._id}>
                  <RoutineCard routine={routine} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FitnessCenter
                sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }}
              />
              <Typography variant='h5' gutterBottom sx={{ fontWeight: 600 }}>
                No tienes rutinas creadas
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
              >
                Crea tu primera rutina personalizada para comenzar tu entrenamiento
              </Typography>
              <Button
                variant='contained'
                size='large'
                onClick={() => navigate('/routines')}
                sx={{ px: 4, py: 1.5 }}
              >
                Ir a Rutinas
              </Button>
            </Box>
          )}
        </Paper>

        {/* Modal para ver ejercicios */}
        <Dialog
          open={openExercisesDialog}
          onClose={() => setOpenExercisesDialog(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Ejercicios de la rutina</DialogTitle>
          <DialogContent>
            {exercisesToShow && exercisesToShow.length > 0 ? (
              <Box>
                {exercisesToShow.map((ex, idx) => {
                  const exObj =
                    ex.exercise && typeof ex.exercise === 'object'
                      ? ex.exercise
                      : availableExercises.find(
                          (e) => e._id === (ex.exercise?._id || ex.exercise)
                        );
                  return (
                    <Box
                      key={idx}
                      sx={{
                        mb: 2,
                        p: 1,
                        border: '1px solid #eee',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant='subtitle1'>
                        <b>{exObj ? exObj.name : `Ejercicio ${idx + 1}`}</b>
                      </Typography>
                      {exObj && exObj.description && (
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          {exObj.description}
                        </Typography>
                      )}
                      {ex.sets && ex.sets.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant='body2'>
                            <b>Sets:</b>
                          </Typography>
                          {ex.sets.map((set, sidx) => (
                            <Typography
                              key={sidx}
                              variant='body2'
                              sx={{ ml: 2 }}
                            >
                              {`Set ${sidx + 1}: ${set.reps || 0} reps, ${
                                set.weight || 0
                              } kg, ${set.duration || 0} seg, descanso ${
                                set.rest || 0
                              } seg`}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography>No hay ejercicios en esta rutina.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenExercisesDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;