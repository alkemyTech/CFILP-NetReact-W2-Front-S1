// componentes/Administrar.jsx
import React, { useMemo, useContext, useEffect } from 'react'; // Importar useContext y useEffect
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {
  Button,
  Typography,
  Paper,
  Box,
  Grid,
  Avatar,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../utils/theme';
import { AuthContext } from '../servicios/AuthContext'; // Importar AuthContext

const Administrar = () => { // Eliminar '{ user }' de aquí
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext); // Obtener 'user' del contexto

  // Asegúrate de que el usuario y los roles estén cargados antes de continuar
  const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
  const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);
  
  const nombreCompleto = useMemo(
    () => `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim(),
    [user]
  );
  const email = user?.email ?? 'Correo no disponible';

  // Efecto para manejar la redirección si el usuario no es admin o no está cargado
  useEffect(() => {
    // Si el usuario aún no se ha cargado (user es null)
    if (user === null) {
      // Podrías mostrar un spinner o un mensaje de carga.
      // Si el AuthContext maneja la carga inicial, esto no debería ser un problema prolongado.
      return; 
    }

    // Si el usuario está cargado pero no es administrador
    if (user && !esAdmin) {
      enqueueSnackbar('Acceso denegado: autoridad insuficiente', { variant: 'error' });
      navigate('/home');
    }
  }, [user, esAdmin, navigate, enqueueSnackbar]); // Dependencias del useEffect

  const handleLogout = () => {
    // Es mejor usar la función logout del servicio que limpia todo correctamente
    // Aquí podrías necesitar traer `setUser` del contexto si quieres limpiar el estado local
    // const { setUser } = useContext(AuthContext);
    // logout();
    // setUser(null);
    // navigate('/');
    // Ya que AuthContext maneja el logout global, y esto es solo un botón
    // del componente, no hace falta que `Administrar` se preocupe de la lógica de `setUser`.
    // Simplemente redirecciona al login.
    localStorage.clear(); // O usar la función logout del servicio.
    navigate('/');
  };

  const handleUsuarios = () => {
    navigate('/usuarios');
  };

  const handleCuentas = () => {
    navigate('/cuentas');
  };

  const handleTransacciones = () => {
    navigate('/transacciones');
  };

  // Mostrar un mensaje de carga mientras el usuario se carga o se verifica su rol
  if (!user || (user && !esAdmin)) {
      return (
          <Typography variant="h6" align="center" sx={{ mt: 5 }}>
              {!user ? 'Cargando datos de usuario o verificando permisos...' : 'Redirigiendo: Acceso denegado.'}
          </Typography>
      );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: 'auto' }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
            <Grid sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 56, height: 56 }}>
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <Typography variant="h5">{nombreCompleto}</Typography>
              <Typography variant="subtitle1" color="text.secondary">{email}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {roleNames.length > 0 ? roleNames.join(', ') : 'Sin roles'}
              </Typography>
            </Grid>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
              >
                Cerrar sesión
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/home')}
                aria-label="Volver al Home"
              >
                Volver al Home
              </Button>
            </Box>
          </Grid>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }}
            gap={2}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PeopleIcon />}
              onClick={handleUsuarios}
              sx={{ height: '100px' }}
              aria-label="Usuarios"
            >
              Usuarios
            </Button>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<AccountBalanceIcon />}
              onClick={handleCuentas}
              sx={{ height: '100px' }}
              aria-label="Cuentas"
            >
              Cuentas
            </Button>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ReceiptIcon />}
              onClick={handleTransacciones}
              sx={{ height: '100px' }}
              aria-label="Transacciones"
            >
              Transacciones
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Administrar;