import React, { useMemo, useState, useEffect, useContext } from "react";
import { ConfigContext } from "../../config/ConfigContext";
import { AuthContext } from "../../servicios/AuthContext";
import { CheckCircle } from "@mui/icons-material";

const Transferencia = ({ saldo: propSaldo, setSaldo }) => {
  const { MuiComponents, api, router, commonFunctions, SuccessDialog } = useContext(ConfigContext);
  const { user } = useContext(AuthContext);
  const {
    Box,
    Button,
    Grid,
    Paper,
    TextField,
    Typography,
    InputLabel,
    FormControl,
    MenuItem,
    Select,
    Avatar
  } = MuiComponents;
  const { navigate } = router;
  const { getToken, formatCurrency } = commonFunctions;
  const location = router.location;
  const idTipo = location.state?.idTipo;
  const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
  const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);
  const cuentaOrigen = user?.cuentas?.[0];
  const [cvuDestino, setCvuDestino] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [saldoDisponible, setSaldoDisponible] = useState(() => {
    return Number(propSaldo) || Number(cuentaOrigen?.saldo) || 0;
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogIcon, setDialogIcon] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [datosUsuarioDestino, setDatosUsuarioDestino] = useState({
    dni: "",
    nombre: "",
    apellido: "",
  });

  useEffect(() => {
    if (!idTipo) {
      setDialogMessage("Falta información de la transacción. Redirigiendo...");
      setDialogIcon(null);
      setOpenDialog(true);
      setTimeout(() => navigate("/home"), 2000);
    }
  }, [idTipo, navigate]);

  useEffect(() => {
    const saldoInicial = Number(propSaldo) || Number(cuentaOrigen?.saldo) || 0;
    setSaldoDisponible(saldoInicial);
  }, [propSaldo, user, cuentaOrigen]);

  useEffect(() => {
    const obtenerCuentas = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error("No se encontró token de autenticación.");
          setMensaje("No se encontró token de autenticación. Por favor, inicie sesión.");
          navigate('/');
          return;
        }

        const res = await api.get("/Cuenta", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCuentas(res.data || []);
      } catch (error) {
        console.error("Error al cargar cuentas destino:", error);
        setMensaje("Error al cargar cuentas destino. Asegúrate de tener permisos.");
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          navigate('/');
        }
      }
    };
    obtenerCuentas();
  }, [api, getToken, navigate]);

  useEffect(() => {
    if (!cvuDestino) {
      setDatosUsuarioDestino({ dni: "", nombre: "", apellido: "" });
      return;
    }

    const cuentaSeleccionada = cuentas.find((c) => c.numero.toString() === cvuDestino.toString());

    if (cuentaSeleccionada) {
      setDatosUsuarioDestino({
        dni: cuentaSeleccionada.usuario?.dni || cuentaSeleccionada.dni || "",
        nombre: cuentaSeleccionada.usuario?.nombre || cuentaSeleccionada.nombre || "",
        apellido: cuentaSeleccionada.usuario?.apellido || cuentaSeleccionada.apellido || "",
      });
    } else {
      setDatosUsuarioDestino({ dni: "", nombre: "", apellido: "" });
    }
  }, [cvuDestino, cuentas]);

  useEffect(() => {
    const montoNum = parseFloat(monto);
    if (!isNaN(montoNum) && montoNum >= 0) {
      const nuevoSaldo = Number(cuentaOrigen?.saldo) - montoNum;
      setSaldoDisponible(nuevoSaldo >= 0 ? nuevoSaldo : 0);
    } else {
      setSaldoDisponible(Number(propSaldo) || Number(cuentaOrigen?.saldo) || 0);
    }
  }, [monto, propSaldo, user, cuentaOrigen]);

  const handleTransferir = async () => {
    const montoTransferido = parseFloat(monto);

    if (!cvuDestino || !monto || montoTransferido <= 0 || !idTipo) {
      setMensaje("Complete todos los campos correctamente.");
      return;
    }

    if (montoTransferido > (Number(cuentaOrigen?.saldo) || 0)) {
      setMensaje("Saldo insuficiente.");
      return;
    }

    if (cvuDestino === cuentaOrigen?.numero) {
      setMensaje("No puedes transferir a la misma cuenta de origen.");
      return;
    }

    const payload = {
      ctaOrigen: cuentaOrigen?.numero,
      ctaDestino: cvuDestino,
      idTipo: parseInt(idTipo),
      monto: montoTransferido,
      fecha: new Date().toISOString(),
      descripcion: "Transferencia desde UI",
    };

    const token = getToken();
    if (!token) {
      setMensaje("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
      navigate('/');
      return;
    }

    try {
      await api.post("/Transaccion",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

      setDialogMessage(`Transferencia de ${formatCurrency(montoTransferido)} realizada con éxito a la cuenta ${cvuDestino}`); // Usa formatCurrency
      setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
      setOpenDialog(true);
      setMonto("");
      setCvuDestino("");
      setMensaje("");
      setDatosUsuarioDestino({ dni: "", nombre: "", apellido: "" });
      setSaldoDisponible((prev) => prev - montoTransferido);
      if (setSaldo) setSaldo((prev) => prev - montoTransferido);
      setTimeout(() => {
        setOpenDialog(false);
        navigate("/home", { state: { refreshUser: true } });
      }, 1500);
    } catch (error) {
      console.error("Error al transferir:", error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setMensaje("Acceso no autorizado o insuficiente para realizar la transferencia.");
          navigate('/');
        } else if (error.response.data) {
          setMensaje(`Error: ${error.response.data}`);
        } else {
          setMensaje("Error al procesar la transferencia. Intente más tarde.");
        }
      } else {
        setMensaje("No se pudo conectar con el servidor. Verifique su conexión.");
      }
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
        {/* Encabezado con Avatar y Títulos */}
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
            <Typography variant="h5"> {user?.nombre} {user?.apellido} </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Saldo disponible: {formatCurrency(saldoDisponible)}
            </Typography>
          </Grid>
        </Grid>
        <Paper elevation={2} sx={{ padding: 3, marginBottom: 3, backgroundColor: "#f5f5f5" }}>
          <Typography variant="h5" gutterBottom>
            Transferencia de dinero
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Complete los campos
          </Typography>
        </Paper>
        {/* Fila 1: Cuenta Origen y Monto a transferir */}
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
            <TextField
              label="Cuenta Origen"
              value={cuentaOrigen?.numero ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
            <TextField
              label="Monto a transferir"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              fullWidth
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
        </Grid>

        {/* Fila 2: Cuenta Destino, DNI y Nombre Completo */}
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(33.33% - 10.66px)', backgroundColor: "#f5f5f5" } }}>
            <FormControl fullWidth>
              <InputLabel id="select-cuenta-destino-label">Cuenta Destino</InputLabel>
              <Select
                labelId="select-cuenta-destino-label"
                value={cvuDestino}
                label="Cuenta destino"
                onChange={(e) => setCvuDestino(e.target.value)}
              >
                {cuentas.map((cuenta) => (
                  <MenuItem key={cuenta.numero} value={cuenta.numero}>
                    {cuenta.numero}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(33.33% - 10.66px)', backgroundColor: "#f5f5f5" } }}>
            <TextField
              label="DNI"
              value={datosUsuarioDestino.dni}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(33.33% - 10.66px)', backgroundColor: "#f5f5f5" } }}>
            <TextField
              label="Nombre Completo"
              value={`${datosUsuarioDestino.nombre} ${datosUsuarioDestino.apellido}`.trim()}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
        {mensaje && (
          <Typography color="error" sx={{ mt: 2 }}>
            {mensaje}
          </Typography>
        )}
        {/* Fila 3: Botones Cancelar y Transferir */}
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#f5f5f5" } }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(-1)}
              sx={{
                color: "#d32f2f",
                borderColor: "#d32f2f",
                "&:hover": {
                  backgroundColor: "#ffebee",
                  borderColor: "#b71c1c",
                },
              }}
            >
              Cancelar
            </Button>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', backgroundColor: "#0f80cc" } }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleTransferir}
              disabled={
                !monto || monto <= 0 || !cvuDestino || cvuDestino === cuentaOrigen?.numero
              }
            >
              Transferir
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <SuccessDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        message={dialogMessage}
        icon={dialogIcon}
      />
    </Box>
  );
};

export default Transferencia;