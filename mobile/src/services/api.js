import axios from 'axios';

export const API_ORIGIN = (process.env.EXPO_PUBLIC_API_ORIGIN || 'http://127.0.0.1:8000').replace(/\/$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;

const API = axios.create({
  baseURL: `${API_BASE_URL}/`,
});

export const getPlants = () => API.get('plants/');
export const getPlant = (id) => API.get(`plants/${id}/`);
export const searchPlants = (q) => API.get(`plants/?search=${q}`);
export const getTranscriptions = () => API.get('transcriptions/');
export const login = (username, password) =>
  axios.post(`${API_BASE_URL}/token/`, { username, password });
export const chatbot = (message) =>
  API.post('nlp/chat/', { message });

export default API;
