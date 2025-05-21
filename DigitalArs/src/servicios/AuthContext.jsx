import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUserRaw = localStorage.getItem('user');

      if (!token || !storedUserRaw) {
        console.warn('Token o usuario faltante en localStorage.');
        setUser(null);
        return;
      }

      const storedUser = JSON.parse(storedUserRaw);
      const dni = storedUser?.dni;

      if (!dni) {
        console.warn('DNI no encontrado en el usuario almacenado para refetch.');
        setUser(null);
        return;
      }

      const response = await axios.get(`https://localhost:7097/Usuario/${dni}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error al refrescar datos de usuario:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Cargar usuario inicial desde localStorage al montar el contexto
  useEffect(() => {
    const storedUserRaw = localStorage.getItem('user');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        setUser(storedUser);
      } catch (e) {
        console.warn('Error al parsear usuario desde localStorage:', e);
        localStorage.removeItem('user'); // Limpiar si hay un error de parseo
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};