import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_ORIGIN = (process.env.EXPO_PUBLIC_API_ORIGIN || 'http://127.0.0.1:8000').replace(/\/$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const buildMediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/media/${path.replace(/^media\//, '').replace(/^\//, '')}`;
};

const API = axios.create({
  baseURL: `${API_BASE_URL}/`,
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = await AsyncStorage.getItem('refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
          await AsyncStorage.setItem('access', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return API(original);
        } catch {
          await AsyncStorage.multiRemove(['access', 'refresh']);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getPlants = () => API.get('plants/');
export const getPlant = (id) => API.get(`plants/${id}/`);
export const searchPlants = (q) => API.get(`plants/?search=${encodeURIComponent(q)}`);
export const getTranscriptions = () => API.get('transcriptions/');

export const login = (username, password) =>
  axios.post(`${API_BASE_URL}/token/`, { username, password });

export const register = (payload) =>
  axios.post(`${API_BASE_URL}/register/`, payload);

export const chatbot = (message) => API.post('nlp/chat/', { message });

export const uploadTranscription = (formData) =>
  API.post('transcriptions/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const transcribeRecording = (id) =>
  API.post(`transcriptions/${id}/transcribe/`);

export const processNLP = (transcriptionId) =>
  API.post('nlp/process/', { transcription_id: transcriptionId });

export const createPlant = (payload) => API.post('plants/', payload);

export default API;
