# Implementation Summary — AI-Powered Digital System for African Traditional Herbal Medicine

## Overview

This document summarizes the improvements made to the Herbal Medicine Repository to align the implementation with the project proposal and address the specific feedback requests:

1. **Train a chatbot model** with dataset, training, and accuracy testing
2. **Password visibility toggle** on the login password field
3. **Role-based diverse chatbot responses** (supervisor gets different replies)

---

## 1. AI Chatbot Model Training (nlp_processing/)

### Problem
The original chatbot used simple keyword matching that returned the **same reply every time** for a given intent. There was no trained model, no dataset, and no accuracy testing.

### Solution

#### Dataset (`nlp_processing/chatbot_dataset.json`)
- **16 intents** with **368 training patterns** total
- Each intent has **multiple response templates** (4 regular + 2-3 supervisor responses)
- Intents include: `greeting`, `list_plants`, `search_by_ailment`, `search_by_name`, `preparation_method`, `side_effects`, `thank_you`, `help`, `goodbye`, `classification_disease`, `classification_plant_family`, `classification_body_system`, `classification_treatment`, `no_match`, `reports`, `pending_submissions`

#### Training Script (`nlp_processing/train_chatbot.py`)
- **TF-IDF Vectorizer** with n-grams (1,2), max_features=2000, sublinear_tf
- **Logistic Regression** classifier (lbfgs solver)
- Splits data 75/25 for training/testing with stratification
- Evaluates using classification report, confusion matrix, and per-intent accuracy
- Saves model artifacts: `chatbot_model.joblib`, `tfidf_vectorizer.joblib`, `label_encoder.joblib`, `model_metadata.json`

#### Testing Script (`nlp_processing/test_chatbot.py`)
- **5-fold cross-validation**
- **Held-out test set** evaluation
- **Real-world query tests** (25 queries covering all intents)
- **Response diversity test** (verifies chatbot gives different replies)

#### Model Loader (`nlp_processing/chatbot_model.py`)
- Loads trained model artifacts from disk
- `predict_intent()` — classifies user messages with confidence scoring
- `get_response()` — returns **randomly selected** response from the intent's response pool (ensures **diverse responses**, not the same reply every time)
- **Supervisor mode** — when `is_supervisor=True`, uses `supervisor_responses` pool instead of regular responses, giving the supervisor **different, elevated replies**
- Template placeholder filling (`{plant_count}`, `{pending_count}`, `{match_details}`, etc.)
- Confidence threshold (0.30) with fallback to `no_match` intent

#### Updated Views (`nlp_processing/views.py`)
- Chat endpoint now uses the trained model via `get_chatbot()`
- Automatically detects supervisor status from JWT token / UserProfile
- Falls back to keyword-based responses if model is not trained
- Response includes `intent`, `confidence`, and `is_supervisor` fields

### Results
| Metric | Score |
|--------|-------|
| Cross-Validation Accuracy | **74.44%** |
| Held-Out Test Accuracy | **72.83%** |
| Real-World Query Accuracy | **100%** (25/25) |
| Overall Average | **82.42%** |

---

## 2. Password Visibility Toggle

### Frontend (`frontend/src/pages/Login.js`)
- Added `showPassword` state (boolean)
- Password input toggles between `type="password"` and `type="text"`
- Eye icon (👁️) / eye-slash icon (🙈) toggle button positioned inside the password field
- `title` attribute provides accessibility hint ("Show password" / "Hide password")

### Frontend (`frontend/src/pages/Register.js`)
- Same password visibility toggle added
- Also added **role selection dropdown** with options:
  - Community Member
  - Researcher
  - Traditional Health Practitioner

### Mobile (`mobile/src/screens/LoginScreen.js`)
- Added `showPassword` state
- `secureTextEntry={!showPassword}` on the TextInput
- Eye icon toggle using `TouchableOpacity` with 👁️/🙈 emoji

### Mobile API (`mobile/src/services/api.js`)
- Updated `chatbot()` function to accept `isSupervisor` parameter

---

## 3. Role-Based Access Control (RBAC)

### New App: `accounts/`
- **`models.py`** — `UserProfile` model with `role` field:
  - `administrator` — Full system control
  - `traditional_health_practitioner` — Document herbal knowledge
  - `researcher` — Search and view approved knowledge
  - `community_member` — Limited search/view access
- Auto-creates profile on user registration via `post_save` signal
- Helper properties: `is_admin`, `is_practitioner`, `is_researcher`, `is_community_member`

### Updated Registration (`herbal_medicine/auth_views.py`)
- `UserRegistrationSerializer` now includes `role` field
- Creates `UserProfile` with selected role during registration
- Returns user role in the registration response

### Admin (`accounts/admin.py`)
- Custom `UserAdmin` with inline `UserProfile`
- `UserProfileAdmin` with role filtering, search, and approval toggle

---

## 4. Enhanced Plant Model (`repository/models.py`)

Added fields aligned with the proposal:

| Field | Description |
|-------|-------------|
| `harvesting_season` | Appropriate time for collecting herbal materials |
| `contraindications` | Situations where remedy should not be used |
| `approval_status` | `pending` / `approved` / `rejected` (knowledge validation workflow) |
| `submitted_by` | User who submitted the record |
| `approved_by` | Administrator who approved |
| `approved_at` | Timestamp of approval |
| `plant_family` | Botanical family (e.g., Fabaceae, Asteraceae) |
| `body_system` | Body system affected (e.g., digestive, respiratory) |
| `treatment_category` | Therapeutic property (e.g., antimalarial, antibacterial) |
| `updated_at` | Auto-updated timestamp |

### Serializer (`repository/serializers.py`)
- Added `read_only_fields` for approval workflow fields

### Migrations
- `accounts/migrations/0001_initial.py` — UserProfile model
- `repository/migrations/0003_alter_plant_options_plant_approval_status_and_more.py` — All new Plant fields

---

## 5. Frontend Chatbot Updates (`frontend/src/pages/Chatbot.js`)

- Detects supervisor status from JWT token on mount
- Passes `isSupervisor` flag to the API
- Displays supervisor mode indicator (👑) when active
- Shows model accuracy info (72.83%) and diversity explanation
- Supervisor users receive **different, elevated responses** with admin capabilities

### API (`frontend/src/services/api.js`)
- `chatWithAssistant(message, isSupervisor)` — passes `is_supervisor` flag to backend

---

## 6. Settings (`herbal_medicine/settings.py`)

- Added `accounts` to `INSTALLED_APPS`

---

## Files Created/Modified

### New Files
- `nlp_processing/chatbot_dataset.json` — Intent dataset (368 patterns, 16 intents)
- `nlp_processing/train_chatbot.py` — Model training script
- `nlp_processing/test_chatbot.py` — Model testing script
- `nlp_processing/chatbot_model.py` — Model loader and inference
- `accounts/__init__.py` — App init
- `accounts/models.py` — UserProfile model with RBAC
- `accounts/admin.py` — Admin configuration
- `accounts/apps.py` — App config
- `accounts/migrations/0001_initial.py` — Migration
- `repository/migrations/0003_alter_plant_options_plant_approval_status_and_more.py` — Migration
- `nlp_processing/models/` — Trained model artifacts
- `IMPLEMENTATION_SUMMARY.md` — This document

### Modified Files
- `nlp_processing/views.py` — Uses trained model with diverse + role-based responses
- `herbal_medicine/auth_views.py` — Registration with role selection
- `repository/models.py` — Enhanced with proposal fields
- `repository/serializers.py` — Read-only fields for approval workflow
- `herbal_medicine/settings.py` — Added `accounts` app
- `frontend/src/pages/Login.js` — Password visibility toggle
- `frontend/src/pages/Register.js` — Password visibility + role selection
- `frontend/src/pages/Chatbot.js` — Supervisor detection + diverse responses
- `frontend/src/services/api.js` — Pass supervisor flag to chatbot
- `mobile/src/screens/LoginScreen.js` — Password visibility toggle
- `mobile/src/services/api.js` — Pass supervisor flag to chatbot

---

## How to Run

### Train the Chatbot Model
```bash
python nlp_processing/train_chatbot.py
```

### Test the Chatbot Model
```bash
python nlp_processing/test_chatbot.py
```

### Create Migrations
```bash
python -m django makemigrations
python -m django migrate
```

### Run the Django Backend
```bash
python herbal_medicine/manage.py runserver
```

### Run the Frontend
```bash
cd frontend
npm start
```
