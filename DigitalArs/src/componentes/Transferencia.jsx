import { Box, Button, Grid, Paper, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import userData from "../api/local/pruebaUsuario.json";

const actualizarUsuarios = (usuariosActualizados) => {
  localStorage.setItem("usuarios", JSON.stringify(usuariosActualizados));
};

const Transferencia = ({ usuario, saldo: propSaldo, setSaldo }) => {
  const [cvu, setCvu] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [saldoDisponible, setSaldoDisponible] = useState(propSaldo); // Inicializa con la prop
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogIcon, setDialogIcon] = useState(null);
  const navigate = useNavigate();
  const idUsuario = usuario?.id;

  useEffect(() => {
    setSaldoDisponible(propSaldo);
  }, [propSaldo]);

  const handleTransferir = () => {
    if (!cvu || monto <= 0 || !idUsuario) {
      setMensaje("Complete todos los campos correctamente.");
      return;
    }

    const montoTransferido = parseFloat(monto);
    if (isNaN(montoTransferido)) {
      setMensaje("El monto a transferir no es válido.");
      return;
    }

    if (montoTransferido > saldoDisponible) {
      setMensaje("Saldo insuficiente.");
      return;
    }

    let usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || userData;
    const usuarioOrigenIndex = usuariosGuardados.findIndex(user => user.id === idUsuario);
    const cuentaDestinoIndex = usuariosGuardados.findIndex(user => user.name === cvu);

    if (usuarioOrigenIndex === -1 || cuentaDestinoIndex === -1) {
      setMensaje("Error al encontrar usuarios.");
      return;
    }

    const usuarioOrigen = { ...usuariosGuardados[usuarioOrigenIndex] };
    const cuentaDestino = { ...usuariosGuardados[cuentaDestinoIndex] };

    usuarioOrigen.saldo -= montoTransferido;
    cuentaDestino.saldo += montoTransferido;

    usuariosGuardados[usuarioOrigenIndex] = usuarioOrigen;
    usuariosGuardados[cuentaDestinoIndex] = cuentaDestino;

    actualizarUsuarios(usuariosGuardados);
    localStorage.setItem('usuarios_data', JSON.stringify(usuariosGuardados)); // Guarda la lista completa

    setSaldo(usuarioOrigen.saldo); 

    setDialogMessage(`Transferencia de $${monto} realizada con éxito a ${cvu}`);
    setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
    setOpenDialog(true);

    setCvu("");
    setMonto("");

    setTimeout(() => {
      setOpenDialog(false);
      navigate("/home");
    }, 2000);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Transferencia de dinero
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="CVU o Alias"
              fullWidth
              value={cvu}
              onChange={(e) => setCvu(e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Monto a transferir"
              type="number"
              fullWidth
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              variant="outlined"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleTransferir}
              >
                Transferir
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1" color="textSecondary" align="right">
                Saldo disponible: ${saldoDisponible}
              </Typography>
            </Grid>
          </Grid>

          {mensaje && (
            <Grid item xs={12}>
              <Typography variant="body1" color="primary">
                {mensaje}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Transferencia Exitosa</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {dialogIcon}
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          {/* No es necesario botón, ya que se redirige automáticamente */}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transferencia;