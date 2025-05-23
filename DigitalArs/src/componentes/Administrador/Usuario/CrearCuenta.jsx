import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Avatar,
    CircularProgress,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../utils/theme';

const CrearCuenta = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        numero: '',
        dni: '',
        usuarioId: ''
    });
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://localhost:7097/Usuario', {
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
    }, []);

    // Handler para campos de texto (como número de cuenta)
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

    // Handler exclusivo para el Select de usuario
    const handleUsuarioChange = (e) => {
        const selectedDni = e.target.value;
        setFormData(prev => ({
            ...prev,
            usuarioId: selectedDni,
            dni: selectedDni
        }));

        if (validationErrors.usuarioId || validationErrors.dni) {
            setValidationErrors(prev => ({
                ...prev,
                usuarioId: '',
                dni: ''
            }));
        }
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.numero) errors.numero = 'El número de cuenta es obligatorio.';
        else if (!/^\d+$/.test(formData.numero)) errors.numero = 'Debe contener solo números.';
        if (!formData.dni) errors.dni = 'El DNI es obligatorio.';
        else if (!/^\d+$/.test(formData.dni)) errors.dni = 'Debe contener solo números.';
        if (!formData.usuarioId) errors.usuarioId = 'Debe seleccionar un usuario.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        if (!validateForm()) return;

        try {
            const payload = {
                numero: parseInt(formData.numero, 10),
                dni: parseInt(formData.dni, 10),
                usuarioId: parseInt(formData.usuarioId, 10)
            };

            const token = localStorage.getItem('token');
            if (!token) {
                alert("No se encontró el token. Inicie sesión nuevamente.");
                navigate('/');
                return;
            }

            setLoading(true);

            await axios.post('https://localhost:7097/Cuenta', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('Cuenta creada exitosamente!');
            navigate('/cuentas');
        } catch (err) {
            console.error("Error al crear cuenta:", err.response?.data || err.message);
            setError(`Error al crear la cuenta: ${err.response?.data || 'Verifica los datos o la conexión.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ padding: 3 }}>
                <Paper elevation={3} sx={{ padding: 3, maxWidth: 600, margin: "auto" }}>
                    <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
                        <Grid item>
                            <Avatar sx={{ width: 56, height: 56 }}>+</Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                Crear Nueva Cuenta
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Ingresa los datos de la nueva cuenta
                            </Typography>
                        </Grid>
                    </Grid>

                    {error && (
                        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2} direction="column">
                            <Grid item>
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
                            <Grid item>
                                <TextField
                                    fullWidth
                                    label="DNI"
                                    name="dni"
                                    value={formData.dni}
                                    inputProps={{ readOnly: true }}
                                    error={!!validationErrors.dni}
                                    helperText={validationErrors.dni}
                                    autoComplete="dni"
                                />
                            </Grid>
                            <Grid item>
                                <FormControl fullWidth error={!!validationErrors.usuarioId}>
                                    <InputLabel id="usuarioId-label">Seleccionar Usuario</InputLabel>
                                    <Select
                                        labelId="usuarioId-label"
                                        name="usuarioId"
                                        value={formData.usuarioId}
                                        label="Seleccionar Usuario (DNI > 100)"
                                        onChange={handleUsuarioChange}
                                    >
                                        {usuarios.map((usuario) => {
                                            const nombreCompleto = usuario.nombre + (usuario.apellido ? ` ${usuario.apellido}` : '');
                                            return (
                                                <MenuItem key={usuario.dni} value={usuario.dni.toString()}>
                                                    {nombreCompleto} - DNI: {usuario.dni}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                    {validationErrors.usuarioId && (
                                        <Typography color="error" variant="caption">{validationErrors.usuarioId}</Typography>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
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
                                    <Grid item xs={6}>
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
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default CrearCuenta;
