import React, { useMemo, useState, useEffect, useContext } from "react";
import { ConfigContext } from "../../config/ConfigContext";
import { AuthContext } from "../../servicios/AuthContext";
import { CheckCircle } from "@mui/icons-material";

const Inversion = () => {
  const { MuiComponents, api, router, commonFunctions, SuccessDialog } = useContext(ConfigContext);
  const { user, refetchUser } = useContext(AuthContext);
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
  const cuentaOrigen = user?.cuentas?.[0];
  const roleNames = useMemo(() => user?.roles?.map(rol => rol.nombre) ?? [], [user]);
  const esAdmin = useMemo(() => roleNames.includes('Administrador'), [roleNames]);
  const [monto, setMonto] = useState("");
  const [dias, setDias] = useState("");
  const [tna, setTna] = useState(0.32);
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
    const tasaDiaria = tna / 365;
    const interes = montoNum * tasaDiaria * diasNum;
    return montoNum + interes;
  };

  const handleInvertir = async () => {
    setError("");

    const montoNum = parseFloat(monto);
    const diasNum = parseInt(dias);
    const tnaValue = parseFloat(tna);

    if (!user || !cuentaOrigen) {
      setError("No se ha podido obtener la información de su cuenta. Intente de nuevo.");
      return;
    }

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

    const token = getToken();
    if (!token) {
      setError("No se encontró token de autenticación. Por favor, inicie sesión nuevamente.");
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

      await refetchUser();

      const totalEstimado = calcularGanancia(); // No formates aquí, déjalo como número para formatCurrency
      setDialogMessage(`¡Inversión realizada! Al finalizar obtendrás aproximadamente ${formatCurrency(totalEstimado)}.`); // Usa formatCurrency
      setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
      setOpenDialog(true);

      setMonto("");
      setDias("");
      setTna(0.32);

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
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
          <Grid sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: esAdmin ? 'error.main' : 'primary.main',
              }}>
              {user?.nombre?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </Grid>
          <Grid sx={{ flexGrow: 1 }}>
            <Typography variant="h5">
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Saldo disponible: {formatCurrency(saldoVisual)}
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
            Ingresá el monto y el plazo deseado para la cuenta{" "}
            <Typography component="span" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
              {user?.cuentas[0]?.numero || ""}
            </Typography>
          </Typography>
        </Paper>
        {/* Fila 1: Importe, Plazo y TNA */}
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(33.33% - 10.66px)' } }}>
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
          <Grid sx={{ width: { xs: '100%', sm: 'calc(33.33% - 10.66px)' } }}>
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
          <Grid sx={{ width: { xs: '100%', sm: 'calc(33.33% - 10.66px)' } }}>
            <TextField
              label="Tasa Nominal Anual (TNA)"
              type="text"
              value={`${(tna * 100).toFixed(2)}%`}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Monto estimado a percibir: {formatCurrency(calcularGanancia())} {/* Usa formatCurrency */}
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {/* Fila 2: Botones Cancelar y Invertir */}
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
            <Button variant="outlined" color="error" fullWidth onClick={() => navigate("/home")}>
              Cancelar
            </Button>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
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
      <SuccessDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        message={dialogMessage}
        icon={dialogIcon}
      />
    </Box>
  );
};

export default Inversion;