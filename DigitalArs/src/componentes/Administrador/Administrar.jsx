import React, { useMemo, useContext, useEffect } from 'react';
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
import { theme } from '../../utils/theme';
import { AuthContext } from '../../servicios/AuthContext'; // Importar AuthContext

const Administrar = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);

  const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
  const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);

  const nombreCompleto = useMemo(
    () => `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim(),
    [user]
  );
  const email = user?.email ?? 'Correo no disponible';

  useEffect(() => {
    if (user === null) {
      return;
    }

    if (user && !esAdmin) {
      enqueueSnackbar('Acceso denegado: autoridad insuficiente', { variant: 'error' });
      navigate('/home');
    }
  }, [user, esAdmin, navigate, enqueueSnackbar]); // Dependencias del useEffect

  const handleLogout = () => {
    localStorage.clear();
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
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <Typography variant="h5">{nombreCompleto}</Typography>
              <Typography variant="subtitle2" color="text.secondary" component="span" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
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