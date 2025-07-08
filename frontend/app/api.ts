import axios from 'axios';
import Constants from 'expo-constants';

// Pega a secret key do app.json (extra.APP_SECRET_KEY)
const SECRET_KEY =
  Constants.expoConfig?.extra?.APP_SECRET_KEY ||
  Constants.manifest?.extra?.APP_SECRET_KEY || '';

// Pega a URL base do backend (extra.BACKEND_BASE_URL)
const BACKEND_BASE_URL =
  Constants.expoConfig?.extra?.BACKEND_BASE_URL ||
  Constants.manifest?.extra?.BACKEND_BASE_URL || '';

// Cria instância do axios
const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'x-api-key': SECRET_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
}); 

// Intercepta todas as requisições
api.interceptors.request.use(
  (config) => {
    console.log('Headers da requisição:', config.headers);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida de:', response.config.url);
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, config, data } = error.response;
      console.error(`❌ Erro ${status} em ${config.url}`, data);

      if (status === 401) {
        console.warn('Não autorizado - talvez redirecionar para login...');
        // Ex: window.location.href = '/login';
      }

      if (status === 403) {
        console.warn('Acesso proibido');
      }
    } else {
      console.error('Erro sem resposta do servidor:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
