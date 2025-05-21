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
  Avatar,
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../utils/theme";
import { AuthContext } from "../servicios/AuthContext";

const Deposito = ({ saldo: propSaldo, setSaldo }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const cuentaDestino = user?.cuentas?.[0];

  useEffect(() => {
  if (!user || !user.cuentas || user.cuentas.length === 0) {
    navigate("/");
  }
}, [user, navigate]);


  const [metodo, setMetodo] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [saldoDisponible, setSaldoDisponible] = useState(() => {
    return Number(propSaldo) || Number(cuentaDestino?.saldo) || 0;
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogIcon, setDialogIcon] = useState(null);

  useEffect(() => {
  console.log("user:", user);
  console.log("cuentas:", user?.cuentas);
  console.log("cuentaDestino:", cuentaDestino);
}, [user]);

  useEffect(() => {
    const saldoInicial = Number(propSaldo) || Number(cuentaDestino?.saldo) || 0;
    setSaldoDisponible(saldoInicial);
  }, [propSaldo, cuentaDestino]);

  const handleDepositar = async () => {
    const montoDeposito = parseFloat(monto);

    if (!metodo || !monto || montoDeposito <= 0) {
      setMensaje("Complete todos los campos correctamente.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMensaje("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
      navigate("/");
      return;
    }

    try {
      await axios.post(
        "https://localhost:7097/Transaccion",
        {
          ctaOrigen: null,
          ctaDestino: cuentaDestino?.numero,
          idTipo: 1, // ID de tipo transacción para depósito
          monto: montoDeposito,
          fecha: new Date().toISOString(),
          descripcion: `Depósito por ${metodo}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDialogMessage(`Depósito de $${montoDeposito.toLocaleString("es-AR")} realizado con éxito mediante ${metodo}`);
      setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
      setOpenDialog(true);

      setMonto("");
      setMetodo("");
      setMensaje("");

      setSaldoDisponible((prev) => prev + montoDeposito);
      if (setSaldo) setSaldo((prev) => prev + montoDeposito);

      setTimeout(() => {
        setOpenDialog(false);
        navigate("/home", { state: { refreshUser: true } });
      }, 1500);
    } catch (error) {
      console.error("Error al depositar:", error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setMensaje("Acceso no autorizado para realizar el depósito.");
          navigate("/");
        } else if (error.response.data) {
          setMensaje(`Error: ${error.response.data}`);
        } else {
          setMensaje("Error al procesar el depósito. Intente más tarde.");
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
                {user?.nombre?.charAt(0).toUpperCase() || "U"}
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
                Saldo disponible: $
                {typeof saldoDisponible === "number"
                  ? saldoDisponible.toLocaleString("es-AR", { minimumFractionDigits: 2 })
                  : "Cargando..."}
              </Typography>
            </Grid>
          </Grid>

          <Paper elevation={2} sx={{ padding: 3, marginBottom: 3, backgroundColor: "#f5f5f5" }}>
            <Typography variant="h5" gutterBottom>
              Depósito de dinero
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Seleccioná el método de depósito e ingresá el monto.
            </Typography>
          </Paper>

          {/* Fila: Método de depósito y Monto */}
          <Grid container spacing={2} sx={{ marginBottom: 2 }} columns={12}>
            <Grid gridColumn="span 6" sx={{ width: "100%" }}>
              <FormControl fullWidth>
                <InputLabel id="select-metodo-label">Método de depósito</InputLabel>
                <Select
                  labelId="select-metodo-label"
                  value={metodo}
                  label="Método de depósito"
                  onChange={(e) => setMetodo(e.target.value)}
                >
                  <MenuItem value="Mercado Pago">Mercado Pago</MenuItem>
                  <MenuItem value="Tarjeta Débito">Tarjeta Débito</MenuItem>
                  <MenuItem value="Tarjeta Crédito">Tarjeta Crédito</MenuItem>
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid gridColumn="span 6" sx={{ width: "100%" }}>
              <TextField
                label="Monto a depositar"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>

          {mensaje && (
            <Typography color="error" sx={{ mt: 2 }}>
              {mensaje}
            </Typography>
          )}

          {/* Fila: Botones */}
          <Grid container spacing={2} columns={12}>
            <Grid gridColumn="span 6">
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
            </Grid>
            <Grid gridColumn="span 6">
              <Button
                variant="contained"
                fullWidth
                onClick={handleDepositar}
                disabled={!monto || monto <= 0 || !metodo}
              >
                Depositar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Depósito Exitoso</DialogTitle>
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

export default Deposito;
