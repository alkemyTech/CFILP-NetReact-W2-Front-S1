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
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import axios from "axios";

const Transferencia = ({ user, saldo: propSaldo, setSaldo }) => {
  const [cvuDestino, setCvuDestino] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [saldoDisponible, setSaldoDisponible] = useState(() => {
    return Number(propSaldo) || Number(user?.cuentas.$values[0]?.saldo) || 0;
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogIcon, setDialogIcon] = useState(null);
  const [cuentas, setCuentas] = useState([]);

  // Nuevo estado para datos del usuario destino
  const [datosUsuarioDestino, setDatosUsuarioDestino] = useState({
    dni: "",
    nombre: "",
    apellido: "",
  });

  const navigate = useNavigate();

  const dniOrigen = user?.dni ?? "";
  const cuentaOrigen = user?.cuentas?.[0] ?? null;

  useEffect(() => {
    const saldoInicial = Number(propSaldo) || Number(user?.cuentas.$values[0]?.saldo) || 0;
    setSaldoDisponible(saldoInicial);
  }, [propSaldo, user]);

  useEffect(() => {
    axios
      .get("https://localhost:7097/Cuenta")
      .then((res) => {
        const cuentasArray = res.data?.$values || [];
        setCuentas(cuentasArray);
      })
      .catch(() => {
        setMensaje("Error al cargar cuentas destino.");
      });

  }, []);

  useEffect(() => {
    if (!cvuDestino) {
      setDatosUsuarioDestino({ dni: "", nombre: "", apellido: "" });
      return;
    }
    const cuentaSeleccionada = cuentas.find(
      (c) => c.numero.toString() === cvuDestino.toString()
    );
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
      setSaldoDisponible((prev) => {
        const nuevoSaldo = Number(user?.cuentas.$values[0]?.saldo) - montoNum;
        return nuevoSaldo >= 0 ? nuevoSaldo : 0;
      });
    } else {
      setSaldoDisponible(Number(propSaldo) || Number(user?.cuentas.$values[0]?.saldo) || 0);
    }
  }, [monto, propSaldo, user]);

  const handleTransferir = async () => {
    const montoTransferido = parseFloat(monto);
    const idTipo = localStorage.getItem("idTipo");

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
        ctaOrigen: user?.cuentas?.$values[0]?.numero,
        ctaDestino: cvuDestino,
        idTipo: parseInt(idTipo),
        monto: montoTransferido,
        fecha: new Date().toISOString(),
        descripcion: "Transferencia desde UI"
      });

      setDialogMessage(
        `Transferencia de $${montoTransferido.toLocaleString("es-AR")} realizada con éxito a la cuenta ${cvuDestino}`
      );
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
        navigate("/home");
      }, 2000);
    } catch (error) {
      console.error("Error al transferir:", error);
      setMensaje("Error al procesar la transferencia. Intente más tarde.");
    }
  };


  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 700, margin: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Transferencia de dinero
        </Typography>

        {/* Fila 1: Cuenta Origen y Monto */}
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Cuenta Origen"
              value={user?.cuentas.$values[0]?.numero ?? ""}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Monto a transferir"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
        </Grid>

        {/* Fila 2: Cuenta Destino + DNI, Nombre, Apellido */}
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
          <Grid item xs={3}>
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
          <Grid item xs={3}>
            <TextField
              label="DNI"
              value={datosUsuarioDestino.dni}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Nombre Completo"
              value={datosUsuarioDestino.nombre + ' ' + datosUsuarioDestino.apellido}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Fila 3: Saldo disponible */}
        <Grid container sx={{ marginBottom: 2 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary" align="right">
              Saldo disponible: $
              {typeof saldoDisponible === "number"
                ? saldoDisponible.toLocaleString("es-AR", { minimumFractionDigits: 2 })
                : "Cargando..."}
            </Typography>
          </Grid>
        </Grid>

        {/* Fila 4: Botones Volver y Transferir */}
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={5}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                localStorage.removeItem("idTipo");
                navigate(-1);
              }}
              size="large"
            >
              Volver
            </Button>
          </Grid>
          <Grid item xs={5}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleTransferir}
              size="large"
            >
              Transferir
            </Button>
          </Grid>
        </Grid>

        {/* Mensaje error */}
        {mensaje && (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
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
  );
};

export default Transferencia;
