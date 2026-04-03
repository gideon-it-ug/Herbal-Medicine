const API_URL = "http://127.0.0.1:8000/api/";

// GET with token
export const fetchWithAuth = async (endpoint) => {
  const token = localStorage.getItem("access");
  const response = await fetch(API_URL + endpoint, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  return response.json();
};

// POST with token
export const postWithAuth = async (endpoint, data) => {
  const token = localStorage.getItem("access");
  const response = await fetch(API_URL + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Plants
export const getPlants = () => fetch(API_URL + "plants/").then(res => res.json());
export const getPlant = (id) => fetch(API_URL + `plants/${id}/`).then(res => res.json());
export const searchPlants = (query) => fetch(API_URL + `plants/?search=${query}`).then(res => res.json());

// Transcription
export const uploadTranscription = async (formData) => {
  const token = localStorage.getItem("access");
  const response = await fetch(API_URL + "transcriptions/", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });
  return response.json();
};

// NLP
export const processNLP = (id) => postWithAuth("nlp/process/", { transcription_id: id });