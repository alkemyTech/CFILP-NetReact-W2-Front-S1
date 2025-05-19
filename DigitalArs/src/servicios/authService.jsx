const API_BASE_URL = 'https://localhost:7097/';

import axios from 'axios';

export const login = async (email, password) => {
  const url = `${API_BASE_URL}Token/login`;
  const response = await axios.post(url, null, {
    params: { email, password }
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('idTipo');
  return Promise.resolve({ success: true });
};
