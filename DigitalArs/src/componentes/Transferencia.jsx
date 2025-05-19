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

const Transferencia = ({ user, saldo: propSaldo, setSaldo }) => {
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

  // Validar que exista idTipo
  useEffect(() => {
    if (!idTipo) {
      setDialogMessage("Falta información de la transacción. Redirigiendo...");
      setOpenDialog(true);
      setTimeout(() => navigate("/home"), 2000);
    }
  }, [idTipo]);

  useEffect(() => {
    const saldoInicial = Number(propSaldo) || Number(cuentaOrigen?.saldo) || 0;
    setSaldoDisponible(saldoInicial);
  }, [propSaldo, user]);

  useEffect(() => {
    axios
      .get("https://localhost:7097/Cuenta")
      .then((res) => setCuentas(res.data || []))
      .catch(() => setMensaje("Error al cargar cuentas destino."));
  }, []);

  useEffect(() => {
    if (!cvuDestino) {
      setDatosUsuarioDestino({ dni: "", nombre: "", apellido: "" });
      return;
    }

    const cuentaSeleccionada = cuentas.find((c) => c.numero.toString() === cvuDestino.toString());

    if (cuentaSeleccionada) {
      setDatosUsuarioDestino({
        dni: cuentaSeleccionada.dni || cuentaSeleccionada.usuario?.dni || "",
        nombre: cuentaSeleccionada.nombre || cuentaSeleccionada.usuario?.nombre || "",
        apellido: cuentaSeleccionada.apellido || cuentaSeleccionada.usuario?.apellido || "",
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
  }, [monto, propSaldo, user]);

  const handleTransferir = async () => {
    const montoTransferido = parseFloat(monto);

    if (!cvuDestino || !monto || montoTransferido <= 0 || !idTipo) {
      setMensaje("Complete todos los campos correctamente.");
      return;
    }

    if (montoTransferido > saldoDisponible) {
      setMensaje("Saldo insuficiente.");
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
      });

      setDialogMessage(`Transferencia de $${montoTransferido.toLocaleString("es-AR")} realizada con éxito a la cuenta ${cvuDestino}`);
      setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
      setOpenDialog(true);

      // Limpiar estado
      setMonto("");
      setCvuDestino("");
      setMensaje("");
      setDatosUsuarioDestino({ dni: "", nombre: "", apellido: "" });

      // Actualizar saldo
      setSaldoDisponible((prev) => prev - montoTransferido);
      if (setSaldo) setSaldo((prev) => prev - montoTransferido);

      setTimeout(() => {
        setOpenDialog(false);
        navigate("/home");
      }, 1500);
    } catch (error) {
      console.error("Error al transferir:", error);
      setMensaje("Error al procesar la transferencia. Intente más tarde.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
            <Grid item>
              <Avatar sx={{ width: 56, height: 56 }}>
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid item sx={{ flexGrow: 1 }}>
              <Typography variant="h6">
                {user?.nombre} {user?.apellido}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                Saldo disponible: $
                {typeof saldoDisponible === "number"
                  ? saldoDisponible.toLocaleString("es-AR", { minimumFractionDigits: 2 })
                  : "Cargando..."}
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom>
            Transferencia de dinero
          </Typography>

          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Cuenta Origen"
                value={cuentaOrigen?.numero ?? ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <TextField
                label="DNI"
                value={datosUsuarioDestino.dni}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Nombre Completo"
                value={`${datosUsuarioDestino.nombre} ${datosUsuarioDestino.apellido}`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  localStorage.removeItem("idTipo");
                  navigate(-1);
                }}
              >
                Volver
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleTransferir}
              >
                Transferir
              </Button>
            </Grid>
          </Grid>

          {mensaje && (
            <Typography color="error" sx={{ mt: 2 }}>
              {mensaje}
            </Typography>
          )}
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