import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Avatar,
  FormControl,
  InputLabel
} from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../utils/theme";
import axios from "axios";
import { AuthContext } from "../servicios/AuthContext";

const Inversion = () => {
  const { user, refetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const idTipo = location.state?.idTipo;

  const cuentaOrigen = user?.cuentas?.[0];

  const [monto, setMonto] = useState("");
  const [dias, setDias] = useState("");
  // Mantienes tna en el estado porque lo usas en el payload y en calcularGanancia
  const [tna, setTna] = useState(0.32); // Valor por defecto fijo

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogIcon, setDialogIcon] = useState(null);
  const [error, setError] = useState("");

  const saldoRealActual = Number(cuentaOrigen?.saldo) || 0;
  const [saldoVisual, setSaldoVisual] = useState(saldoRealActual);

  useEffect(() => {
    setSaldoVisual(saldoRealActual);
  }, [saldoRealActual]);

  useEffect(() => {
    if (!idTipo) {
      setError("Falta información de la inversión. Redirigiendo...");
      setTimeout(() => navigate("/home"), 2000);
    }
  }, [idTipo, navigate]);

  useEffect(() => {
    const montoNum = parseFloat(monto);
    if (!isNaN(montoNum) && montoNum >= 0) {
      const nuevoSaldoVisual = saldoRealActual - montoNum;

      setSaldoVisual(nuevoSaldoVisual >= 0 ? nuevoSaldoVisual : 0);
      if (montoNum > saldoRealActual) {
        setError("El monto a invertir no puede ser mayor que su saldo disponible.");
      } else {
        setError("");
      }
    } else {
      setSaldoVisual(saldoRealActual);
      setError("");
    }
  }, [monto, saldoRealActual]);

  const calcularGanancia = () => {
    const montoNum = parseFloat(monto);
    const diasNum = parseInt(dias);

    if (isNaN(montoNum) || isNaN(diasNum) || montoNum <= 0 || diasNum <= 0) {
      return 0;
    }
    const tasaDiaria = tna / 365; // Usa el estado 'tna'
    const interes = montoNum * tasaDiaria * diasNum;
    return montoNum + interes;
  };

  const handleInvertir = async () => {
    setError("");

    const montoNum = parseFloat(monto);
    const diasNum = parseInt(dias);
    const tnaValue = parseFloat(tna); // Usar el valor del estado (que es fijo)

    if (!user || !cuentaOrigen) {
      setError("No se ha podido obtener la información de su cuenta. Intente de nuevo.");
      return;
    }

    // Validar también el TNA (aunque sea fijo, es bueno tener la validación)
    if (!montoNum || montoNum <= 0 || !diasNum || diasNum <= 0 || isNaN(tnaValue) || tnaValue <= 0) {
      setError("Complete todos los campos correctamente.");
      return;
    }

    if (montoNum > saldoRealActual) {
      setError("Saldo insuficiente para realizar esta inversión.");
      return;
    }

    const payload = {
      ctaOrigen: cuentaOrigen.numero,
      ctaDestino: cuentaOrigen.numero,
      idTipo: parseInt(idTipo),
      monto: montoNum,
      fecha: new Date().toISOString(),
      descripcion: `Inversión a Plazo Fijo por ${diasNum} días con TNA del ${(tnaValue * 100).toFixed(2)}%.`,
      tnaInversion: tnaValue,
      diasPlazo: diasNum,
    };

    console.log("Payload enviado:", payload);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
      navigate('/');
      return;
    }

    try {
      await axios.post("https://localhost:7097/Transaccion",
        payload, // ¡Aquí está la corrección clave!
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

      await refetchUser();

      const totalEstimado = calcularGanancia().toLocaleString("es-AR", {
        minimumFractionDigits: 2
      });

      setDialogMessage(`¡Inversión realizada! Al finalizar obtendrás aproximadamente $${totalEstimado}.`);
      setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
      setOpenDialog(true);

      setMonto("");
      setDias("");
      setTna(0.32); // Resetear TNA a su valor por defecto (que ya es 0.32)

      setTimeout(() => {
        setOpenDialog(false);
        navigate("/home", { state: { refreshUser: true } });
      }, 3000);

    } catch (apiError) {
      console.error("Error al invertir:", apiError);
      if (apiError.response) {
        if (apiError.response.status === 401 || apiError.response.status === 403) {
          setError("Acceso no autorizado o insuficiente para realizar la inversión.");
          navigate('/');
        } else if (apiError.response.data) {
          setError(`Error: ${apiError.response.data}`);
        } else {
          setError("Error al procesar la inversión. Intente más tarde.");
        }
      } else {
        setError("No se pudo conectar con el servidor. Verifique su conexión.");
      }
    }
  };

  if (!user) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 5 }}>
        Cargando datos de usuario...
      </Typography>
    );
  }

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
                Saldo disponible: ${" "}
                {typeof saldoVisual === "number"
                  ? saldoVisual.toLocaleString("es-AR", { minimumFractionDigits: 2 })
                  : "Cargando..."}
              </Typography>
            </Grid>
          </Grid>
          <Paper
            elevation={2}
            sx={{ padding: 3, marginBottom: 3, backgroundColor: "#f5f5f5" }}
          >
            <Typography variant="h5" gutterBottom>
              Depósito a Plazo Fijo
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Ingresá el monto y el plazo deseado.
            </Typography>
          </Paper>
          <Grid container spacing={2} sx={{ mb: 2 }} columns={12}>
            <Grid gridColumn="span 12" sx={{ width: '100%' }}>
              <TextField
                label="Cuenta"
                type="text"
                value={user?.cuentas[0]?.numero || ""}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }} columns={12}>
            <Grid gridColumn="span 12" sx={{ width: '100%' }}>
              <TextField
                label="Importe"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: saldoRealActual } }}
                error={monto > saldoRealActual && monto !== ""}
                helperText={
                  monto > saldoRealActual && monto !== ""
                    ? "El monto excede su saldo disponible."
                    : ""
                }
              />
            </Grid>
            <Grid gridColumn="span 12" sx={{ width: '100%' }}>
              <FormControl fullWidth>
                <InputLabel id="dias-label">Plazo</InputLabel>
                <Select
                  labelId="dias-label"
                  label="Días"
                  value={dias}
                  onChange={(e) => setDias(e.target.value)}
                >
                  <MenuItem value={30}>30 días</MenuItem>
                  <MenuItem value={60}>60 días</MenuItem>
                  <MenuItem value={90}>90 días</MenuItem>
                  <MenuItem value={180}>180 días</MenuItem>
                  <MenuItem value={365}>365 días</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Campo para la TNA, ahora como TextField de solo lectura */}
            <Grid gridColumn="span 12" sx={{ width: '100%' }}>
              <TextField
                label="Tasa Nominal Anual (TNA)"
                type="text" // Debe ser "text" para mostrar el "%"
                value={`${(tna * 100).toFixed(2)}%`} // Formatea el valor del estado 'tna'
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Monto estimado a percibir: ${" "}
            {calcularGanancia().toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </Typography>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Grid container spacing={2} columns={12}>
            <Grid gridColumn="span 6">
              <Button variant="outlined" fullWidth onClick={() => navigate("/home")}>
                Cancelar
              </Button>
            </Grid>
            <Grid gridColumn="span 6">
              <Button
                variant="contained"
                fullWidth
                onClick={handleInvertir}
                disabled={
                  monto > saldoRealActual ||
                  parseFloat(monto) <= 0 ||
                  isNaN(parseFloat(monto)) ||
                  !dias ||
                  isNaN(tna)
                }
              >
                Invertir
              </Button>
            </Grid>
          </Grid>
        </Paper>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Inversión Confirmada</DialogTitle>
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

export default Inversion;