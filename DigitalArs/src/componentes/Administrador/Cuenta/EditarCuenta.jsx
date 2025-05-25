import React, { useMemo, useState, useEffect, useContext } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../servicios/AuthContext';
import { ConfigContext } from '../../../config/ConfigContext';

const EditarCuenta = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // ID de la cuenta a editar
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const titulo = "Editar Cuenta";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = commonFunctions.getToken();
                if (!token) {
                    alert('No se encontró el token. Por favor inicie sesión.');
                    navigate('/');
                    return;
                }

                // Obtener usuarios
                const usuariosResponse = await api.get('/Usuario', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const filtrados = usuariosResponse.data.filter(user => user.dni > 100);
                setUsuarios(filtrados);

                // Obtener cuenta actual
                const cuentaResponse = await api.get(`/Cuenta/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const cuenta = cuentaResponse.data;

                const usuarioSeleccionado = filtrados.find(u => u.dni === cuenta.dni);
                setFormData({
                    numero: cuenta.numero.toString(),
                    dni: cuenta.dni?.toString() || '',
                    nombreCompletoUsuario: usuarioSeleccionado
                        ? `${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido || ''}`.trim()
                        : ''
                });
            } catch (err) {
                console.error("Error al cargar datos:", err.response?.data || err.message);
                setError('Error al cargar datos para edición.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, id, navigate, commonFunctions]);

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
            const token = commonFunctions.getToken();
            if (!token) {
                alert("No se encontró el token. Inicie sesión nuevamente.");
                navigate('/');
                return;
            }

            const payload = {
                numero: parseInt(formData.numero, 10),
                dni: formData.dni ? parseInt(formData.dni, 10) : null
            };

            setLoading(true);

            await api.put(`/Cuenta/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('Cuenta actualizada exitosamente!');
            navigate('/cuentas');
        } catch (err) {
            console.error("Error al editar cuenta:", err.response?.data || err.message);
            if (err.response?.status === 400 && err.response.data?.errors) {
                setValidationErrors(err.response.data.errors);
                setError('Error de validación: Verifica los campos ingresados.');
            } else {
                setError(`Error inesperado: ${err.response?.data?.title || err.message}`);
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
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>{titulo.charAt(0)}</Avatar>
                    </Grid>
                    <Grid xs>
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>{titulo}</Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Modifique los campos necesarios
                        </Typography>
                    </Grid>
                </Grid>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid sx={{ width: '33%' }}>
                            <TextField
                                fullWidth
                                label="Número de Cuenta"
                                name="numero"
                                value={formData.numero}
                                onChange={handleInputChange}
                                error={!!validationErrors.numero}
                                helperText={validationErrors.numero}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            />
                        </Grid>

                        <Grid sx={{ width: '33%' }}>
                            <FormControl fullWidth error={!!validationErrors.dni}>
                                <InputLabel id="dni-label">DNI Asociado (Opcional)</InputLabel>
                                <Select
                                    labelId="dni-label"
                                    name="dni"
                                    value={formData.dni}
                                    label="DNI Asociado (Opcional)"
                                    onChange={handleUsuarioChange}
                                >
                                    <MenuItem value="">
                                        <em>Ninguno</em>
                                    </MenuItem>
                                    {usuarios.map(usuario => (
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

                        <Grid sx={{ width: '33%' }}>
                            <TextField
                                fullWidth
                                label="Nombre del Usuario"
                                name="nombreCompletoUsuario"
                                value={formData.nombreCompletoUsuario}
                                InputProps={{ readOnly: true }}
                                disabled={!formData.dni}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid sx={{ width: '50%' }}>
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
                        <Grid sx={{ width: '50%' }}>
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
                </Box>
            </Paper>
        </Box>
    );
};

export default EditarCuenta;
