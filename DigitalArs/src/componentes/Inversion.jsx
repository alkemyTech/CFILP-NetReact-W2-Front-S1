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
  Avatar
} from "@mui/material";
import { useState, useEffect } from "react";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../utils/theme";
import axios from "axios";


const Inversion = ({ user, saldo: propSaldo, setSaldo }) => {
  const navigate = useNavigate();
  const idUsuario = user?.id;

  const [monto, setMonto] = useState("");
  const [dias, setDias] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogIcon, setDialogIcon] = useState(null);
  const [error, setError] = useState("");
  const [saldoDisponible, setSaldoDisponible] = useState(propSaldo || 0);

  useEffect(() => {
    setSaldoDisponible(propSaldo);
  }, [propSaldo]);

  useEffect(() => {
    axios
      .get("https://localhost:7097/Usuario/{id}")
      .then((res) => setUsuarios(res.data || []))
      .catch(() => setMensaje("Error al cargar cuentas destino."));
  }, []);

  const calcularGanancia = () => {
    const montoNum = parseFloat(monto);
    const diasNum = parseInt(dias);
    if (isNaN(montoNum) || isNaN(diasNum) || montoNum <= 0 || diasNum <= 0) return 0;

    const tasaDiaria = 0.03 / 30; // 3% mensual aproximado dividido en días
    const interes = montoNum * tasaDiaria * diasNum;
    return montoNum + interes;
  };

  const handleInvertir = () => {
    setError("");

    const montoNum = parseFloat(monto);
    const diasNum = parseInt(dias);

    if (!idUsuario || !montoNum || montoNum <= 0 || !diasNum || diasNum <= 0) {
      setError("Complete todos los campos correctamente.");
      return;
    }

    if (montoNum > saldoDisponible) {
      setError("Saldo insuficiente para realizar esta inversión.");
      return;
    }

    let usuariosGuardados = JSON.parse(localStorage.getItem("user")) || [];
    const idx = usuariosGuardados.findIndex((u) => u.id === idUsuario);

    if (idx === -1) {
      setError("Usuario no encontrado.");
      return;
    }

    usuariosGuardados[idx].saldo -= montoNum;
    localStorage.setItem("user", JSON.stringify(usuariosGuardados));
    localStorage.setItem("usuarios_data", JSON.stringify(usuariosGuardados));

    setSaldo(usuariosGuardados[idx].saldo);
    setSaldoDisponible(usuariosGuardados[idx].saldo);

    const totalEstimado = calcularGanancia().toLocaleString("es-AR", {
      minimumFractionDigits: 2
    });

    setDialogMessage(`¡Inversión realizada! Al finalizar obtendrás aproximadamente $${totalEstimado}.`);
    setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
    setOpenDialog(true);

    setTimeout(() => {
      setOpenDialog(false);
      setUsuarios([usuariosGuardados]);
      navigate("/home");
    }, 3000);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: "auto" }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item>
              <Avatar sx={{ width: 56, height: 56 }}>
                {user?.nombre?.charAt(0).toUpperCase() || "U"}
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
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            Depósito a Plazo Fijo
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresá el monto y el plazo deseado.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Monto a invertir"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Días"
                type="number"
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Monto estimado al final del plazo: <strong>${calcularGanancia().toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong>
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button variant="outlined" fullWidth onClick={() => navigate("/home")}>
                Cancelar
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" fullWidth onClick={handleInvertir}>
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
