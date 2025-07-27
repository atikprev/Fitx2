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
  Divider,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  FitnessCenter,
  AccessTime,
  TrendingUp,
  Visibility,
  ArrowBack,
  ArrowForward,
  Check,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [openExercisesDialog, setOpenExercisesDialog] = useState(false);
  const [exercisesToShow, setExercisesToShow] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
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
  const [activeStep, setActiveStep] = useState(0);
  const [selectedExercises, setSelectedExercises] = useState([]);

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

  const handleOpenDialog = (routine = null) => {
    setActiveStep(0);
    setSelectedExercises([]);
    
    if (routine) {
      setSelectedRoutine(routine);
      setFormData({
        name: routine.name,
        description: routine.description || '',
        category: routine.category,
        difficulty: routine.difficulty,
        estimatedDuration: routine.estimatedDuration,
        isPublic: routine.isPublic,
        exercises: routine.exercises || [],
      });
      
      // Set selected exercises for editing
      const exerciseIds = (routine.exercises || []).map(ex => 
        typeof ex.exercise === 'object' ? ex.exercise._id : ex.exercise
      );
      setSelectedExercises(exerciseIds);
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
    // Create exercises array from selected exercises
    const exercisesData = selectedExercises.map((exerciseId, index) => ({
      exercise: exerciseId,
      sets: [
        {
          reps: 10,
          weight: 0,
          duration: 30,
          rest: 60,
        }
      ],
      order: index,
    }));
    
    const dataToSend = { 
      ...formData, 
      exercises: exercisesData 
    };
    
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
      setError('Error al guardar la rutina');
    }
  };

  const handleDelete = async (routineId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      try {
        await axios.delete(`/api/routines/${routineId}`);
        fetchRoutines();
      } catch (error) {
        console.error('Error deleting routine:', error);
        setError('Error al eliminar la rutina');
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

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleExerciseToggle = (exerciseId) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const steps = ['Información Básica', 'Seleccionar Ejercicios', 'Confirmar'];

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
        <Button
          size='small'
          startIcon={<Visibility />}
          variant='outlined'
          onClick={() => {
            setExercisesToShow(routine.exercises || []);
            setOpenExercisesDialog(true);
          }}
        >
          Ver Ejercicios
        </Button>
        
        <Box>
          <IconButton
            size='small'
            onClick={() => handleOpenDialog(routine)}
            color='primary'
            sx={{ mr: 1 }}
          >
            <Edit />
          </IconButton>
          <IconButton
            size='small'
            onClick={() => handleDelete(routine._id)}
            color='error'
          >
            <Delete />
          </IconButton>
        </Box>
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
                Gestiona tus rutinas de entrenamiento
              </Typography>
            </Box>
            <Button
              variant='contained'
              size='large'
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ px: 4, py: 1.5 }}
            >
              Nueva Rutina
            </Button>
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
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Mis Rutinas ({routines.length})
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {routines.length > 0 ? (
            <Grid container spacing={3}>
              {routines.map((routine) => (
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
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ px: 4, py: 1.5 }}
              >
                Crear Primera Rutina
              </Button>
            </Box>
          )}
        </Paper>

        {/* Floating Action Button */}
        <Fab
          color='primary'
          aria-label='add'
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => handleOpenDialog()}
        >
          <Add />
        </Fab>

        {/* Create/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth='lg'
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              minHeight: '70vh',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <Delete />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          
          {/* Stepper */}
          <Box sx={{ px: 3, pt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          <DialogContent sx={{ pt: 3 }}>
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <Box sx={{ minHeight: 400 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                  Información Básica de la Rutina
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Nombre de la rutina'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Descripción'
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      multiline
                      rows={3}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Categoría</InputLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value='strength'>Fuerza</MenuItem>
                        <MenuItem value='cardio'>Cardio</MenuItem>
                        <MenuItem value='flexibility'>Flexibilidad</MenuItem>
                        <MenuItem value='sports'>Deportes</MenuItem>
                        <MenuItem value='rehabilitation'>Rehabilitación</MenuItem>
                        <MenuItem value='weight_loss'>Pérdida de peso</MenuItem>
                        <MenuItem value='muscle_gain'>Ganancia muscular</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Dificultad</InputLabel>
                      <Select
                        value={formData.difficulty}
                        onChange={(e) =>
                          setFormData({ ...formData, difficulty: e.target.value })
                        }
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value='beginner'>Principiante</MenuItem>
                        <MenuItem value='intermediate'>Intermedio</MenuItem>
                        <MenuItem value='advanced'>Avanzado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label='Duración estimada (min)'
                      type='number'
                      value={formData.estimatedDuration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedDuration: parseInt(e.target.value),
                        })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Step 2: Select Exercises */}
            {activeStep === 1 && (
              <Box sx={{ minHeight: 400 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Seleccionar Ejercicios
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setOpenNewExerciseDialog(true)}
                    size="small"
                  >
                    Nuevo Ejercicio
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Selecciona los ejercicios que quieres incluir en tu rutina. Puedes elegir múltiples ejercicios.
                </Typography>
                
                {loadingExercises ? (
                  <Typography>Cargando ejercicios...</Typography>
                ) : (
                  <Paper sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #e0e0e0' }}>
                    <List>
                      {availableExercises.map((exercise) => (
                        <ListItem
                          key={exercise._id}
                          button
                          onClick={() => handleExerciseToggle(exercise._id)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'primary.50',
                            },
                            backgroundColor: selectedExercises.includes(exercise._id) 
                              ? 'primary.50' 
                              : 'transparent',
                          }}
                        >
                          <Checkbox
                            checked={selectedExercises.includes(exercise._id)}
                            onChange={() => handleExerciseToggle(exercise._id)}
                            sx={{ mr: 2 }}
                          />
                          <ListItemText
                            primary={exercise.name}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {exercise.description || 'Sin descripción'}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                  {exercise.muscleGroups?.map((group) => (
                                    <Chip
                                      key={group}
                                      label={group}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
                
                {selectedExercises.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Ejercicios seleccionados: {selectedExercises.length}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedExercises.map((exerciseId) => {
                        const exercise = availableExercises.find(ex => ex._id === exerciseId);
                        return (
                          <Chip
                            key={exerciseId}
                            label={exercise?.name || 'Ejercicio'}
                            onDelete={() => handleExerciseToggle(exerciseId)}
                            color="primary"
                            variant="filled"
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            
            {/* Step 3: Confirm */}
            {activeStep === 2 && (
              <Box sx={{ minHeight: 400 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                  Confirmar Rutina
                </Typography>
                
                <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {formData.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formData.description || 'Sin descripción'}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Categoría
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formData.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Dificultad
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formData.difficulty}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Duración
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formData.estimatedDuration} min
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Ejercicios
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedExercises.length}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {formData.isPublic && (
                    <Chip label="Rutina Pública" color="info" size="small" />
                  )}
                </Paper>
                
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Ejercicios incluidos:
                </Typography>
                
                <List sx={{ border: '1px solid #e0e0e0', borderRadius: 2, maxHeight: 200, overflow: 'auto' }}>
                  {selectedExercises.map((exerciseId, index) => {
                    const exercise = availableExercises.find(ex => ex._id === exerciseId);
                    return (
                      <ListItem key={exerciseId}>
                        <ListItemText
                          primary={`${index + 1}. ${exercise?.name || 'Ejercicio'}`}
                          secondary={exercise?.description || 'Sin descripción'}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </DialogContent>
          
          <Divider />
          
          <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
            <Button onClick={handleCloseDialog} size="large">
              Cancelar
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  size="large"
                >
                  Anterior
                </Button>
              )}
              
              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<ArrowForward />}
                  size="large"
                  disabled={
                    (activeStep === 0 && !formData.name) ||
                    (activeStep === 1 && selectedExercises.length === 0)
                  }
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  startIcon={<Check />}
                  size="large"
                  sx={{ px: 4 }}
                >
                  {selectedRoutine ? 'Actualizar Rutina' : 'Crear Rutina'}
                </Button>
              )}
            </Box>
          </DialogActions>
        </Dialog>

        {/* Modal para ver ejercicios */}
        <ExercisesDialog />

        {/* Modal para crear nuevo ejercicio */}
        <Dialog
          open={openNewExerciseDialog}
          onClose={() => setOpenNewExerciseDialog(false)}
          maxWidth='md'
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Crear Nuevo Ejercicio
              </Typography>
              <IconButton onClick={() => setOpenNewExerciseDialog(false)} size="small">
                <Delete />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label='Nombre del ejercicio'
                  fullWidth
                  value={newExerciseData.name}
                  onChange={(e) =>
                    setNewExerciseData({ ...newExerciseData, name: e.target.value })
                  }
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label='Descripción'
                  fullWidth
                  value={newExerciseData.description}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      description: e.target.value,
                    })
                  }
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Grupos musculares</InputLabel>
                  <Select
                    multiple
                    value={newExerciseData.muscleGroups}
                    onChange={(e) =>
                      setNewExerciseData({
                        ...newExerciseData,
                        muscleGroups: e.target.value,
                      })
                    }
                    sx={{ borderRadius: 2 }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value='chest'>Pecho</MenuItem>
                    <MenuItem value='back'>Espalda</MenuItem>
                    <MenuItem value='shoulders'>Hombros</MenuItem>
                    <MenuItem value='arms'>Brazos</MenuItem>
                    <MenuItem value='legs'>Piernas</MenuItem>
                    <MenuItem value='core'>Core</MenuItem>
                    <MenuItem value='cardio'>Cardio</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Equipo necesario</InputLabel>
                  <Select
                    multiple
                    value={newExerciseData.equipment}
                    onChange={(e) =>
                      setNewExerciseData({
                        ...newExerciseData,
                        equipment: e.target.value,
                      })
                    }
                    sx={{ borderRadius: 2 }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value='bodyweight'>Peso corporal</MenuItem>
                    <MenuItem value='dumbbells'>Mancuernas</MenuItem>
                    <MenuItem value='barbell'>Barra</MenuItem>
                    <MenuItem value='machine'>Máquina</MenuItem>
                    <MenuItem value='cable'>Cable</MenuItem>
                    <MenuItem value='resistance_band'>Banda de resistencia</MenuItem>
                    <MenuItem value='kettlebell'>Kettlebell</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Dificultad</InputLabel>
                  <Select
                    value={newExerciseData.difficulty}
                    onChange={(e) =>
                      setNewExerciseData({
                        ...newExerciseData,
                        difficulty: e.target.value,
                      })
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value='beginner'>Principiante</MenuItem>
                    <MenuItem value='intermediate'>Intermedio</MenuItem>
                    <MenuItem value='advanced'>Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label='Instrucciones (separadas por coma)'
                  fullWidth
                  value={newExerciseData.instructions.join(', ')}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      instructions: e.target.value.split(',').map((i) => i.trim()).filter(i => i),
                    })
                  }
                  multiline
                  rows={2}
                  placeholder="Ej: Mantén la espalda recta, Controla el movimiento, Respira correctamente"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label='Tips adicionales (separados por coma)'
                  fullWidth
                  value={newExerciseData.tips.join(', ')}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      tips: e.target.value.split(',').map((i) => i.trim()).filter(i => i),
                    })
                  }
                  multiline
                  rows={2}
                  placeholder="Ej: Calienta antes de empezar, Aumenta peso gradualmente"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
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
              }} 
              size="large"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateNewExercise}
              variant='contained'
              size="large"
              sx={{ px: 4 }}
              disabled={!newExerciseData.name}
            >
              Crear Ejercicio
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;