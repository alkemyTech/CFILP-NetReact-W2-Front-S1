import React, { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import SavingsIcon from '@mui/icons-material/Savings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
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
import { formatearARS } from '../utils/format';
import { logout } from '../servicios/authService';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  if (!user) return null;

  const roles = useMemo(() => user?.roles ?? [], [user]);
  const cuentas = useMemo(() => user?.cuentas ?? [], [user]);
  const esAdmin = useMemo(() => roles.includes('Administrador'), [roles]);
  const nombreCompleto = useMemo(
    () => `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim(),
    [user]
  );
  const email = user?.email ?? 'Correo no disponible';
  const saldo = useMemo(() => cuentas[0]?.saldo ?? 0, [cuentas]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTransferencia = () => {
    navigate('/transferencia', { state: { idTipo: 2 } });
  };

  const handleDeposito = () => {
    navigate('/deposito', { state: { idTipo: 1 } });
  };

  const handleAdmin = () => {
    if (esAdmin) {
      navigate('/administrar');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: 'auto' }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
            <Grid>
              <Avatar sx={{ width: 56, height: 56 }}>
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <Typography variant="h5">{nombreCompleto}</Typography>
              <Typography variant="subtitle1" color="text.secondary">{email}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {roles.length > 0 ? roles.join(', ') : 'Sin roles'}
              </Typography>
            </Grid>
            <Grid>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
              >
                Cerrar sesión
              </Button>
            </Grid>
          </Grid>

          <Paper
            elevation={2}
            sx={{ padding: 3, marginBottom: 3, backgroundColor: '#f5f5f5' }}
          >
            <Typography variant="h6" gutterBottom>Saldo actual</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatearARS(saldo)}
            </Typography>
          </Paper>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }}
            gap={2}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<TransferWithinAStationIcon />}
              onClick={handleTransferencia}
              sx={{ height: '100px' }}
              aria-label="Transferencia"
            >
              Transferir
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SavingsIcon />}
              onClick={handleDeposito}
              sx={{ height: '100px' }}
              aria-label="Inversión"
            >
              Invertir
            </Button>
            {esAdmin && (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AdminPanelSettingsIcon />}
                onClick={handleAdmin}
                sx={{ height: '100px' }}
                aria-label="Panel de administración"
              >
                Administrar
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Home;