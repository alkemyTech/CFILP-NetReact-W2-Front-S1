import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Avatar
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../utils/theme";
import { useContext } from "react";
import { AuthContext } from "../servicios/AuthContext";

const Transferencia = ({ saldo: propSaldo, setSaldo }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const idTipo = location.state?.idTipo;
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
      setOpenDialog(true);
      setTimeout(() => navigate("/home"), 2000);
    }
  }, [idTipo, navigate]);

  useEffect(() => {
    const saldoInicial = Number(propSaldo) || Number(cuentaOrigen?.saldo) || 0;
    setSaldoDisponible(saldoInicial);
  }, [propSaldo, user, cuentaOrigen]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios
      .get("https://localhost:7097/Cuenta", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => setCuentas(res.data || []))
      .catch((error) => {
        console.error("Error al cargar cuentas destino:", error);
        setMensaje("Error al cargar cuentas destino. Asegúrate de tener permisos.");
      });
  }, []);

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

    if (montoTransferido > saldoDisponible) {
      setMensaje("Saldo insuficiente.");
      return;
      C
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
      navigate('/');
      return;
    }

    try {
      await axios.post("https://localhost:7097/Transaccion", {
        ctaOrigen: cuentaOrigen?.numero,
        ctaDestino: cvuDestino,
        idTipo: parseInt(idTipo),
        monto: montoTransferido,
        fecha: new Date().toISOString(),
        descripcion: "Transferencia desde UI",
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDialogMessage(`Transferencia de $${montoTransferido.toLocaleString("es-AR")} realizada con éxito a la cuenta ${cvuDestino}`);
      setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
      setOpenDialog(true);

      // Limpiar estado
      setMonto("");
      setCvuDestino("");
      setMensaje("");
      setDatosUsuarioDestino({ dni: "", nombre: "", apellido: "" });

      // Actualizar saldo local
      setSaldoDisponible((prev) => prev - montoTransferido);
      if (setSaldo) setSaldo((prev) => prev - montoTransferido);

      // Redirigir con señal para refrescar saldo real
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
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
            <Grid>
              <Avatar sx={{ width: 56, height: 56 }}>
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <Typography variant="h5">
                {user?.nombre} {user?.apellido}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Saldo disponible: ${" "}
                {typeof saldoDisponible === "number"
                  ? saldoDisponible.toLocaleString("es-AR", { minimumFractionDigits: 2 })
                  : "Cargando..."}
              </Typography>
            </Grid>
          </Grid>

          <Paper
            elevation={2}
            sx={{ padding: 3, marginBottom: 3, backgroundColor: "#f5f5f5" }}
          >
            <Typography variant="h5" gutterBottom>
              Transferencia de dinero
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Ingresá los detalles de la transferencia.
            </Typography>
          </Paper>

          {/* Fila 1: Cuenta Origen y Monto a transferir */}
          <Grid container spacing={2} sx={{ marginBottom: 2 }} columns={12}>
            <Grid gridColumn="span 6" sx={{ width: '100%' }}>
              <TextField
                label="Cuenta Origen"
                value={cuentaOrigen?.numero ?? ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid gridColumn="span 6" sx={{ width: '100%' }}>
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
          <Grid container spacing={2} sx={{ marginBottom: 2 }} columns={12}>
            <Grid gridColumn="span 4" sx={{ width: '100%' }}>
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
            <Grid gridColumn="span 4" sx={{ width: '100%' }}>
              <TextField
                label="DNI"
                value={datosUsuarioDestino.dni}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid gridColumn="span 4" sx={{ width: '100%' }}>
              <TextField
                label="Nombre Completo"
                value={`${datosUsuarioDestino.nombre} ${datosUsuarioDestino.apellido}`}
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
          <Grid container spacing={2} columns={12}>
            <Grid gridColumn="span 6">
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  navigate(-1);
                }}
              >
                Cancelar
              </Button>
            </Grid>
            <Grid gridColumn="span 6">
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Transferencia Exitosa</DialogTitle>
          <DialogContent sx={{ textAlign: "center" }}>
            {dialogIcon}
            <Typography>{dialogMessage}</Typography>
          </DialogContent>
          <DialogActions />
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Transferencia;