import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.7:8000/api/',  // Use your PC's IP if testing on real phone
});

export const getPlants = () => API.get('plants/');
export const getPlant = (id) => API.get(`plants/${id}/`);
export const searchPlants = (q) => API.get(`plants/?search=${q}`);
export const login = (username, password) =>
  axios.post('http://10.0.2.2:8000/api/token/', { username, password });
export const chatbot = (message) =>
  API.post('nlp/chat/', { message });

export default API;
