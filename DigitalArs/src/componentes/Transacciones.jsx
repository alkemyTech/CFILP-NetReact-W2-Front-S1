import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Grid,
  Avatar
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../utils/theme";

const Transacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    obtenerTransacciones();
  }, []);

  const obtenerTransacciones = async () => {
    try {
      const response = await axios.get("https://localhost:7097/Transaccion");
      setTransacciones(response.data ?? []);

    } catch (err) {
      console.error("Error al obtener transacciones:", err);
      setError("Error al cargar las transacciones.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 1100, margin: "auto" }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
            <Grid item>
              <Avatar sx={{ width: 56, height: 56 }}>T</Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Transacciones
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Historial de movimientos entre cuentas
              </Typography>
            </Grid>
          </Grid>

          {error ? (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ marginY: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell><strong>Cuenta Origen</strong></TableCell>
                      <TableCell><strong>Usuario Origen</strong></TableCell>
                      <TableCell><strong>Cuenta Destino</strong></TableCell>
                      <TableCell><strong>Usuario Destino</strong></TableCell>
                      <TableCell><strong>Monto</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transacciones.length > 0 ? (
                      transacciones.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{new Date(tx.fecha).toLocaleString()}</TableCell>
                          <TableCell>{tx.cuentaOrigen?.numero ?? "N/A"}</TableCell>
                          <TableCell>
                            {tx.cuentaOrigen?.usuario
                              ? `${tx.cuentaOrigen.usuario.nombre} ${tx.cuentaOrigen.usuario.apellido}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>{tx.cuentaDestino?.numero ?? "N/A"}</TableCell>
                          <TableCell>
                            {tx.cuentaDestino?.usuario
                              ? `${tx.cuentaDestino.usuario.nombre} ${tx.cuentaDestino.usuario.apellido}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {tx.monto?.toLocaleString('es-AR', {
                              style: 'currency',
                              currency: 'ARS'
                            }) ?? 0}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No hay transacciones registradas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Grid container spacing={2} justifyContent="flex-start" sx={{ marginTop: 2 }}>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ height: '60px' }}
                  >
                    Volver
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Transacciones;
