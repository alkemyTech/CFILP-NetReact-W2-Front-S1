import React, { useMemo, useContext, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import SavingsIcon from '@mui/icons-material/Savings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { ConfigContext } from '../config/ConfigContext';
import { logout } from '../servicios/AuthService';
import { AuthContext } from '../servicios/AuthContext';

const Home = () => {
  const { MuiComponents, router, commonFunctions } = useContext(ConfigContext);
  const {
    Button,
    Typography,
    Paper,
    Box,
    Grid,
    Avatar,
  } = MuiComponents;
  const { navigate } = router;
  const { formatCurrency } = commonFunctions;
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { user, setUser, refetchUser } = useContext(AuthContext);
  const cuentas = useMemo(() => user?.cuentas ?? [], [user]);
  const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
  const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);
  const nombreCompleto = useMemo(() => `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim(), [user]);
  const email = user?.email ?? 'Correo no disponible';
  const saldo = useMemo(() => cuentas[0]?.saldo ?? 0, [cuentas]);

  useEffect(() => {
    if (location.state?.refreshUser) {
      navigate(location.pathname, { replace: true, state: {} });
      refetchUser();
    }
  }, [location.state, refetchUser, navigate, location.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const handleTransferencia = () => {
    navigate('/transferencia', { state: { idTipo: 3 } });
  };

  const handlePlazoFijo = () => {
    navigate('/inversion', { state: { idTipo: 2 } });
  };

  const handleDeposito = () => {
    navigate('/deposito', { state: { idTipo: 1 } });
  };

  const handleAdmin = () => {
    if (esAdmin) {
      navigate('/administrar');
    }
  };

  if (!user) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 5 }}>
        Cargando datos de usuario...
      </Typography>
    );
  }

  return (
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
                onClick={() => navigate('/Perfil')}
                aria-label="Perfil"
              >
                Perfil
              </Button>
          </Box>
        </Grid>
        <Paper
          elevation={2}
          sx={{ padding: 3, marginBottom: 3, backgroundColor: '#f5f5f5' }}
        >
          <Typography variant="h6" gutterBottom>Saldo actual</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {formatCurrency(saldo)}
          </Typography>
        </Paper>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', sm: `repeat(${esAdmin ? 4 : 3}, 1fr)` }}
          gap={2}
        >
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AccountBalanceIcon />}
            onClick={handleDeposito}
            sx={{ height: '100px' }}
            aria-label="Depósito"
          >
            Ingresar
          </Button>
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
            onClick={handlePlazoFijo}
            sx={{ height: '100px' }}
            aria-label="Inversión"
          >
            Invertir
          </Button>
          {esAdmin && (
            <Button
              fullWidth
              variant="contained"
              color="warning"
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
  );
};

export default Home;