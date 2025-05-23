import React, { useContext, useMemo } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { AuthContext } from '../servicios/AuthContext';

import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Si lo usas aquí también

const Perfil = () => {
  const { router, commonFunctions } = useContext(ConfigContext);
  const { navigate } = router;
  const { formatCurrency } = commonFunctions;
  const { user } = useContext(AuthContext);
  const nombreCompleto = useMemo(() => `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim(), [user]);
  const email = user?.email ?? 'N/A';
  const dni = user?.dni ?? 'N/A';
  const roles = useMemo(() => user?.roles?.map(rol => rol.nombre).join(', ') ?? 'Ninguno', [user]);
  const cuentaPrincipal = useMemo(() => user?.cuentas?.[0], [user]);
  const esAdmin = useMemo(() => user?.roles?.some(rol => rol.nombre === 'Administrador') ?? false, [user]);

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
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}> {nombreCompleto} </Typography>
            <Typography variant="subtitle2" color="text.secondary" component="span" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
              {roles}
            </Typography>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/home')}
            >
              Volver
            </Button>
          </Grid>
        </Grid>

        <Paper elevation={2} sx={{ padding: 3, mt: 3, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', pb: 1 }}>
            Información Personal
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="DNI" secondary={dni} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText primary="Email" secondary={email} />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', pb: 1, mt: 3 }}>
            Datos de la Cuenta
          </Typography>
          {cuentaPrincipal ? (
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CreditCardIcon />
                </ListItemIcon>
                <ListItemText primary="Número de Cuenta" secondary={cuentaPrincipal.numero} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachMoneyIcon />
                </ListItemIcon>
                <ListItemText primary="Saldo Actual" secondary={formatCurrency(cuentaPrincipal.saldo)} />
              </ListItem>
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              No se encontró información de cuenta.
            </Typography>
          )}
        </Paper>
      </Paper>
    </Box>
  );
};

export default Perfil;