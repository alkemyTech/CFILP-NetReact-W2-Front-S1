import React, { useState, useEffect, useMemo, useContext } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../servicios/AuthContext';
import { ConfigContext } from '../../../config/ConfigContext';

const EditarCuenta = () => {
    const { numero } = useParams();
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
        id: '',
        numero: '',
        dni: '',
        nombreCompleto: ''
    });

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const titulo = "Editar Cuenta";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const token = commonFunctions.getToken();
                if (!token) {
                    alert('No se encontró el token. Por favor inicie sesión.');
                    navigate('/');
                    return;
                }

                const responseUsuarios = await api.get('/Usuario', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const usuariosFiltrados = responseUsuarios.data.filter(u => u.dni > 100);
                setUsuarios(usuariosFiltrados);

                const responseCuenta = await api.get(`/Cuenta/${numero}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const cuenta = responseCuenta.data;

                const usuarioAsociado = usuariosFiltrados.find(u => u.dni === cuenta.dni);

                setFormData({
                    id: cuenta.id || '',
                    numero: cuenta.numero.toString(),
                    dni: cuenta.dni ? cuenta.dni.toString() : '',
                    nombreCompleto: usuarioAsociado
                        ? `${usuarioAsociado.nombre} ${usuarioAsociado.apellido || ''}`
                        : ''
                });

            } catch (err) {
                console.error("Error al cargar datos:", err.response?.data || err.message);
                setError('Error al cargar los datos de la cuenta o usuarios.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [numero, api, navigate, commonFunctions]);

    const handleUsuarioChange = (e) => {
        const selectedDni = e.target.value;
        const selectedUser = usuarios.find(user => user.dni.toString() === selectedDni);

        setFormData(prev => ({
            ...prev,
            dni: selectedDni,
            nombreCompleto: selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido || ''}` : ''
        }));

        if (validationErrors.dni) {
            setValidationErrors(prev => ({ ...prev, dni: '' }));
        }
    };

    const validateForm = () => {
        let errors = {};
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        if (!validateForm()) return;

        try {
            const token = commonFunctions.getToken();
            if (!token) {
                alert("No se encontró el token. Inicie sesión nuevamente.");
                navigate('/');
                return;
            }

            setSaving(true);

            const payload = {
                id: formData.id,
                numero: parseInt(formData.numero, 10),
                dni: formData.dni ? parseInt(formData.dni, 10) : null
            };

            await api.put(`/Cuenta/${numero}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Cuenta actualizada correctamente!');
            navigate('/cuentas');
        } catch (err) {
            console.error("Error al actualizar cuenta:", err.response?.data || err.message);
            if (err.response && err.response.status === 400 && err.response.data && err.response.data.errors) {
                setValidationErrors(err.response.data.errors);
                setError('Error de validación: Por favor, revisa los campos.');
            } else {
                setError(`Error al actualizar la cuenta: ${err.response?.data?.title || err.message || 'Verifica los datos o la conexión.'}`);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Paper
                elevation={3}
                sx={{
                    padding: 3,
                    maxWidth: 500,
                    margin: 'auto',
                    border: '1.5px solid #1976d2',
                    backgroundColor: esAdmin ? '#FFD89B' : '#ffffff',
                }}
            >
                <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
                    <Grid item>
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: esAdmin ? 'error.main' : 'primary.main',
                            }}>{titulo.charAt(0).toUpperCase() || '+'}</Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                            {titulo}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Modifique los datos de la cuenta
                        </Typography>
                    </Grid>
                </Grid>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container direction="column" spacing={3}>

                        {/* Número de cuenta (solo lectura) */}
                        <Grid item>
                            <TextField
                                fullWidth
                                label="Número de Cuenta"
                                name="numero"
                                value={formData.numero}
                                InputProps={{ readOnly: true }}
                                disabled
                                sx={{ backgroundColor: '#f0f0f0' }}
                            />
                        </Grid>

                        {/* Selección de DNI */}
                        <Grid item>
                            <FormControl fullWidth error={!!validationErrors.dni}>
                                <InputLabel id="dni-label">Seleccionar DNI (Opcional)</InputLabel>
                                <Select
                                    labelId="dni-label"
                                    name="dni"
                                    value={formData.dni}
                                    label="Seleccionar DNI (Opcional)"
                                    onChange={handleUsuarioChange}
                                    sx={{ backgroundColor: '#fff' }}
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
                                    <Typography variant="caption" color="error">{validationErrors.dni}</Typography>
                                )}
                            </FormControl>
                        </Grid>

                        {/* Nombre completo del usuario asociado (solo lectura) */}
                        <Grid item>
                            <TextField
                                fullWidth
                                label="Nombre Completo"
                                value={formData.nombreCompleto}
                                InputProps={{ readOnly: true }}
                                disabled
                                sx={{ backgroundColor: '#f5f5f5' }}
                            />
                        </Grid>

                        {/* Botones */}
                        <Grid item sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                color="primary"
                                variant="outlined"
                                onClick={() => navigate('/cuentas')}
                                startIcon={<ArrowBackIcon />}
                                disabled={saving}
                            >
                                Volver
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default EditarCuenta;
