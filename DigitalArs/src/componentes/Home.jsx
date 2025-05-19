import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../servicios/authService';
import {
  Button,
  Typography,
  Paper,
  Box,
  Grid,
  Avatar,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const Home = ({ user }) => {
  const navigate = useNavigate();

  // Normalizar roles y cuentas desde estructura .NET
  const roles = user?.roles?.$values ?? [];
  const cuentas = user?.cuentas?.$values ?? [];

  const esAdmin = roles.includes('Administrador');
  const nombreCompleto = `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim();
  const email = user?.email ?? 'Correo no disponible';
  const saldo = cuentas[0]?.saldo ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTransferencia = () => {
    localStorage.setItem('idTipo', '2');
    navigate('/transferencia');
  };

  const handleDeposito = () => {
    localStorage.setItem('idTipo', '1');
    navigate('/deposito');
  };

  const handlePanel = () => {
    if (esAdmin) {
      navigate('/panelControl');
    } else {
      alert('No disponés de autoridad suficiente');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: 'auto' }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
            <Grid item>
              <Avatar sx={{ width: 56, height: 56 }}>
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">{nombreCompleto}</Typography>
              <Typography variant="subtitle1" color="textSecondary">{email}</Typography>
              <Typography variant="subtitle2" color="textSecondary">
                {roles.length > 0 ? roles.join(', ') : 'Sin roles'}
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </Grid>
          </Grid>

          <Paper elevation={2} sx={{ padding: 3, marginBottom: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>Saldo actual</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ${saldo.toLocaleString('es-AR')}
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleTransferencia}
                sx={{ height: '100px' }}
              >
                Transferir
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleDeposito}
                sx={{ height: '100px' }}
              >
                Invertir
              </Button>
            </Grid>
            {esAdmin && (
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handlePanel}
                  sx={{ height: '100px' }}
                >
                  Administrar
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Home;
