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
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../utils/theme';

const EditarCuenta = () => {
    const navigate = useNavigate();
    const { id } = useParams();
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
        const fetchDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('No se encontró el token. Por favor inicie sesión.');
                    navigate('/');
                    return;
                }

                const cuentaRes = await axios.get(`https://localhost:7097/Cuenta/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const usuariosRes = await axios.get('https://localhost:7097/Usuario', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const usuariosFiltrados = usuariosRes.data.filter(user => user.dni > 100);

                setFormData({
                    numero: cuentaRes.data.numero,
                    dni: cuentaRes.data.dni,
                    usuarioId: cuentaRes.data.usuarioId || ''
                });

                setUsuarios(usuariosFiltrados);
            } catch (err) {
                console.error("Error al cargar datos:", err.response?.data || err.message);
                setError('Error al cargar datos de la cuenta o usuarios.');
            }
        };

        fetchDatos();
    }, [id, navigate]);

    const handleUsuarioChange = (e) => {
        const selectedDni = e.target.value;
        setFormData(prev => ({
            ...prev,
            usuarioId: selectedDni,
            dni: selectedDni // opcional: si querés que se sincronice con el usuario
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

            await axios.put(`https://localhost:7097/Cuenta/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('Cuenta actualizada exitosamente!');
            navigate('/cuentas');
        } catch (err) {
            console.error("Error al actualizar cuenta:", err.response?.data || err.message);
            setError(`Error al actualizar la cuenta: ${err.response?.data || 'Verifica los datos o la conexión.'}`);
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
                            <Avatar sx={{ width: 56, height: 56 }}>✎</Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                Editar Cuenta
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Modifica el usuario asociado
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
                                    inputProps={{ readOnly: true }}
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
                                    autoComplete="dni"
                                />
                            </Grid>

                            <Grid item>
                                <FormControl fullWidth error={!!validationErrors.usuarioId}>
                                    <InputLabel id="usuarioId-label">Seleccionar Usuario</InputLabel>
                                    <Select
                                        labelId="usuarioId-label"
                                        name="usuarioId"
                                        value={formData.usuarioId || ''}
                                        label="Seleccionar Usuario"
                                        onChange={handleUsuarioChange}
                                    >
                                        <MenuItem value="">
                                            <em>Seleccionar Usuario</em>
                                        </MenuItem>
                                        {usuarios.map((usuario) => (
                                            <MenuItem key={usuario.dni} value={usuario.dni}>
                                                {usuario.nombre} {usuario.apellido ? ` ${usuario.apellido}` : ''} - DNI: {usuario.dni}
                                            </MenuItem>
                                        ))}
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
                                            {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
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

export default EditarCuenta;
