import {
  Box, Button, Grid, MenuItem, Paper, Select, TextField, Typography, Dialog, DialogContent, DialogTitle
} from "@mui/material";
import { useState, useEffect } from "react";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import userData from "../api/local/pruebaUsuario.json";

const actualizarUsuarios = (usuariosActualizados) => {
  localStorage.setItem("usuarios", JSON.stringify(usuariosActualizados));
};

const metodosDeposito = [
  { value: "Mercado Pago", label: "Mercado Pago" },
  { value: "Banco de La Pampa", label: "Banco de La Pampa" },
];

const Deposito = ({ usuario, saldo: propSaldo, setSaldo }) => {
  const navigate = useNavigate();
  const idUsuario = usuario?.id;
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [saldoDisponibleLocal, setSaldoDisponibleLocal] = useState(propSaldo); // Inicializa con la prop

  useEffect(() => {
    setSaldoDisponibleLocal(propSaldo);
  }, [propSaldo]);

  const handleDepositar = () => {
    setError("");

    if (!idUsuario) {
      setError("No se ha podido identificar al usuario.");
      return;
    }

    if (!monto || !metodo || parseFloat(monto) <= 0) {
      setError("Complete todos los campos correctamente.");
      return;
    }

    let usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || userData;
    const usuarioEncontradoIndex = usuariosGuardados.findIndex(user => user.id === idUsuario);

    if (usuarioEncontradoIndex === -1) {
      setError("Usuario no encontrado en los datos.");
      return;
    }

    const usuarioEncontrado = { ...usuariosGuardados[usuarioEncontradoIndex] };
    const nuevoSaldo = parseFloat(usuarioEncontrado.saldo) + parseFloat(monto);
    usuarioEncontrado.saldo = nuevoSaldo;
    usuariosGuardados[usuarioEncontradoIndex] = usuarioEncontrado;

    actualizarUsuarios(usuariosGuardados);
    localStorage.setItem('usuarios_data', JSON.stringify(usuariosGuardados)); // Guarda la lista completa
    
    setSaldo(nuevoSaldo);
    setOpenDialog(true);

    setTimeout(() => {
      setOpenDialog(false);
      navigate("/home");
    }, 2000);
  };

  const handleCancelar = () => {
    navigate("/home");
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Depósito de Dinero
        </Typography>

        <Grid container spacing={2} direction="column">
          <Grid item container spacing={2} direction="row" alignItems="center">
            <Grid item xs={12} md={6}>
              <Select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                displayEmpty
                fullWidth
                sx={{ minHeight: "56px", width: "100%" }}
              >
                <MenuItem value="" disabled>
                  Seleccionar método de depósito
                </MenuItem>
                {metodosDeposito.map((metodo) => (
                  <MenuItem key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Monto a depositar"
                type="number"
                fullWidth
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>

          <Grid item sx={{ mt: 2 }}>
            <Typography variant="subtitle1" color="textSecondary">
              Saldo disponible: ${saldoDisponibleLocal}
            </Typography>
          </Grid>

          {error && (
            <Grid item>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}

          <Grid item container spacing={2} direction="row" sx={{ mt: 3 }}>
            <Grid item>
              <Button onClick={handleCancelar}>
                Cancelar
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDepositar}
              >
                Depositar
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Depósito exitoso</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 50, color: "green" }} />
          <Typography>
            Se ha depositado ${monto} mediante {metodo}.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Deposito;