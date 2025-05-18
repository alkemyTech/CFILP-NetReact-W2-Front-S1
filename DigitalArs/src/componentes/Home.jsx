import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../servicios/authService';
import { Button, Typography, Paper, Box, Grid, Avatar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const Home = ({ usuario: propUsuario, saldo: saldo }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTransferencia = () => {
    navigate('/transferencia');
  };

  const handleDeposito = () => {
    navigate('/deposito');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: 'auto' }}>
          {/* Encabezado con info del usuario */}
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
            <Grid item>
              <Avatar sx={{ width: 56, height: 56 }}>
                {propUsuario?.nombre?.charAt(0) || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">{propUsuario?.nombre || 'Usuario'}</Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {propUsuario?.email}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                {propUsuario?.rol}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </Grid>
          </Grid>

          {/* Saldo */}
          <Paper elevation={2} sx={{ padding: 3, marginBottom: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              Saldo actual
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ${saldo}
            </Typography>
          </Paper>

          {/* Acciones */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleTransferencia}
                sx={{ height: '100px' }}
              >
                Transferencia
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
                Depósito
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Home;