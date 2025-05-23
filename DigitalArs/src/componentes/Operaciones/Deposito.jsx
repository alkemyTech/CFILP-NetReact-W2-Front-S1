import { useState, useEffect } from "react";
import { ConfigContext } from "../../config/ConfigContext";
import { useContext } from "react";
import { CheckCircle } from "@mui/icons-material";

const Deposito = ({ saldo: propSaldo, setSaldo }) => {
  const { MuiComponents, appTheme, auth, router, api, commonFunctions, SuccessDialog } = useContext(ConfigContext);
  const { Box, Button, Grid, Paper, TextField, Typography, MenuItem, Select, InputLabel, FormControl, Avatar } = MuiComponents;
  const { user } = auth;
  const { navigate, location } = router;
  const { getToken, formatCurrency } = commonFunctions;
  const cuentaDestino = user?.cuentas?.[0];
  const idTipo = location.state?.idTipo;
  const [error, setError] = useState("");
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
    if (!user || !user.cuentas || user.cuentas.length === 0) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const saldoInicial = Number(propSaldo) || Number(cuentaDestino?.saldo) || 0;
    setSaldoDisponible(saldoInicial);
  }, [propSaldo, cuentaDestino]);

  useEffect(() => {
    if (!idTipo) {
      setError("Falta información de la inversión. Redirigiendo...");
      setTimeout(() => navigate("/home"), 2000);
    }
  }, [idTipo, navigate]);

  const handleDepositar = async () => {
    const montoDeposito = parseFloat(monto);

    if (!metodo || !monto || montoDeposito <= 0) {
      setMensaje("Complete todos los campos correctamente.");
      return;
    }

    const payload = {
      ctaOrigen: null,
      ctaDestino: cuentaDestino?.numero,
      idTipo: parseInt(idTipo),
      monto: montoDeposito,
      fecha: new Date().toISOString(),
      descripcion: `Depósito por ${metodo}`,
    };

    const token = getToken();
    if (!token) {
      setMensaje("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
      navigate("/");
      return;
    }

    try {
      await api.post("/Transaccion", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDialogMessage(`Depósito de $${montoDeposito.toLocaleString("es-AR")} realizado con éxito mediante ${metodo}`);
      setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />); // CheckCircle se usa directamente aquí
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
    } catch (apiError) {
      console.error("Error al depositar:", apiError);
      if (apiError.response) {
        if (apiError.response.status === 401 || apiError.response.status === 403) {
          setMensaje("Acceso no autorizado para realizar el depósito.");
          navigate("/");
        } else if (apiError.response.data) {
          setMensaje(`Error: ${apiError.response.data}`);
        } else {
          setMensaje("Error al procesar el depósito. Intente más tarde.");
        }
      } else {
        setMensaje("No se pudo conectar con el servidor. Verifique su conexión.");
      }
    }
  };

  return (
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
              {formatCurrency(saldoDisponible)}
            </Typography>
          </Grid>
        </Grid>
        <Paper elevation={2} sx={{ padding: 3, marginBottom: 3, backgroundColor: "#f5f5f5" }}>
          <Typography variant="h5" gutterBottom>
            Ingreso de dinero
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Seleccioná el método de depósito e ingresá un monto para la cuenta{" "}
            <Typography component="span" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
              {user?.cuentas[0]?.numero || ""}
            </Typography>
          </Typography>
        </Paper>
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 10.66px)' } }}>
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
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 10.66px)' } }}>
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
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
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
      <SuccessDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        message={dialogMessage}
        icon={dialogIcon}
      />
    </Box>
  );
};

export default Deposito;