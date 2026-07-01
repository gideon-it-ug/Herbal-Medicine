export const API_ORIGIN = (process.env.REACT_APP_API_ORIGIN || "http://127.0.0.1:8000").replace(/\/$/, "");
export const API_URL = `${API_ORIGIN}/api/`;
export const MEDIA_URL = `${API_ORIGIN}/media/`;

export const buildMediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${MEDIA_URL}${path.replace(/^media\//, "").replace(/^\//, "")}`;
};

const parseJsonResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || data.message || "Request failed");
  }
  return data;
};

const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;
  const response = await fetch(`${API_URL}token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  localStorage.setItem("access", data.access);
  return data.access;
};

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access");
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    }
  }
  return response;
};

// GET with token
export const fetchWithAuth = async (endpoint) => {
  const response = await authFetch(API_URL + endpoint);
  return parseJsonResponse(response);
};

// POST with token
export const postWithAuth = async (endpoint, data) => {
  const response = await authFetch(API_URL + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJsonResponse(response);
};

// Plants
export const getPlants = () => fetch(API_URL + "plants/").then(res => res.json());
export const getPlant = (id) => fetch(API_URL + `plants/${id}/`).then(res => res.json());
export const searchPlants = (query) => fetch(API_URL + `plants/?search=${encodeURIComponent(query)}`).then(res => res.json());
export const getTranscriptions = () => fetch(API_URL + "transcriptions/").then(res => res.json());
export const loginUser = (username, password) =>
  fetch(API_URL + "token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).then(parseJsonResponse);

export const registerUser = (payload) =>
  fetch(API_URL + "register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(parseJsonResponse);

export const chatWithAssistant = (message) =>
  fetch(API_URL + "nlp/chat/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  }).then(parseJsonResponse);

// Transcription
export const uploadTranscription = async (formData) => {
  const response = await authFetch(API_URL + "transcriptions/", {
    method: "POST",
    body: formData,
  });
  return parseJsonResponse(response);
};

export const transcribeRecording = async (id) => {
  const response = await authFetch(API_URL + `transcriptions/${id}/transcribe/`, {
    method: "POST",
  });
  return parseJsonResponse(response);
};

export const createPlant = async (payload) => {
  const response = await authFetch(API_URL + "plants/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response);
};

// NLP
export const processNLP = (id) => postWithAuth("nlp/process/", { transcription_id: id });
