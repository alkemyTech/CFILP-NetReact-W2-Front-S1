import { useMemo, useState, useEffect, useContext } from "react";
import { ConfigContext } from "../../config/ConfigContext";
import { AuthContext } from "../../servicios/AuthContext";
import { CheckCircle } from "@mui/icons-material";

const Deposito = ({ saldo: propSaldo, setSaldo }) => {
  const {
    MuiComponents,
    appTheme,
    api,
    commonFunctions,
    SuccessDialog,
    router,
  } = useContext(ConfigContext);
  const { user, refetchUser } = useContext(AuthContext);
  const {
    Box,
    Button,
    Grid,
    Paper,
    TextField,
    Typography,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Avatar,
  } = MuiComponents;
  const { navigate, location } = router;
  const { getToken, formatCurrency } = commonFunctions;

  const cuentaDestino = user?.cuentas?.[0];
  const idTipo = location.state?.idTipo;

  const roleNames = useMemo(
    () => user?.roles?.map((rol) => rol.nombre) ?? [],
    [user]
  );
  const esAdmin = useMemo(() => roleNames.includes("Administrador"), [roleNames]);

  const [error, setError] = useState("");
  const [metodo, setMetodo] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const saldoRealActual = Number(propSaldo) || Number(cuentaDestino?.saldo) || 0;
  const [saldoVisual, setSaldoVisual] = useState(saldoRealActual);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogIcon, setDialogIcon] = useState(null);
  const [cuentasOrigenDisponibles, setCuentasOrigenDisponibles] = useState([]);

  useEffect(() => {
    if (!user || !user.cuentas || user.cuentas.length === 0) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    setSaldoVisual(saldoRealActual);
  }, [saldoRealActual]);

  useEffect(() => {
    if (!idTipo) {
      setError("Falta información para el depósito. Redirigiendo...");
      setTimeout(() => navigate("/home"), 2000);
    }
  }, [idTipo, navigate]);

  useEffect(() => {
    const montoNum = parseFloat(monto);
    if (!isNaN(montoNum) && montoNum >= 0) {
      setSaldoVisual(saldoRealActual + montoNum);
    } else {
      setSaldoVisual(saldoRealActual);
    }
    setMensaje("");
  }, [monto, saldoRealActual]);

  useEffect(() => {
    const fetchCuentasOrigen = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.warn("No se encontró token de autenticación.");
          return;
        }

        const response = await api.get("https://localhost:7097/Cuenta", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const filteredAccounts = response.data
          .filter((cuenta) => cuenta.numero < 100)
          .map((cuenta) => ({
            numero: cuenta.numero.toString(),
            nombreUsuario: cuenta.usuario?.nombre || `Cuenta ${cuenta.numero}`,
          }));

        setCuentasOrigenDisponibles(filteredAccounts);
      } catch (err) {
        console.error("Error al cargar cuentas de origen:", err);
        setError("Error al cargar las opciones de depósito.");
      }
    };

    fetchCuentasOrigen();
  }, [api, getToken]);

  const handleDepositar = async () => {
    setMensaje("");

    const montoDeposito = parseFloat(monto);

    if (!metodo || !monto || montoDeposito <= 0 || isNaN(montoDeposito)) {
      setMensaje("Complete todos los campos correctamente con un monto positivo.");
      return;
    }

    if (!cuentaDestino || !cuentaDestino.numero) {
      setMensaje("No se pudo obtener la cuenta de destino.");
      return;
    }

    const payload = {
      ctaOrigen: parseInt(metodo),
      ctaDestino: cuentaDestino.numero,
      idTipo: parseInt(idTipo),
      monto: montoDeposito,
      fecha: new Date().toISOString(),
      descripcion: `Depósito desde cuenta ${metodo}`,
    };

    const token = getToken();
    if (!token) {
      setMensaje("No se encontró token. Inicie sesión nuevamente.");
      navigate("/");
      return;
    }

    try {
      await api.post("/Transaccion", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await refetchUser();

      const cuentaOrigenSeleccionada = cuentasOrigenDisponibles.find((c) => c.numero === metodo);
      const nombreOrigenMostrar = cuentaOrigenSeleccionada
        ? cuentaOrigenSeleccionada.nombreUsuario
        : `Cuenta ${metodo}`;

      setDialogMessage(
        `Depósito de ${formatCurrency(montoDeposito)} realizado con éxito desde ${nombreOrigenMostrar}.`
      );
      setDialogIcon(<CheckCircle sx={{ color: "green", fontSize: 50 }} />);
      setOpenDialog(true);

      setMonto("");
      setMetodo("");
      setMensaje("");

      setTimeout(() => {
        setOpenDialog(false);
        navigate("/home", { state: { refreshUser: true } });
      }, 1500);
    } catch (apiError) {
      console.error("Error al depositar:", apiError);
      if (apiError.response) {
        if ([401, 403].includes(apiError.response.status)) {
          setMensaje("Acceso no autorizado.");
          navigate("/");
        } else if (typeof apiError.response.data === "string") {
          setMensaje(`Error: ${apiError.response.data}`);
        } else if (apiError.response.data?.errors) {
          const errorMessages = Object.values(apiError.response.data.errors).flat().join(". ");
          setMensaje(`Error: ${errorMessages}`);
        } else {
          setMensaje("Error al procesar el depósito.");
        }
      } else {
        setMensaje("No se pudo conectar con el servidor.");
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
          margin: "auto",
          border: "1.5px solid #1976d2",
          backgroundColor: esAdmin ? "#FFD89B" : "#ffffff",
        }}
      >
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
          <Grid sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: esAdmin ? "error.main" : "primary.main",
              }}
            >
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
            Ingreso de dinero
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Seleccioná la cuenta de origen e ingresá un monto para la cuenta{" "}
            <Typography component="span" sx={{ fontWeight: "bold", fontStyle: "italic" }}>
              {cuentaDestino?.numero || ""}
            </Typography>
          </Typography>
        </Paper>

        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid sx={{ width: { xs: "100%", sm: "calc(50% - 10.66px)", backgroundColor: "#f5f5f5" } }}>
            <FormControl fullWidth>
              <InputLabel id="select-metodo-label">Cuenta de Origen</InputLabel>
              <Select
                labelId="select-metodo-label"
                value={metodo}
                label="Cuenta de Origen"
                onChange={(e) => setMetodo(e.target.value)}
              >
                {cuentasOrigenDisponibles.map((cuenta) => (
                  <MenuItem key={cuenta.numero} value={cuenta.numero}>
                    {cuenta.nombreUsuario}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid sx={{ width: { xs: "100%", sm: "calc(50% - 10.66px)", backgroundColor: "#f5f5f5" } }}>
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
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", backgroundColor: "#f5f5f5" } }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(-1)}
              sx={{
                color: "#d32f2f",
                borderColor: "#d32f2f",
                "&:hover": {
                  backgroundColor: "#ffebee",
                  borderColor: "#b71c1c",
                },
              }}
            >
              Cancelar
            </Button>
          </Grid>
          <Grid sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", } }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleDepositar}
              disabled={!monto || parseFloat(monto) <= 0 || !metodo}
              sx={{
                color: "#2e7d32", // Color texto normal
                borderColor: "#2e7d32", // Borde verde normal
                backgroundColor: "#ffffff",
                "&:hover": {
                  backgroundColor: "#e8f5e9",
                  borderColor: "#1b5e20",
                },
                "&.Mui-disabled": {
                  color: "#878787",           // Color de texto cuando está deshabilitado
                  borderColor: "#cfcfcf",     // Borde cuando está deshabilitado
                  backgroundColor: "#f9f9f9", // Fondo cuando está deshabilitado
                },
              }}
            >
              Ingresar
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
