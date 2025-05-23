import React, { useMemo, useState, useEffect, useContext } from "react";
import { ConfigContext } from "../../config/ConfigContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthContext } from '../../servicios/AuthContext';

const Transacciones = () => {
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
    Button,
    Grid,
    Avatar
  } = MuiComponents;
  const { navigate } = router;
  const { getToken } = commonFunctions;
  const { user } = useContext(AuthContext);
  const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
  const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);
  const [transacciones, setTransacciones] = useState([]);
  const [error, setError] = useState("");
  const adminPath = '/Administrar';
  const titulo = 'Transacciones';

  useEffect(() => {
    obtenerTransacciones();
  }, []);

  const obtenerTransacciones = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
        navigate("/");
        return;
      }
      const response = await api.get("/Transaccion", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedTransacciones = response.data.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateB.getTime() - dateA.getTime();
      });
      setTransacciones(sortedTransacciones ?? []);
    } catch (err) {
      console.error("Error al obtener transacciones:", err);
      setError("Error al cargar las transacciones.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate("/");
      }
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          maxWidth: 1000,
          margin: 'auto',
          border: '1.5px solid #1976d2',
          backgroundColor: esAdmin ? '#FFD89B' : '#ffffff',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
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
              {titulo.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {titulo}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Historial de movimientos entre cuentas
            </Typography>
          </Grid>
          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              size="medium"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(adminPath)}
            >
              Volver
            </Button>
          </Box>
        </Grid>
        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              maxHeight: '100%',
              marginTop: 2
            }}
          >
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ textAlign: 'center' }}><strong>Fecha</strong></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}><strong>Cuenta Origen</strong></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}><strong>Usuario Origen</strong></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}><strong>Cuenta Destino</strong></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}><strong>Usuario Destino</strong></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}><strong>Tipo</strong></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}><strong>Monto</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transacciones.length > 0 ? (
                  transacciones.map((tx) => {
                    // Determinar si la cuenta origen es "especial" (ej. Western Union, Tarjeta Débito)
                    const isSpecialOriginAccount = tx.cuentaOrigen?.numero < 100;

                    return (
                      <TableRow key={tx.id}>
                        <TableCell sx={{ textAlign: 'center' }}>{new Date(tx.fecha).toLocaleString()}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {isSpecialOriginAccount ? "" : (tx.cuentaOrigen?.numero ?? "N/A")}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {tx.cuentaOrigen?.usuario
                            ? (isSpecialOriginAccount
                              ? tx.cuentaOrigen.usuario.nombre
                              : `${tx.cuentaOrigen.usuario.nombre} ${tx.cuentaOrigen.usuario.apellido}`)
                            : "N/A"}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{tx.cuentaDestino?.numero ?? "N/A"}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {tx.cuentaDestino?.usuario
                            ? `${tx.cuentaDestino.usuario.nombre} ${tx.cuentaDestino.usuario.apellido}`
                            : "N/A"}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>{tx.tipo?.nombre ?? "N/A"}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {tx.monto?.toLocaleString('es-AR', {
                            style: 'currency',
                            currency: 'ARS'
                          }) ?? 0}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay transacciones registradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Transacciones;