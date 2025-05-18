// src/api/index.js
import * as localAuth from './local/auth';
import * as remoteAuth from './remoto/auth.jsx';

// Cambiar esto para alternar entre implementaciones
const USE_LOCAL_API = process.env.NODE_ENV === 'development';

export const auth = USE_LOCAL_API ? localAuth : remoteAuth;