import React, { createContext, useContext } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
} from "@mui/material";

// Importaciones de los íconos desde el paquete correcto: @mui/icons-material
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// Si usas otros íconos en tu aplicación, impórtalos aquí también:
// import OtherIcon from '@mui/icons-material/Other';

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthContext } from "../servicios/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { formatearARS } from '../utils/format';

const appTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

export const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Objeto que contendrá todos los componentes de Material-UI centralizados
  const MuiComponents = {
    Box,
    Button,
    Grid,
    Paper,
    TextField,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    InputAdornment,
    AccountCircle: AccountCircleIcon,
    Email: EmailIcon,
    CreditCard: CreditCardIcon,
    AttachMoney: AttachMoneyIcon,
  };
  const auth = { user };
  const router = { navigate, location };
  const api = axios.create({
    baseURL: "https://localhost:7097",
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const commonFunctions = {
    getToken: () => localStorage.getItem('token'),
    formatCurrency: formatearARS,
  };

  // Componente de diálogo de éxito (también consume MuiComponents)
  const SuccessDialog = ({ open, handleClose, message, icon }) => {
    // Aquí desestructuras los componentes que necesitas del MuiComponents global
    const { Dialog, DialogTitle, DialogContent, DialogActions, Typography } = MuiComponents;

    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Operación Exitosa</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {icon}
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions />
      </Dialog>
    );
  };

  return (
    <ThemeProvider theme={appTheme}>
      <ConfigContext.Provider
        value={{
          MuiComponents, // Exportamos el objeto MuiComponents completo
          auth,
          router,
          api,
          commonFunctions,
          SuccessDialog, // Exportamos el componente de diálogo de éxito
        }}
      >
        {children}
      </ConfigContext.Provider>
    </ThemeProvider>
  );
};