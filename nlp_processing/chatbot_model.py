"""
Chatbot Model Loader and Inference
==================================
Loads the trained TF-IDF + Logistic Regression model and provides
prediction with diverse, role-based responses.

The model classifies user messages into intents. For each intent,
multiple response templates are available, and a random one is selected
to ensure the chatbot does NOT output the same reply every time.

Supervisor (admin) users receive elevated, context-aware responses.
"""

import json
import os
import random

import joblib

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "chatbot_model.joblib")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")
DATASET_PATH = os.path.join(BASE_DIR, "chatbot_dataset.json")

# Confidence threshold below which we fall back to the "no_match" intent
CONFIDENCE_THRESHOLD = 0.30


class ChatbotModel:
    """
    Wrapper around the trained model that provides intent classification
    and diverse, role-based response generation.
    """

    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.intents = {}
        self.metadata = {}
        self._load()

    def _load(self):
        """Load model artifacts from disk."""
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                "Run 'python nlp_processing/train_chatbot.py' first."
            )

        self.model = joblib.load(MODEL_PATH)
        self.vectorizer = joblib.load(VECTORIZER_PATH)
        self.label_encoder = joblib.load(LABEL_ENCODER_PATH)

        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        # Load the full dataset for response templates
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.intents = {intent["tag"]: intent for intent in data["intents"]}

    def predict_intent(self, message):
        """
        Classify a user message into an intent.
        Returns (intent_tag, confidence_score).
        """
        message = message.lower().strip()
        X = self.vectorizer.transform([message])
        probabilities = self.model.predict_proba(X)[0]
        predicted_idx = probabilities.argmax()
        confidence = probabilities[predicted_idx]
        intent_tag = self.label_encoder.inverse_transform([predicted_idx])[0]

        # Fall back to no_match if confidence is too low
        if confidence < CONFIDENCE_THRESHOLD:
            intent_tag = "no_match"
            confidence = float(confidence)

        return intent_tag, float(confidence)

    def get_response(self, message, is_supervisor=False, context=None):
        """
        Generate a response for the given message.

        Parameters:
            message (str): The user's input message.
            is_supervisor (bool): Whether the user is a supervisor/admin.
            context (dict): Optional context data (plant_count, pending_count, etc.)

        Returns:
            dict: {
                'reply': str,           # The response text
                'intent': str,          # The classified intent
                'confidence': float,    # Confidence score
                'is_supervisor': bool,  # Whether supervisor responses were used
            }
        """
        intent_tag, confidence = self.predict_intent(message)
        intent = self.intents.get(intent_tag, self.intents.get("no_match"))

        if intent is None:
            return {
                "reply": "🌿 I'm not sure how to respond to that. Try asking about a medicinal plant or ailment!",
                "intent": "no_match",
                "confidence": 0.0,
                "is_supervisor": is_supervisor,
            }

        # Select response pool based on role
        if is_supervisor and intent.get("supervisor_responses"):
            response_pool = intent["supervisor_responses"]
        else:
            response_pool = intent.get("responses", [])

        # Randomly select a response for diversity (NOT the same reply every time)
        response_template = random.choice(response_pool)

        # Fill in template placeholders with context data
        context = context or {}
        reply = self._fill_template(response_template, message, context)

        return {
            "reply": reply,
            "intent": intent_tag,
            "confidence": round(confidence, 4),
            "is_supervisor": is_supervisor,
        }

    def _fill_template(self, template, message, context):
        """Fill in template placeholders with dynamic data."""
        from repository.models import Plant

        # Default context values
        plants = Plant.objects.all()
        plant_count = plants.count()
        first_plant = plants.first().name if plants else "Kigajji"
        pending_count = Plant.objects.filter(
            approval_status="pending"
        ).count() if hasattr(Plant, "approval_status") else 0
        practitioner_count = 0
        disease_count = 0

        # Try to get practitioner count from UserProfile
        try:
            from accounts.models import UserProfile
            practitioner_count = UserProfile.objects.filter(
                role="traditional_health_practitioner"
            ).count()
        except Exception:
            pass

        # Try to get disease count
        try:
            disease_count = plants.values_list("disease_cured", flat=True).distinct().count()
        except Exception:
            disease_count = plant_count

        # Extract ailment from message for search_by_ailment
        ailment = self._extract_ailment(message)

        # Build match details for search intents
        match_details = ""
        match_count = 0
        if intent_tag_for_template(template) in ("search_by_ailment", "search_by_name"):
            match_details, match_count = self._build_match_details(
                message, ailment, plants
            )

        # Get plant-specific info for preparation/side_effects intents
        plant_name = ailment or first_plant
        preparation = ""
        dosage = ""
        side_effects = ""
        plant_obj = self._find_plant(message, plants)
        if plant_obj:
            plant_name = plant_obj.name
            preparation = plant_obj.preparation_method or "Not documented"
            dosage = plant_obj.dosage or "Not documented"
            side_effects = plant_obj.side_effects or "None documented"

        # Build classification details
        classification_details = self._build_classification_details(
            template, plants
        )

        replacements = {
            "{plant_count}": str(plant_count),
            "{first_plant}": first_plant,
            "{pending_count}": str(pending_count),
            "{practitioner_count}": str(practitioner_count),
            "{disease_count}": str(disease_count),
            "{ailment}": ailment,
            "{match_count}": str(match_count),
            "{match_details}": match_details,
            "{plant_name}": plant_name,
            "{preparation}": preparation,
            "{dosage}": dosage,
            "{side_effects}": side_effects,
            "{classification_details}": classification_details,
        }

        result = template
        for placeholder, value in replacements.items():
            result = result.replace(placeholder, value)

        return result

    def _extract_ailment(self, message):
        """Extract the ailment/disease from a search message."""
        ailments = [
            "malaria", "fever", "diabetes", "cough", "hypertension",
            "high blood pressure", "skin infection", "skin disease",
            "headache", "stomach", "stomach ache", "stomach disorder",
            "cold", "pain", "infection", "inflammation", "digestive",
            "digestive problem",
        ]
        message_lower = message.lower()
        for ailment in ailments:
            if ailment in message_lower:
                return ailment
        return "the requested condition"

    def _find_plant(self, message, plants):
        """Find a plant by name in the message."""
        message_lower = message.lower()
        for plant in plants:
            if plant.name and plant.name.lower() in message_lower:
                return plant
            if plant.scientific_name and plant.scientific_name.lower() in message_lower:
                return plant
        return None

    def _build_match_details(self, message, ailment, plants):
        """Build match details string for search results."""
        message_lower = message.lower()
        matched = []
        for plant in plants:
            fields = [
                plant.disease_cured or "",
                plant.name or "",
                plant.preparation_method or "",
                plant.cultural_significance or "",
            ]
            if any(message_lower in field.lower() for field in fields if field):
                matched.append(plant)

        if not matched:
            return "No matching plants found. Try a different search term.", 0

        details = ""
        for plant in matched:
            details += f"• {plant.name}"
            if plant.disease_cured:
                details += f" — cures {plant.disease_cured}"
            if plant.preparation_method:
                details += f"\n  Preparation: {plant.preparation_method}"
            if plant.dosage:
                details += f"\n  Dosage: {plant.dosage}"
            details += "\n\n"

        return details, len(matched)

    def _build_classification_details(self, template, plants):
        """Build classification details for classification intents."""
        if "disease" in template.lower():
            categories = {}
            for plant in plants:
                disease = plant.disease_cured or "Uncategorized"
                categories[disease] = categories.get(disease, 0) + 1
            return "\n".join(f"  • {k}: {v} plant(s)" for k, v in sorted(categories.items()))
        elif "family" in template.lower():
            families = {}
            for plant in plants:
                family = getattr(plant, "plant_family", None) or "Unclassified"
                families[family] = families.get(family, 0) + 1
            return "\n".join(f"  • {k}: {v} plant(s)" for k, v in sorted(families.items()))
        elif "body system" in template.lower() or "body" in template.lower():
            systems = {}
            for plant in plants:
                system = getattr(plant, "body_system", None) or "Unclassified"
                systems[system] = systems.get(system, 0) + 1
            return "\n".join(f"  • {k}: {v} plant(s)" for k, v in sorted(systems.items()))
        elif "treatment" in template.lower() or "therapeutic" in template.lower():
            categories = {}
            for plant in plants:
                cat = getattr(plant, "treatment_category", None) or "Unclassified"
                categories[cat] = categories.get(cat, 0) + 1
            return "\n".join(f"  • {k}: {v} plant(s)" for k, v in sorted(categories.items()))
        return "Classification data not available."


def intent_tag_for_template(template):
    """Determine the intent tag from a response template."""
    if "treats" in template.lower() or "ailment" in template.lower() or "match" in template.lower():
        return "search_by_ailment"
    if "about" in template.lower() or "plant_name" in template:
        return "search_by_name"
    return "no_match"


# ---------------------------------------------------------------------------
# Singleton instance for Django views
# ---------------------------------------------------------------------------
_chatbot_instance = None


def get_chatbot():
    """Get or create the singleton ChatbotModel instance."""
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = ChatbotModel()
    return _chatbot_instance
