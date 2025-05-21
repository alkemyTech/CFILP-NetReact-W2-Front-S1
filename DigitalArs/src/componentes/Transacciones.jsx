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
      const sortedTransacciones = response.data.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateB.getTime() - dateA.getTime();
      });
      setTransacciones(sortedTransacciones ?? []);
    } catch (err) {
      console.error("Error al obtener transacciones:", err);
      setError("Error al cargar las transacciones.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 1000, margin: "auto", height: '80vh', display: 'flex', flexDirection: 'column' }}>
          
          {/* Encabezado con título y botón de volver */}
          <Grid container alignItems="center" justifyContent="space-between" sx={{ marginBottom: 3 }}>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 56, height: 56, marginRight: 2 }}>T</Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Transacciones
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Historial de movimientos entre cuentas
                </Typography>
              </Box>
            </Grid>

            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                size="medium"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
              >
                Volver
              </Button>
            </Grid>
          </Grid>

          {error ? (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                maxHeight: '100%',
                marginTop: 2
              }}
            >
              <Table stickyHeader>
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
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Transacciones;
