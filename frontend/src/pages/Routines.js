import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fab,
  Fade,
  Zoom,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  FitnessCenter,
  AccessTime,
  TrendingUp,
  SportsMartialArts,
  Timer,
  Group,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Routines = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'beginner',
    estimatedDuration: 30,
    isPublic: false,
    exercises: [],
  });
  // Estado para ver ejercicios
  const [openExercisesDialog, setOpenExercisesDialog] = useState(false);
  const [exercisesToShow, setExercisesToShow] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  // Nueva estado y función para crear ejercicio
  const [openNewExerciseDialog, setOpenNewExerciseDialog] = useState(false);
  const [newExerciseData, setNewExerciseData] = useState({
    name: '',
    description: '',
    muscleGroups: [],
    equipment: [],
    difficulty: 'beginner',
    instructions: [],
    tips: [],
  });

  useEffect(() => {
    if (user) {
      fetchRoutines();
      fetchExercises();
    }
  }, [user]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/routines');
      setRoutines(response.data.routines || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
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

  const handleOpenDialog = (routine = null) => {
    if (routine) {
      setSelectedRoutine(routine);
      setFormData({
        name: routine.name,
        description: routine.description || '',
        category: routine.category,
        difficulty: routine.difficulty,
        estimatedDuration: routine.estimatedDuration,
        isPublic: routine.isPublic,
        exercises: (routine.exercises || []).map((ex, idx) => ({
          exercise:
            typeof ex.exercise === 'object' ? ex.exercise._id : ex.exercise,
          sets: (ex.sets || []).map((set) => ({
            reps: set.reps ?? '',
            weight: set.weight ?? '',
            duration: set.duration ?? '',
            rest: set.rest ?? '',
          })),
          order: ex.order !== undefined ? ex.order : idx,
        })),
      });
    } else {
      setSelectedRoutine(null);
      setFormData({
        name: '',
        description: '',
        category: 'strength',
        difficulty: 'beginner',
        estimatedDuration: 30,
        isPublic: false,
        exercises: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRoutine(null);
  };

  const handleSubmit = async () => {
    // Normalizar los sets para cumplir con Joi
    const normalizedExercises = formData.exercises
      .map((ex, idx) => {
        const sets = (ex.sets || [])
          .map((set) => ({
            reps:
              set.reps !== '' && set.reps !== undefined
                ? Number(set.reps)
                : undefined,
            weight:
              set.weight !== '' && set.weight !== undefined
                ? Number(set.weight)
                : undefined,
            duration:
              set.duration !== '' && set.duration !== undefined
                ? Number(set.duration)
                : undefined,
            rest:
              set.rest !== '' && set.rest !== undefined
                ? Number(set.rest)
                : undefined,
          }))
          .filter(
            (set) =>
              set.reps !== undefined &&
              set.weight !== undefined &&
              set.duration !== undefined &&
              set.rest !== undefined
          );
        // Solo incluir ejercicios con al menos un set válido
        if (sets.length === 0) return null;
        return {
          exercise: typeof ex === 'string' ? ex : ex.exercise,
          sets,
          order: ex.order !== undefined ? ex.order : idx,
        };
      })
      .filter(Boolean); // Elimina ejercicios nulos
    const dataToSend = { ...formData, exercises: normalizedExercises };
    try {
      if (selectedRoutine) {
        await axios.put(`/api/routines/${selectedRoutine._id}`, dataToSend);
      } else {
        await axios.post('/api/routines', dataToSend);
      }
      fetchRoutines();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  };

  const handleDelete = async (routineId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      try {
        await axios.delete(`/api/routines/${routineId}`);
        fetchRoutines();
      } catch (error) {
        console.error('Error deleting routine:', error);
      }
    }
  };

  const createExercise = async (exerciseData) => {
    try {
      const res = await axios.post('/api/exercises', exerciseData);
      return res.data;
    } catch (error) {
      console.error('Error creando ejercicio:', error);
      throw error;
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

  const getCategoryGradient = (category) => {
    const gradients = {
      strength: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      cardio: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
      flexibility: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
      sports: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
      rehabilitation: 'linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)',
      weight_loss: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
      muscle_gain: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    };
    return gradients[category] || 'linear-gradient(135deg, #666 0%, #999 100%)';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'error',
    };
    return colors[difficulty] || 'default';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      strength: <FitnessCenter />,
      cardio: <TrendingUp />,
      flexibility: <SportsMartialArts />,
      sports: <SportsMartialArts />,
      rehabilitation: <FitnessCenter />,
      weight_loss: <TrendingUp />,
      muscle_gain: <FitnessCenter />,
    };
    return icons[category] || <FitnessCenter />;
  };

  const RoutineCard = ({ routine, index }) => (
  <Fade in timeout={300 + index * 100}>
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          backgroundColor: 'rgba(255,255,255,0.95)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: getCategoryGradient(routine.category),
        }
      }}
    >
      {/* Encabezado de la tarjeta */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 3,
          pb: 0,
          gap: 2
        }}
      >
        <Avatar
          sx={{
            width: 50,
            height: 50,
            background: getCategoryGradient(routine.category),
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          }}
        >
          {getCategoryIcon(routine.category)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {routine.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={routine.category}
              size="small"
              sx={{
                textTransform: 'capitalize',
                background: getCategoryGradient(routine.category),
                color: 'white',
                fontWeight: 600,
                height: 24,
              }}
            />
            <Chip
              label={routine.difficulty}
              size="small"
              sx={{
                textTransform: 'capitalize',
                fontWeight: 600,
                height: 24,
                backgroundColor: `${getDifficultyColor(routine.difficulty)}.light`,
                color: `${getDifficultyColor(routine.difficulty)}.dark`,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Contenido principal */}
      <CardContent sx={{ flexGrow: 1, p: 3, pt: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            lineHeight: 1.6,
            fontStyle: routine.description ? 'normal' : 'italic',
            minHeight: '3.6em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {routine.description || 'No hay descripción'}
        </Typography>

        {/* Estadísticas */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <StatBox
              icon={<AccessTime />}
              label="Duración"
              value={`${routine.estimatedDuration} min`}
              color="primary"
            />
          </Grid>
          <Grid item xs={6}>
            <StatBox
              icon={<FitnessCenter />}
              label="Ejercicios"
              value={routine.exercises?.length || 0}
              color="success"
            />
          </Grid>
        </Grid>

        {routine.isPublic && (
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<Group />}
              label="Pública"
              size="small"
              sx={{
                backgroundColor: 'rgba(2, 136, 209, 0.1)',
                color: '#0288d1',
                fontWeight: 600,
              }}
            />
          </Box>
        )}
      </CardContent>

      {/* Acciones */}
      <CardActions sx={{ p: 2, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => {
            setExercisesToShow(routine.exercises || []);
            setOpenExercisesDialog(true);
          }}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            flexGrow: 1
          }}
        >
          Ver ejercicios
        </Button>
        <IconButton
          size="small"
          onClick={() => handleOpenDialog(routine)}
          sx={{
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            color: '#1976d2',
          }}
        >
          <Edit />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleDelete(routine._id)}
          sx={{
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: '#d32f2f',
          }}
        >
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  </Fade>
);

// Componente auxiliar para las estadísticas
const StatBox = ({ icon, label, value, color }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    p: 1.5,
    backgroundColor: `${color}.lightest`,
    borderRadius: 2,
    border: `1px solid ${color}.border`,
    height: '100%'
  }}>
    <Avatar sx={{
      width: 32,
      height: 32,
      mr: 1.5,
      backgroundColor: `${color}.light`,
      color: `${color}.main`
    }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" color={`${color}.dark`} sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

  // Modal para ver ejercicios de la rutina
  const ExercisesDialog = () => (
    <Dialog
      open={openExercisesDialog}
      onClose={() => setOpenExercisesDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.3rem'
      }}>
        💪 Ejercicios de la rutina
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
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
                <Fade in key={idx} timeout={300 + idx * 100}>
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 3,
                      p: 3,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 700
                      }}>
                        {idx + 1}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {exObj ? exObj.name : `Ejercicio ${idx + 1}`}
                      </Typography>
                    </Box>
                    {exObj && exObj.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, fontStyle: 'italic', lineHeight: 1.6 }}
                      >
                        {exObj.description}
                      </Typography>
                    )}
                    {ex.sets && ex.sets.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#2e7d32' }}>
                          📊 Sets programados:
                        </Typography>
                        <Grid container spacing={1}>
                          {ex.sets.map((set, sidx) => (
                            <Grid item xs={12} sm={6} md={4} key={sidx}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  backgroundColor: 'rgba(46, 125, 50, 0.05)',
                                  border: '1px solid rgba(46, 125, 50, 0.2)',
                                  borderRadius: 2,
                                  textAlign: 'center'
                                }}
                              >
                                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                                  Set {sidx + 1}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {set.reps || 0} reps • {set.weight || 0} kg
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {set.duration || 0}s • descanso {set.rest || 0}s
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                </Fade>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              backgroundColor: 'rgba(0,0,0,0.05)'
            }}>
              <FitnessCenter sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Avatar>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
              No hay ejercicios en esta rutina
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={() => setOpenExercisesDialog(false)}
          variant="contained"
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 3
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handleCreateNewExercise = async () => {
    try {
      const created = await createExercise(newExerciseData);
      // Actualizar lista de ejercicios disponibles
      await fetchExercises();
      // Agregar el nuevo ejercicio a la rutina
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
      alert('Error creando ejercicio');
    }
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 119, 255, 0.3), transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Container maxWidth="lg" sx={{ pt: 8, pb: 4, position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{
            color: 'white',
            textAlign: 'center',
            mb: 6,
            fontWeight: 800,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            🏋️‍♂️ Cargando rutinas...
          </Typography>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton
                  variant="rectangular"
                  height={300}
                  sx={{
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    animation: 'pulse 1.5s ease-in-out 0.5s infinite alternate'
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 40% 80%, rgba(120, 119, 255, 0.3), transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      <Container maxWidth="lg" sx={{ pt: 6, pb: 4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Header */}
          <Grid item xs={12}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 3,
              mb: 4,
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              p: 3,
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    mb: { xs: 1, sm: 0 }
                  }}
                >
                  🏋️‍♂️ Mis Rutinas
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Administra tus rutinas de entrenamiento personalizadas
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: 4,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#1976d2',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                    backgroundColor: 'white',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  alignSelf: { xs: 'stretch', sm: 'center' }
                }}
              >
                Nueva Rutina
              </Button>
            </Box>
          </Grid>

          {/* Routines Grid */}
          {routines.length > 0 ? (
            routines.map((routine, index) => (
              <Grid item xs={12} sm={6} md={4} key={routine._id}>
                <RoutineCard routine={routine} index={index} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Fade in timeout={600}>
                <Paper sx={{
                  p: 6,
                  textAlign: 'center',
                  backdropFilter: 'blur(20px)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}>
                  <Avatar sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  }}>
                    <FitnessCenter sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    🎯 ¡Comienza tu viaje fitness!
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    No tienes rutinas creadas
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, lineHeight: 1.6, maxWidth: 500, mx: 'auto' }}
                  >
                    Crea tu primera rutina personalizada y comienza a entrenar de manera estructurada y efectiva
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                      borderRadius: 4,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.05)',
                        boxShadow: '0 15px 35px rgba(102, 126, 234, 0.5)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Crear Primera Rutina
                  </Button>
                </Paper>
              </Fade>
            </Grid>
          )}
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              transform: 'scale(1.1) rotate(90deg)',
              boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => handleOpenDialog()}
        >
          <Add sx={{ fontSize: 32 }} />
        </Fab>

        {/* Create/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {selectedRoutine ? '✏️ Editar Rutina' : '➕ Nueva Rutina'}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="🏷️ Nombre de la rutina"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="📝 Descripción"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>🎯 Categoría</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    sx={{
                      borderRadius: 3,
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      }
                    }}
                  >
                    <MenuItem value="strength">💪 Fuerza</MenuItem>
                    <MenuItem value="cardio">❤️ Cardio</MenuItem>
                    <MenuItem value="flexibility">🤸 Flexibilidad</MenuItem>
                    <MenuItem value="sports">⚽ Deportes</MenuItem>
                    <MenuItem value="rehabilitation">🏥 Rehabilitación</MenuItem>
                    <MenuItem value="weight_loss">📉 Pérdida de peso</MenuItem>
                    <MenuItem value="muscle_gain">📈 Ganancia muscular</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>📊 Dificultad</InputLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    sx={{
                      borderRadius: 3,
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      }
                    }}
                  >
                    <MenuItem value="beginner">🟢 Principiante</MenuItem>
                    <MenuItem value="intermediate">🟡 Intermedio</MenuItem>
                    <MenuItem value="advanced">🔴 Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="⏱️ Duración estimada (min)"
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDuration: parseInt(e.target.value),
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="exercises-label">🏋️ Ejercicios</InputLabel>
                  <Select
                    labelId="exercises-label"
                    multiple
                    value={formData.exercises.map((ex) =>
                      typeof ex === 'string' ? ex : ex.exercise
                    )}
                    onChange={async (e) => {
                      const selected = e.target.value;
                      if (selected.includes('nuevo')) {
                        setOpenNewExerciseDialog(true);
                        setFormData((prev) => ({
                          ...prev,
                          exercises: prev.exercises.filter(
                            (ex) => ex !== 'nuevo'
                          ),
                        }));
                        return;
                      }
                      setFormData((prev) => ({
                        ...prev,
                        exercises: selected.map((exId, idx) => {
                          const found = prev.exercises.find((ex) =>
                            typeof ex === 'string'
                              ? ex === exId
                              : ex.exercise === exId
                          );
                          return found
                            ? found
                            : {
                              exercise: exId,
                              sets: [
                                {
                                  reps: '',
                                  weight: '',
                                  duration: '',
                                  rest: '',
                                },
                              ],
                            };
                        }),
                      }));
                    }}
                    renderValue={(selected) =>
                      availableExercises
                        .filter((ex) => selected.includes(ex._id))
                        .map((ex) => ex.name)
                        .concat(
                          selected.includes('nuevo') ? ['(Nuevo ejercicio)'] : []
                        )
                        .join(', ')
                    }
                    disabled={loadingExercises}
                    sx={{
                      borderRadius: 3,
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      }
                    }}
                  >
                    {loadingExercises ? (
                      <MenuItem disabled>Cargando ejercicios...</MenuItem>
                    ) : (
                      [
                        ...availableExercises.map((ex) => (
                          <MenuItem key={ex._id} value={ex._id}>
                            {ex.name}
                          </MenuItem>
                        )),
                        <MenuItem key="nuevo" value="nuevo">
                          <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            ➕ Crear nuevo ejercicio
                          </Button>
                        </MenuItem>,
                      ]
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sets y notas por ejercicio */}
              {formData.exercises.length > 0 && (
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2,
                      mb: 3,
                      fontWeight: 700,
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    📊 Configuración de sets por ejercicio
                  </Typography>
                  {formData.exercises.map((ex, idx) => {
                    const exId = typeof ex === 'string' ? ex : ex.exercise;
                    const exObj = availableExercises.find((e) => e._id === exId);
                    const sets =
                      (typeof ex === 'string'
                        ? [{ reps: '', weight: '', duration: '', rest: '' }]
                        : ex.sets) || [];
                    return (
                      <Fade in key={exId} timeout={300 + idx * 100}>
                        <Paper
                          elevation={0}
                          sx={{
                            mb: 3,
                            p: 3,
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            borderRadius: 3,
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(102, 126, 234, 0.08)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
                            }
                          }}
                        >
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 700
                              }}>
                                {idx + 1}
                              </Avatar>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: '#1976d2'
                                }}
                              >
                                {exObj ? exObj.name : 'Ejercicio'}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  exercises: prev.exercises.filter(
                                    (_, i) => i !== idx
                                  ),
                                }));
                              }}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                            >
                              🗑️ Eliminar ejercicio
                            </Button>
                          </Box>

                          {sets.map((set, sidx) => (
                            <Paper
                              key={sidx}
                              elevation={0}
                              sx={{
                                p: 2,
                                mb: 2,
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: 2,
                              }}
                            >
                              <Typography variant="subtitle2" sx={{
                                fontWeight: 700,
                                mb: 2,
                                color: '#2e7d32',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                🎯 Set {sidx + 1}
                              </Typography>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6} sm={2}>
                                  <TextField
                                    label="Reps"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={set.reps}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const newExercises = [...prev.exercises];
                                        if (typeof newExercises[idx] === 'string')
                                          newExercises[idx] = {
                                            exercise: exId,
                                            sets: [{
                                              reps: '',
                                              weight: '',
                                              duration: '',
                                              rest: '',
                                            }],
                                          };
                                        newExercises[idx].sets[sidx].reps = val;
                                        return { ...prev, exercises: newExercises };
                                      });
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                      }
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                  <TextField
                                    label="Peso (kg)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={set.weight}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const newExercises = [...prev.exercises];
                                        if (typeof newExercises[idx] === 'string')
                                          newExercises[idx] = {
                                            exercise: exId,
                                            sets: [{
                                              reps: '',
                                              weight: '',
                                              duration: '',
                                              rest: '',
                                            }],
                                          };
                                        newExercises[idx].sets[sidx].weight = val;
                                        return { ...prev, exercises: newExercises };
                                      });
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                      }
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                  <TextField
                                    label="Duración (seg)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={set.duration}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const newExercises = [...prev.exercises];
                                        if (typeof newExercises[idx] === 'string')
                                          newExercises[idx] = {
                                            exercise: exId,
                                            sets: [{
                                              reps: '',
                                              weight: '',
                                              duration: '',
                                              rest: '',
                                            }],
                                          };
                                        newExercises[idx].sets[sidx].duration = val;
                                        return { ...prev, exercises: newExercises };
                                      });
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                      }
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                  <TextField
                                    label="Descanso (seg)"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={set.rest}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => {
                                        const newExercises = [...prev.exercises];
                                        if (typeof newExercises[idx] === 'string')
                                          newExercises[idx] = {
                                            exercise: exId,
                                            sets: [{
                                              reps: '',
                                              weight: '',
                                              duration: '',
                                              rest: '',
                                            }],
                                          };
                                        newExercises[idx].sets[sidx].rest = val;
                                        return { ...prev, exercises: newExercises };
                                      });
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                      }
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                      onClick={() => {
                                        setFormData((prev) => {
                                          const newExercises = [...prev.exercises];
                                          if (typeof newExercises[idx] === 'string')
                                            newExercises[idx] = {
                                              exercise: exId,
                                              sets: [{
                                                reps: '',
                                                weight: '',
                                                duration: '',
                                                rest: '',
                                              }],
                                            };
                                          newExercises[idx].sets.splice(sidx, 1);
                                          if (newExercises[idx].sets.length === 0)
                                            newExercises[idx].sets.push({
                                              reps: '',
                                              weight: '',
                                              duration: '',
                                              rest: '',
                                            });
                                          return { ...prev, exercises: newExercises };
                                        });
                                      }}
                                      sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        minWidth: 'auto',
                                        px: 2
                                      }}
                                    >
                                      🗑️
                                    </Button>
                                    <Button
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                      onClick={() => {
                                        setFormData((prev) => {
                                          const newExercises = [...prev.exercises];
                                          if (typeof newExercises[idx] === 'string')
                                            newExercises[idx] = {
                                              exercise: exId,
                                              sets: [{
                                                reps: '',
                                                weight: '',
                                                duration: '',
                                                rest: '',
                                              }],
                                            };
                                          const setToCopy = {
                                            ...newExercises[idx].sets[sidx],
                                          };
                                          newExercises[idx].sets.splice(
                                            sidx + 1,
                                            0,
                                            setToCopy
                                          );
                                          return { ...prev, exercises: newExercises };
                                        });
                                      }}
                                      sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        flexGrow: 1
                                      }}
                                    >
                                      📋 Duplicar
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}

                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setFormData((prev) => {
                                const newExercises = [...prev.exercises];
                                if (typeof newExercises[idx] === 'string')
                                  newExercises[idx] = {
                                    exercise: exId,
                                    sets: [{
                                      reps: '',
                                      weight: '',
                                      duration: '',
                                      rest: '',
                                    }],
                                  };
                                newExercises[idx].sets.push({
                                  reps: '',
                                  weight: '',
                                  duration: '',
                                  rest: '',
                                });
                                return { ...prev, exercises: newExercises };
                              });
                            }}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)',
                              }
                            }}
                          >
                            ➕ Agregar set
                          </Button>
                        </Paper>
                      </Fade>
                    );
                  })}
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, gap: 2 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {selectedRoutine ? '✏️ Actualizar' : '➕ Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para ver ejercicios */}
        <ExercisesDialog />

        {/* Modal para crear nuevo ejercicio */}
        <Dialog
          open={openNewExerciseDialog}
          onClose={() => setOpenNewExerciseDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.3rem'
          }}>
            ➕ Nuevo Ejercicio
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="🏷️ Nombre"
                  fullWidth
                  value={newExerciseData.name}
                  onChange={(e) =>
                    setNewExerciseData({ ...newExerciseData, name: e.target.value })
                  }
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }
                  }}
                />
                <TextField
                  label="📝 Descripción"
                  fullWidth
                  value={newExerciseData.description}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      description: e.target.value,
                    })
                  }
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>💪 Grupos musculares</InputLabel>
                  <Select
                    multiple
                    value={newExerciseData.muscleGroups}
                    onChange={(e) =>
                      setNewExerciseData({
                        ...newExerciseData,
                        muscleGroups: e.target.value,
                      })
                    }
                    sx={{
                      borderRadius: 3,
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }}
                  >
                    <MenuItem value="chest">🫁 Pecho</MenuItem>
                    <MenuItem value="back">🫸 Espalda</MenuItem>
                    <MenuItem value="shoulders">🤲 Hombros</MenuItem>
                    <MenuItem value="arms">💪 Brazos</MenuItem>
                    <MenuItem value="legs">🦵 Piernas</MenuItem>
                    <MenuItem value="core">🫄 Core</MenuItem>
                    <MenuItem value="cardio">❤️ Cardio</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>🏋️ Equipo</InputLabel>
                  <Select
                    multiple
                    value={newExerciseData.equipment}
                    onChange={(e) =>
                      setNewExerciseData({
                        ...newExerciseData,
                        equipment: e.target.value,
                      })
                    }
                    sx={{
                      borderRadius: 3,
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }}
                  >
                    <MenuItem value="bodyweight">🧘 Peso corporal</MenuItem>
                    <MenuItem value="dumbbells">🏋️ Mancuernas</MenuItem>
                    <MenuItem value="barbell">🏋️‍♂️ Barra</MenuItem>
                    <MenuItem value="machine">🏭 Máquina</MenuItem>
                    <MenuItem value="cable">🔗 Cable</MenuItem>
                    <MenuItem value="resistance_band">🎀 Banda de resistencia</MenuItem>
                    <MenuItem value="kettlebell">⚡ Kettlebell</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>📊 Dificultad</InputLabel>
                  <Select
                    value={newExerciseData.difficulty}
                    onChange={(e) =>
                      setNewExerciseData({
                        ...newExerciseData,
                        difficulty: e.target.value,
                      })
                    }
                    sx={{
                      borderRadius: 3,
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }}
                  >
                    <MenuItem value="beginner">🟢 Principiante</MenuItem>
                    <MenuItem value="intermediate">🟡 Intermedio</MenuItem>
                    <MenuItem value="advanced">🔴 Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="📋 Instrucciones (separadas por coma)"
                  fullWidth
                  value={newExerciseData.instructions.join(', ')}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      instructions: e.target.value.split(',').map((i) => i.trim()),
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="💡 Tips (separados por coma)"
                  fullWidth
                  value={newExerciseData.tips.join(', ')}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      tips: e.target.value.split(',').map((i) => i.trim()),
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, gap: 2 }}>
            <Button
              onClick={() => setOpenNewExerciseDialog(false)}
              variant="outlined"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateNewExercise}
              variant="contained"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.5)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              ➕ Crear
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </Box>
  );
};

export default Routines;
