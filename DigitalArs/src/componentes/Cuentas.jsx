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
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../utils/theme";

const Cuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    obtenerCuentas();
  }, []);

  const obtenerCuentas = async () => {
    try {
      const response = await axios.get("https://localhost:7097/Cuenta");
      // Aquí asumes que la data viene con $values (colección anidada)
      setCuentas(response.data ?? []);
    } catch (err) {
      console.error("Error al obtener cuentas:", err);
      setError("Error al cargar las cuentas.");
    }
  };

  const eliminarCuenta = async (numero) => {
    try {
      await axios.delete(`https://localhost:7097/Cuenta/${numero}`);
      // Actualiza local eliminando la cuenta borrada
      setCuentas(prev => prev.filter(c => c.numero !== numero));
    } catch (err) {
      console.error("Error al eliminar cuenta:", err);
      alert("Error al eliminar la cuenta.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 3 }}>
        <Paper elevation={3} sx={{ padding: 3, maxWidth: 1000, margin: "auto" }}>
          <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
            <Grid item>
              <Avatar sx={{ width: 56, height: 56 }}>C</Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Cuentas
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Gestión de cuentas
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
                      <TableCell><strong>Número</strong></TableCell>
                      <TableCell><strong>DNI</strong></TableCell>
                      <TableCell><strong>Nombre(s) y Apellido(s)</strong></TableCell>
                      <TableCell><strong>Saldo</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cuentas.length > 0 ? (
                      cuentas.map((cuenta) => (
                        <TableRow key={cuenta.numero}>
                          <TableCell>{cuenta.numero}</TableCell>
                          <TableCell>{cuenta.dni}</TableCell>
                          <TableCell>
                            {cuenta.usuario && cuenta.usuario.nombre && cuenta.usuario.apellido
                              ? `${cuenta.usuario.nombre} ${cuenta.usuario.apellido}`
                              : "Sin usuario"
                            }
                          </TableCell>
                          <TableCell>{cuenta.saldo?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) ?? 0}</TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => eliminarCuenta(cuenta.numero)}
                              aria-label="Eliminar cuenta"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No hay cuentas para mostrar.
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

export default Cuentas;
