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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  FitnessCenter,
  AccessTime,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
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
      elevation={2}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
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
            variant='h6'
            component='div'
          >
            {routine.name}
          </Typography>
          <Box>
            <Chip
              label={routine.category}
              color={getCategoryColor(routine.category)}
              size='small'
              sx={{ mr: 1 }}
            />
            <Chip
              label={routine.difficulty}
              color={getDifficultyColor(routine.difficulty)}
              size='small'
            />
          </Box>
        </Box>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 2 }}
        >
          {routine.description || 'Sin descripción'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime sx={{ mr: 1, fontSize: 16 }} />
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {routine.estimatedDuration} min
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FitnessCenter sx={{ mr: 1, fontSize: 16 }} />
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {routine.exercises?.length || 0} ejercicios
          </Typography>
        </Box>
        {routine.isPublic && (
          <Chip
            label='Público'
            color='info'
            size='small'
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
      <CardActions>
        {/* <Button
          size='small'
          startIcon={<PlayArrow />}
          color='primary'
          variant='contained'
        >
          Iniciar
        </Button> */}
        <Button
          size='small'
          color='secondary'
          onClick={() => {
            setExercisesToShow(routine.exercises || []);
            setOpenExercisesDialog(true);
          }}
        >
          Ver ejercicios
        </Button>
        <IconButton
          size='small'
          onClick={() => handleOpenDialog(routine)}
          color='primary'
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
      </CardActions>
    </Card>
  );
  // Modal para ver ejercicios de la rutina
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
          <Typography>Cargando rutinas...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid
          item
          xs={12}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant='h4'
              gutterBottom
            >
              Mis Rutinas
            </Typography>
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Nueva Rutina
            </Button>
          </Box>
        </Grid>

        {/* Routines Grid */}
        {routines.length > 0 ? (
          routines.map((routine) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={routine._id}
            >
              <RoutineCard routine={routine} />
            </Grid>
          ))
        ) : (
          <Grid
            item
            xs={12}
          >
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <FitnessCenter
                sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
              />
              <Typography
                variant='h6'
                gutterBottom
              >
                No tienes rutinas creadas
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 3 }}
              >
                Crea tu primera rutina para empezar a entrenar
              </Typography>
              <Button
                variant='contained'
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Crear Primera Rutina
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color='primary'
        aria-label='add'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          {selectedRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
        </DialogTitle>
        <DialogContent>
          <Grid
            container
            spacing={2}
            sx={{ mt: 1 }}
          >
            <Grid
              item
              xs={12}
            >
              <TextField
                fullWidth
                label='Nombre de la rutina'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <TextField
                fullWidth
                label='Descripción'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
            >
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
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
            <Grid
              item
              xs={12}
              sm={6}
            >
              <FormControl fullWidth>
                <InputLabel>Dificultad</InputLabel>
                <Select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                >
                  <MenuItem value='beginner'>Principiante</MenuItem>
                  <MenuItem value='intermediate'>Intermedio</MenuItem>
                  <MenuItem value='advanced'>Avanzado</MenuItem>
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
                label='Duración estimada (min)'
                type='number'
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDuration: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <FormControl fullWidth>
                <InputLabel id='exercises-label'>Ejercicios</InputLabel>
                <Select
                  labelId='exercises-label'
                  multiple
                  value={formData.exercises.map((ex) =>
                    typeof ex === 'string' ? ex : ex.exercise
                  )}
                  onChange={async (e) => {
                    const selected = e.target.value;
                    if (selected.includes('nuevo')) {
                      setOpenNewExerciseDialog(true);
                      // Eliminar 'nuevo' de la selección para evitar que quede en la rutina
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
                >
                  {loadingExercises ? (
                    <MenuItem disabled>Cargando ejercicios...</MenuItem>
                  ) : (
                    [
                      ...availableExercises.map((ex) => (
                        <MenuItem
                          key={ex._id}
                          value={ex._id}
                        >
                          {ex.name}
                        </MenuItem>
                      )),
                      <MenuItem
                        key='nuevo'
                        value='nuevo'
                      >
                        <Button
                          variant='outlined'
                          color='primary'
                          fullWidth
                        >
                          + Crear nuevo ejercicio
                        </Button>
                      </MenuItem>,
                    ]
                  )}
                </Select>
              </FormControl>
            </Grid>
            {/* Sets y notas por ejercicio */}
            {formData.exercises.length > 0 && (
              <Grid
                item
                xs={12}
              >
                <Typography
                  variant='subtitle1'
                  sx={{ mt: 2, mb: 1 }}
                >
                  Sets por ejercicio
                </Typography>
                {formData.exercises.map((ex, idx) => {
                  const exId = typeof ex === 'string' ? ex : ex.exercise;
                  const exObj = availableExercises.find((e) => e._id === exId);
                  const sets =
                    (typeof ex === 'string'
                      ? [{ reps: '', weight: '', duration: '', rest: '' }]
                      : ex.sets) || [];
                  return (
                    <Box
                      key={exId}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid #eee',
                        borderRadius: 1,
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Typography
                          variant='subtitle2'
                          sx={{ flexGrow: 1 }}
                        >
                          <b>{exObj ? exObj.name : 'Ejercicio'}</b>
                        </Typography>
                        <Button
                          size='small'
                          color='error'
                          variant='outlined'
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              exercises: prev.exercises.filter(
                                (_, i) => i !== idx
                              ),
                            }));
                          }}
                          sx={{ ml: 2 }}
                        >
                          Eliminar ejercicio
                        </Button>
                      </Box>
                      {sets.map((set, sidx) => (
                        <Box
                          key={sidx}
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <TextField
                            label='Reps'
                            type='number'
                            size='small'
                            value={set.reps}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const newExercises = [...prev.exercises];
                                if (typeof newExercises[idx] === 'string')
                                  newExercises[idx] = {
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
                                newExercises[idx].sets[sidx].reps = val;
                                return { ...prev, exercises: newExercises };
                              });
                            }}
                            sx={{ width: 80 }}
                          />
                          <TextField
                            label='Peso (kg)'
                            type='number'
                            size='small'
                            value={set.weight}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const newExercises = [...prev.exercises];
                                if (typeof newExercises[idx] === 'string')
                                  newExercises[idx] = {
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
                                newExercises[idx].sets[sidx].weight = val;
                                return { ...prev, exercises: newExercises };
                              });
                            }}
                            sx={{ width: 100 }}
                          />
                          <TextField
                            label='Duración (seg)'
                            type='number'
                            size='small'
                            value={set.duration}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const newExercises = [...prev.exercises];
                                if (typeof newExercises[idx] === 'string')
                                  newExercises[idx] = {
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
                                newExercises[idx].sets[sidx].duration = val;
                                return { ...prev, exercises: newExercises };
                              });
                            }}
                            sx={{ width: 120 }}
                          />
                          <TextField
                            label='Descanso (seg)'
                            type='number'
                            size='small'
                            value={set.rest}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => {
                                const newExercises = [...prev.exercises];
                                if (typeof newExercises[idx] === 'string')
                                  newExercises[idx] = {
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
                                newExercises[idx].sets[sidx].rest = val;
                                return { ...prev, exercises: newExercises };
                              });
                            }}
                            sx={{ width: 120 }}
                          />
                          <Button
                            size='small'
                            color='error'
                            onClick={() => {
                              setFormData((prev) => {
                                const newExercises = [...prev.exercises];
                                if (typeof newExercises[idx] === 'string')
                                  newExercises[idx] = {
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
                          >
                            Eliminar
                          </Button>
                          <Button
                            size='small'
                            color='info'
                            onClick={() => {
                              setFormData((prev) => {
                                const newExercises = [...prev.exercises];
                                if (typeof newExercises[idx] === 'string')
                                  newExercises[idx] = {
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
                                // Duplicar el set
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
                            sx={{ ml: 1 }}
                          >
                            Duplicar
                          </Button>
                        </Box>
                      ))}
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => {
                          setFormData((prev) => {
                            const newExercises = [...prev.exercises];
                            if (typeof newExercises[idx] === 'string')
                              newExercises[idx] = {
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
                            newExercises[idx].sets.push({
                              reps: '',
                              weight: '',
                              duration: '',
                              rest: '',
                            });
                            return { ...prev, exercises: newExercises };
                          });
                        }}
                        sx={{ mt: 1 }}
                      >
                        Agregar set
                      </Button>
                    </Box>
                  );
                })}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant='contained'
          >
            {selectedRoutine ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para ver ejercicios */}
      <ExercisesDialog />

      {/* Modal para crear nuevo ejercicio */}
      <Dialog
        open={openNewExerciseDialog}
        onClose={() => setOpenNewExerciseDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Nuevo Ejercicio</DialogTitle>
        <DialogContent>
          <TextField
            label='Nombre'
            fullWidth
            value={newExerciseData.name}
            onChange={(e) =>
              setNewExerciseData({ ...newExerciseData, name: e.target.value })
            }
            required
            sx={{ mb: 2 }}
          />
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
            rows={2}
            sx={{ mb: 2 }}
          />
          <FormControl
            fullWidth
            sx={{ mb: 2 }}
          >
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
          <FormControl
            fullWidth
            sx={{ mb: 2 }}
          >
            <InputLabel>Equipo</InputLabel>
            <Select
              multiple
              value={newExerciseData.equipment}
              onChange={(e) =>
                setNewExerciseData({
                  ...newExerciseData,
                  equipment: e.target.value,
                })
              }
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
          <FormControl
            fullWidth
            sx={{ mb: 2 }}
          >
            <InputLabel>Dificultad</InputLabel>
            <Select
              value={newExerciseData.difficulty}
              onChange={(e) =>
                setNewExerciseData({
                  ...newExerciseData,
                  difficulty: e.target.value,
                })
              }
            >
              <MenuItem value='beginner'>Principiante</MenuItem>
              <MenuItem value='intermediate'>Intermedio</MenuItem>
              <MenuItem value='advanced'>Avanzado</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label='Instrucciones (separadas por coma)'
            fullWidth
            value={newExerciseData.instructions.join(', ')}
            onChange={(e) =>
              setNewExerciseData({
                ...newExerciseData,
                instructions: e.target.value.split(',').map((i) => i.trim()),
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label='Tips (separados por coma)'
            fullWidth
            value={newExerciseData.tips.join(', ')}
            onChange={(e) =>
              setNewExerciseData({
                ...newExerciseData,
                tips: e.target.value.split(',').map((i) => i.trim()),
              })
            }
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewExerciseDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateNewExercise}
            variant='contained'
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;

