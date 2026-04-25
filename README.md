# 🌿 AI-Powered Herbal Medicine Documentation System

A digital platform for preserving and promoting indigenous herbal medicine knowledge from Bukedi Sub-Region, Uganda.

## Features
- 🔍 Search 138+ medicinal plants by name, disease or scientific name
- 🤖 AI Chatbot for herbal medicine queries
- 🎤 Audio upload with Whisper AI transcription
- 🧠 NLP extraction of plant data from transcribed text
- 📱 Mobile app (React Native / Expo)
- 🔐 JWT Authentication for researchers

## Tech Stack
- **Backend:** Python, Django 6, Django REST Framework
- **Database:** MySQL 8
- **AI:** OpenAI Whisper (STT), Custom NLP Engine
- **Frontend:** React.js
- **Mobile:** React Native (Expo)

## Getting Started

### Backend
```bash
cd Herbal_Medicine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Mobile
```bash
cd mobile
npx expo start
```

## Developed by
Mugabe Gideon — Computer Science Student, Makerere University  
GitHub: github.com/gideon-it-ug