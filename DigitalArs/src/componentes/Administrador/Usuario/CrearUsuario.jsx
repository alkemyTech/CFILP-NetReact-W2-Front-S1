import React, { useMemo, useContext, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../utils/theme';
import { AuthContext } from '../../../servicios/AuthContext';

const CrearUsuario = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    roles: [], // Para almacenar los IDs de los roles seleccionados
  });
  const { user } = useContext(AuthContext);
  const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
  const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const titulo = "Crear Usuario";

  useEffect(() => {
    // Cargar roles disponibles al montar el componente
    const fetchRoles = async () => {
      try {
        const response = await axios.get('https://localhost:7097/Rol');
        setRolesDisponibles(response.data || []);
      } catch (err) {
        console.error("Error al cargar roles:", err);
        setError("Error al cargar los roles disponibles.");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores de validación para el campo modificado
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRolesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      roles: e.target.value // Material-UI Select con multiple maneja el array automáticamente
    }));
    if (validationErrors.roles) {
      setValidationErrors(prev => ({ ...prev, roles: '' }));
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.dni) errors.dni = 'El DNI es obligatorio.';
    else if (!/^\d+$/.test(formData.dni)) errors.dni = 'El DNI debe contener solo números.';
    if (!formData.nombre) errors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido) errors.apellido = 'El apellido es obligatorio.';
    if (!formData.email) errors.email = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'El email no es válido.';
    if (!formData.password) errors.password = 'La contraseña es obligatoria.';
    else if (formData.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (formData.roles.length === 0) errors.roles = 'Debe seleccionar al menos un rol.';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    setValidationErrors({}); // Limpiar errores de validación previos

    if (!validateForm()) {
      return;
    }

    try {
      const rolesSeleccionados = formData.roles.map(idSeleccionado => {
        const rolCompleto = rolesDisponibles.find(role => role.id === idSeleccionado);
        return {
          id: idSeleccionado,
          nombre: rolCompleto ? rolCompleto.nombre : 'Desconocido'
        };
      });

      const payload = {
        dni: parseInt(formData.dni),
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        roles: rolesSeleccionados
      };

      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        setMensaje("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
        navigate('/');
        return;
      }
      await axios.post('https://localhost:7097/Usuario', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Usuario creado exitosamente!');
      navigate('/usuarios');
    } catch (err) {
      console.error("Error al crear usuario:", err.response?.data || err.message);
      setError(`Error al crear el usuario: ${err.response?.data || 'Verifica la conexión o los datos ingresados.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            maxWidth: 800,
            margin: 'auto',
            border: '1.5px solid #1976d2',
            backgroundColor: esAdmin ? '#FFD89B' : '#ffffff',
          }}
        >
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
            <Grid sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: esAdmin ? 'error.main' : 'primary.main',
                }}>
                {titulo.charAt(0).toUpperCase() || 'CU'}
              </Avatar>
            </Grid>
            <Grid gridColumn="span 11">
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {titulo}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Ingresa los datos para el nuevo usuario
              </Typography>
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }} columns={12}>
              {/* Fila 1: DNI y Rol */}
              <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
                <TextField
                  fullWidth
                  label="DNI"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  error={!!validationErrors.dni}
                  helperText={validationErrors.dni}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  autoComplete="dni"
                />
              </Grid>
              <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
                <FormControl fullWidth error={!!validationErrors.roles}>
                  <InputLabel id="roles-label">Roles</InputLabel>
                  <Select
                    labelId="roles-label"
                    id="roles-select"
                    multiple
                    name="roles"
                    value={formData.roles}
                    onChange={handleRolesChange}
                    label="Roles"
                    renderValue={(selected) => selected.map(id => rolesDisponibles.find(role => role.id === id)?.nombre).join(', ')}
                  >
                    {rolesDisponibles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.roles && <FormHelperText>{validationErrors.roles}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }} columns={12}>
              {/* Fila 2: Nombre y Apellido */}
              <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!validationErrors.nombre}
                  helperText={validationErrors.nombre}
                  autoComplete="nombre"
                />
              </Grid>
              <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  error={!!validationErrors.apellido}
                  helperText={validationErrors.apellido}
                  autoComplete="apellido"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }} columns={12}>
              {/* Fila 3: Email y Contraseña */}
              <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  autoComplete="email"
                />
              </Grid>
              <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  autoComplete="current-password"
                />
              </Grid>
            </Grid>
            {/* Botones de acción */}
            <Grid container spacing={2}>
              <Grid
                sx={{
                  width: { xs: '100%', sm: 'calc(50% - 8px)' },
                  backgroundColor: "#f5f5f5",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',   // Redondeo para consistencia
                }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => navigate("/usuarios")}
                  sx={{
                    border: '1px solid #d32f2f',
                    borderRadius: '8px',
                    height: '100%',
                    textTransform: 'none',
                  }}
                >
                  Cancelar
                </Button>
              </Grid>
              <Grid sx={{
                width: { xs: '100%', sm: 'calc(50% - 8px)' },
                backgroundColor: "#f5f5f5",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar Usuario'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box >
    </ThemeProvider >
  );
};

export default CrearUsuario;