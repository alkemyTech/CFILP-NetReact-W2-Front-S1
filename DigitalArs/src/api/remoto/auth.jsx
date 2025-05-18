// src/api/remote/auth.js
import axios from 'axios';

const API_URL = 'https://tu-api.com/auth';//cambiar por la api cuando este lista

export const login = async (email, password) => {
  const response = await axios.post('/api/login', { email, password });
  return response.data;
};

export const getDemoUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/demo-users`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: 'Error al obtener usuarios demo' };
  }
};

export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};