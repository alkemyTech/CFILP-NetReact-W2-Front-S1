import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom'; // Importa useParams
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../utils/theme';

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { dni } = useParams(); // Obtiene el DNI del usuario desde la URL
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '', // Puede que no quieras cargar la contraseña real para edición
    roles: [], // Para almacenar los IDs de los roles seleccionados
  });
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true); // Inicia en true para cargar datos
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Efecto para cargar roles disponibles y los datos del usuario a editar
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Cargar roles disponibles
        const rolesResponse = await axios.get('https://localhost:7097/Rol');
        setRolesDisponibles(rolesResponse.data || []);

        // 2. Cargar datos del usuario a editar
        if (dni) { // Solo si hay un DNI en los parámetros
          const token = localStorage.getItem('token');
          if (!token) {
            setError("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
            setLoading(false);
            navigate('/');
            return;
          }
          const userResponse = await axios.get(`https://localhost:7097/Usuario/${dni}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const userData = userResponse.data;

          // Asignar los datos del usuario al formData
          setFormData({
            dni: userData.dni || '',
            nombre: userData.nombre || '',
            apellido: userData.apellido || '',
            email: userData.email || '',
            password: '', // Nunca cargues la contraseña real por seguridad.
                         // El usuario deberá ingresarla si quiere cambiarla.
            roles: userData.roles?.map(rol => rol.id) || [], // Extraer solo los IDs de los roles
          });
        }
      } catch (err) {
        console.error("Error al cargar datos:", err.response?.data || err.message);
        setError(`Error al cargar los datos: ${err.response?.data || 'Verifica la conexión.'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dni, navigate]); // Dependencias: dni para recargar si cambia, navigate para la redirección

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    // La contraseña es opcional al editar, solo si se cambia.
    // Si se deja vacío, no la envíes para no sobrescribir la hasheada con una cadena vacía.
    // Aquí puedes decidir si quieres que sea obligatoria si la editan.
    // if (!formData.password) errors.password = 'La contraseña es obligatoria.';
    if (formData.password && formData.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres si se va a cambiar.';
    if (formData.roles.length === 0) errors.roles = 'Debe seleccionar al menos un rol.';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
      navigate('/');
      return;
    }

    try {
      const rolesParaEnviar = formData.roles.map(idSeleccionado => {
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
        // Solo incluye la contraseña en el payload si el usuario la ha ingresado/modificado
        ...(formData.password && { password: formData.password }), 
        roles: rolesParaEnviar
      };
      
      console.log("Payload que se enviará para edición:", payload);

      // Usar PUT para actualizar
      await axios.put(`https://localhost:7097/Usuario/${dni}`, payload, { // Usa el DNI de los parámetros
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Usuario actualizado exitosamente!');
      navigate('/usuarios'); // Redirige a la lista de usuarios
    } catch (err) {
      console.error("Error al actualizar usuario:", err.response?.data || err.message);
      setError(`Error al actualizar el usuario: ${JSON.stringify(err.response?.data || 'Verifica la conexión o los datos ingresados.')}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && dni) { // Muestra CircularProgress solo mientras carga el usuario existente
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando usuario...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 600, margin: "auto" }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }} columns={12}>
            <Grid gridColumn="span 1">
              <Avatar sx={{ width: 56, height: 56 }}>⚙️</Avatar> {/* Ícono de edición */}
            </Grid>
            <Grid gridColumn="span 11">
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Editar Usuario
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Modifica los datos del usuario existente
              </Typography>
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }} columns={12}>
              {/* Fila 1: DNI y Rol */}
              <Grid gridColumn="span 6" sx={{ width: '100%' }}>
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
                  disabled // El DNI no debería ser editable ya que es la PK
                />
              </Grid>
              <Grid gridColumn="span 6" sx={{ width: '100%' }}>
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
              <Grid gridColumn="span 6" sx={{ width: '100%' }}>
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
              <Grid gridColumn="span 6" sx={{ width: '100%' }}>
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
              <Grid gridColumn="span 6" sx={{ width: '100%' }}>
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
              <Grid gridColumn="span 6" sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Contraseña (dejar vacío para no cambiar)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  autoComplete="new-password" // Sugerir nueva contraseña al navegador
                />
              </Grid>
            </Grid>
            {/* Botones de acción */}
            <Grid container spacing={2} columns={12}>
              <Grid gridColumn="span 6">
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/usuarios')} // Volver a la lista de usuarios
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Grid>
              <Grid gridColumn="span 6">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ float: 'right' }} // Alinea a la derecha
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default EditarUsuario;