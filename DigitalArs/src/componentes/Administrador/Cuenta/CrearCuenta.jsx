import React, { useMemo, useState, useEffect, useContext } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../servicios/AuthContext';
import { ConfigContext } from '../../../config/ConfigContext';

const CrearCuenta = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { MuiComponents, api, commonFunctions } = useContext(ConfigContext);
    const {
        Box, Paper, Typography, TextField, Button, Grid, Avatar,
        CircularProgress, MenuItem, FormControl, InputLabel, Select
    } = MuiComponents;

    const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
    const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);

    const [formData, setFormData] = useState({
        numero: '',
        dni: '',
        nombreCompletoUsuario: ''
    });
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const titulo = "Nueva Cuenta";

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const token = commonFunctions.getToken();
                if (!token) {
                    alert('No se encontró el token. Por favor inicie sesión.');
                    navigate('/');
                    return;
                }
                const response = await api.get('/Usuario', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const usuariosFiltrados = response.data.filter(user => user.dni > 100);
                setUsuarios(usuariosFiltrados);
            } catch (err) {
                console.error("Error al obtener usuarios:", err.response?.data || err.message);
                setError('Error al cargar la lista de usuarios.');
            }
        };

        fetchUsuarios();
    }, [api, navigate, commonFunctions]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleUsuarioChange = (e) => {
        const selectedDni = e.target.value;
        const selectedUser = usuarios.find(user => user.dni.toString() === selectedDni);

        setFormData(prev => ({
            ...prev,
            dni: selectedDni,
            nombreCompletoUsuario: selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido || ''}`.trim() : ''
        }));

        if (validationErrors.dni) {
            setValidationErrors(prev => ({
                ...prev,
                dni: ''
            }));
        }
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.numero) {
            errors.numero = 'El número de cuenta es obligatorio.';
        } else if (!/^\d+$/.test(formData.numero)) {
            errors.numero = 'Debe contener solo números.';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        if (!validateForm()) return;

        try {
            const dniToSend = formData.dni ? parseInt(formData.dni, 10) : null;

            const payload = {
                numero: parseInt(formData.numero, 10),
                dni: dniToSend,
            };

            const token = commonFunctions.getToken();
            if (!token) {
                alert("No se encontró el token. Inicie sesión nuevamente.");
                navigate('/');
                return;
            }

            setLoading(true);

            await api.post('/Cuenta', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('Cuenta creada exitosamente!');
            navigate('/cuentas');
        } catch (err) {
            console.error("Error al crear cuenta:", err.response?.data || err.message);
            if (err.response && err.response.status === 400 && err.response.data && err.response.data.errors) {
            console.error("Detalles de validación del backend:", err.response.data.errors);
            setValidationErrors(err.response.data.errors);
            setError('Error de validación: Por favor, revisa los campos.');
        } else {
            setError(`Error al crear la cuenta: ${err.response?.data?.title || err.message || 'Verifica los datos o la conexión.'}`);
        }
        } finally {
            setLoading(false);
        }
    };

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
                            }}>{titulo.charAt(0).toUpperCase() || '+'}</Avatar>
                    </Grid>
                    <Grid xs>
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                            {titulo}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Ingrese datos para crear la cuenta
                        </Typography>
                    </Grid>
                </Grid>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid sx={{ width: { xs: '100%', sm: 'calc(33% - 8px)', backgroundColor: "#f5f5f5" } }}>
                            <TextField
                                fullWidth
                                label="Número de Cuenta"
                                name="numero"
                                value={formData.numero}
                                onChange={handleInputChange}
                                error={!!validationErrors.numero}
                                helperText={validationErrors.numero}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                autoComplete="numero"
                            />
                        </Grid>

                        <Grid sx={{ width: { xs: '100%', sm: 'calc(33% - 8px)', backgroundColor: "#f5f5f5" } }}>
                            <FormControl fullWidth error={!!validationErrors.dni}>
                                <InputLabel id="dni-label">Seleccionar DNI (Opcional)</InputLabel>
                                <Select
                                    labelId="dni-label"
                                    name="dni"
                                    value={formData.dni}
                                    label="Seleccionar DNI (Opcional)"
                                    onChange={handleUsuarioChange}
                                >
                                    <MenuItem value="">
                                        <em>Ninguno (Cuenta sin usuario)</em>
                                    </MenuItem>
                                    {usuarios.map((usuario) => (
                                        <MenuItem key={usuario.dni} value={usuario.dni.toString()}>
                                            {usuario.dni}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {validationErrors.dni && (
                                    <Typography color="error" variant="caption">{validationErrors.dni}</Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid sx={{ width: { xs: '100%', sm: 'calc(33% - 8px)', backgroundColor: "#f5f5f5" } }}>
                            <TextField
                                fullWidth
                                label="Nombre del Usuario"
                                name="nombreCompletoUsuario"
                                value={formData.nombreCompletoUsuario}
                                InputProps={{ readOnly: true }}
                                autoComplete="off"
                                disabled={!formData.dni}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                fullWidth
                            >
                                Cancelar
                            </Button>
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#0f80cc" } }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                disabled={loading}
                                fullWidth
                            >
                                {loading ? <CircularProgress size={24} /> : 'Guardar Cuenta'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default CrearCuenta;