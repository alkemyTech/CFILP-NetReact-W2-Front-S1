import React, { useMemo } from 'react';
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

const Administrar = ({ user }) => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    if (!user) return null;

    const roles = useMemo(() => user?.roles ?? [], [user]);
    const esAdmin = useMemo(() => roles.includes('Administrador'), [roles]);
    const nombreCompleto = useMemo(
        () => `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim(),
        [user]
    );
    const email = user?.email ?? 'Correo no disponible';

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

    if (!esAdmin) {
        enqueueSnackbar('Acceso denegado: autoridad insuficiente', { variant: 'error' });
        navigate('/home');
        return null;
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
                                {roles.length > 0 ? roles.join(', ') : 'Sin roles'}
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
