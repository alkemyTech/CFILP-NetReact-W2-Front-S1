import React, { useState, useEffect, useContext } from "react";
import { ConfigContext } from "../../config/ConfigContext";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';

const Cuentas = () => {
  const { MuiComponents, api, router, commonFunctions } = useContext(ConfigContext);
  const {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Grid,
    Avatar
  } = MuiComponents;
  const { navigate } = router;
  const { getToken, formatCurrency } = commonFunctions;
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState("");
  const adminPath = '/Administrar';

  useEffect(() => {
    obtenerCuentas();
  }, []);

  const obtenerCuentas = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
        navigate("/");
        return;
      }
      const response = await api.get("https://localhost:7097/Cuenta", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const cuentasFiltradas = response.data
        ? response.data.filter((cuenta) => cuenta.numero > 100)
        : [];
      setCuentas(cuentasFiltradas);
    } catch (err) {
      console.error("Error al obtener cuentas:", err);
      setError("Error al cargar las cuentas.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate("/");
      }
    }
  };

  const eliminarCuenta = async (numero) => {
    try {
      const token = getToken();
      if (!token) {
        alert("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
        navigate("/");
        return;
      }
      await api.delete(`https://localhost:7097/Cuenta/${numero}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCuentas(prev => prev.filter(c => c.numero !== numero));
    } catch (err) {
      console.error("Error al eliminar cuenta:", err);
      alert("Error al eliminar la cuenta.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate("/");
      }
    }
  };

  const crearCuenta = () => {
    navigate('/crearCuentas');
  };

  const editarCuenta = (numero) => {
    navigate(`/editarCuentas/${numero}`);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
          <Grid sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56 }}>C</Avatar>
          </Grid>
          <Grid sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Cuentas
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Gestión de cuentas
            </Typography>
          </Grid>
          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={crearCuenta}
            >
              Crear Cuenta
            </Button>
          </Box>
        </Grid>

        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ marginY: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><strong>Número</strong></TableCell>
                    <TableCell><strong>DNI</strong></TableCell>
                    <TableCell><strong>Nombre(s) y Apellido(s)</strong></TableCell>
                    <TableCell><strong>Saldo</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cuentas.length > 0 ? (
                    cuentas.map((cuenta) => (
                      <TableRow key={cuenta.numero}>
                        <TableCell>{cuenta.numero}</TableCell>
                        <TableCell>{cuenta.dni}</TableCell>
                        <TableCell>
                          {cuenta.usuario && cuenta.usuario.nombre && cuenta.usuario.apellido
                            ? `${cuenta.usuario.nombre} ${cuenta.usuario.apellido}`
                            : "Sin usuario"
                          }
                        </TableCell>
                        <TableCell>
                            {formatCurrency(cuenta.saldo)}
                        </TableCell>
                        <TableCell>
                          {/* Botón Editar */}
                          <IconButton
                            color="info"
                            onClick={() => editarCuenta(cuenta.numero)}
                            aria-label="Editar cuenta"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          {/* Botón Eliminar */}
                          <IconButton
                            color="error"
                            onClick={() => eliminarCuenta(cuenta.numero)}
                            aria-label="Eliminar cuenta"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay cuentas para mostrar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid container spacing={2} justifyContent="flex-start" sx={{ marginTop: 2 }} columns={12}>
              <Grid gridColumn="span 2">
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(adminPath)}
                  fullWidth
                  sx={{ height: '60px' }}
                >
                  Volver
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Cuentas;