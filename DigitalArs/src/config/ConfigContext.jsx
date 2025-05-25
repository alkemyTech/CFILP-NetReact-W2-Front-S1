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
  CircularProgress
} from "@mui/material";

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

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

  const MuiComponents = {
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    InputAdornment,
    CircularProgress,
    AccountCircle: AccountCircleIcon,
    Email: EmailIcon,
    CreditCard: CreditCardIcon,
    AttachMoney: AttachMoneyIcon,
    ArrowBack: ArrowBackIcon,
    Save: SaveIcon
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

  const SuccessDialog = ({ open, handleClose, message, icon }) => {
    const { Dialog, DialogTitle, DialogContent, Typography } = MuiComponents;

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
          MuiComponents,
          auth,
          router,
          api,
          commonFunctions,
          SuccessDialog
        }}
      >
        {children}
      </ConfigContext.Provider>
    </ThemeProvider>
  );
};
