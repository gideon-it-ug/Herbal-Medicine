import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.137.181:8000', // CHANGE THIS
});

export default api;