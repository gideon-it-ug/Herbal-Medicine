#!/usr/bin/env python
"""
Chatbot Model Testing Script
============================
Tests the trained chatbot model against a held-out test set and
runs additional accuracy checks on real-world queries.

Usage:
    python nlp_processing/test_chatbot.py
"""

import json
import os
import sys

import joblib
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import cross_val_score, StratifiedKFold

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "chatbot_dataset.json")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "chatbot_model.joblib")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")


def load_dataset(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["intents"]


def build_training_data(intents):
    texts = []
    labels = []
    for intent in intents:
        tag = intent["tag"]
        for pattern in intent["patterns"]:
            texts.append(pattern.lower().strip())
            labels.append(tag)
    return texts, labels


def test_model_accuracy(texts, labels):
    """Test model accuracy using cross-validation and held-out test set."""
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split

    le = LabelEncoder()
    y = le.fit_transform(labels)

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=2000,
        sublinear_tf=True,
        strip_accents="unicode",
    )
    X = vectorizer.fit_transform(texts)

    # Cross-validation
    model = LogisticRegression(
        max_iter=1000, C=10.0, solver="lbfgs", random_state=42
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")

    # Held-out test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    test_accuracy = model.score(X_test, y_test)

    print("=" * 60)
    print("CHATBOT MODEL TESTING RESULTS")
    print("=" * 60)
    print(f"Total samples:           {len(texts)}")
    print(f"Number of intents:       {len(le.classes_)}")
    print()
    print("Cross-Validation (5-fold):")
    print(f"  Mean Accuracy:         {cv_scores.mean():.4f} ({cv_scores.mean()*100:.2f}%)")
    print(f"  Std Deviation:         {cv_scores.std():.4f}")
    print(f"  Fold Scores:           {[f'{s:.4f}' for s in cv_scores]}")
    print()
    print(f"Held-Out Test Accuracy:  {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
    print()
    print("Classification Report (held-out test):")
    print("-" * 60)
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    print()
    print("Confusion Matrix:")
    print("-" * 60)
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    print()

    # Per-intent accuracy
    print("Per-Intent Accuracy (held-out test):")
    print("-" * 60)
    for i, intent_name in enumerate(le.classes_):
        mask = y_test == i
        if mask.sum() > 0:
            intent_acc = (y_pred[mask] == i).mean()
            print(f"  {intent_name:30s}  {intent_acc:.4f}  ({mask.sum()} test samples)")
    print()

    return test_accuracy, cv_scores.mean()


def test_real_world_queries():
    """Test the model against real-world queries not in the training set."""
    print("=" * 60)
    print("REAL-WORLD QUERY TESTS")
    print("=" * 60)

    if not os.path.exists(MODEL_PATH):
        print("Model not found. Run training first.")
        return

    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)

    # Real-world queries that should map to specific intents
    test_queries = [
        ("hi there", "greeting"),
        ("hello", "greeting"),
        ("what plants do you have", "list_plants"),
        ("show me all plants", "list_plants"),
        ("what treats malaria", "search_by_ailment"),
        ("what cures fever", "search_by_ailment"),
        ("tell me about kigajji", "search_by_name"),
        ("what is kigajji", "search_by_name"),
        ("how to prepare", "preparation_method"),
        ("dosage", "preparation_method"),
        ("side effects", "side_effects"),
        ("is it safe", "side_effects"),
        ("thank you", "thank_you"),
        ("thanks", "thank_you"),
        ("help", "help"),
        ("what can you do", "help"),
        ("bye", "goodbye"),
        ("goodbye", "goodbye"),
        ("classify by disease", "classification_disease"),
        ("plant family", "classification_plant_family"),
        ("body system", "classification_body_system"),
        ("therapeutic", "classification_treatment"),
        ("generate report", "reports"),
        ("pending submissions", "pending_submissions"),
        ("xyz random gibberish", "no_match"),
    ]

    correct = 0
    total = len(test_queries)

    print(f"{'Query':<35} {'Expected':<25} {'Predicted':<25} {'Correct':<8}")
    print("-" * 95)

    for query, expected in test_queries:
        X = vectorizer.transform([query.lower().strip()])
        predicted_idx = model.predict(X)[0]
        predicted = label_encoder.inverse_transform([predicted_idx])[0]
        is_correct = predicted == expected
        if is_correct:
            correct += 1
        status = "✓" if is_correct else "✗"
        print(f"{query:<35} {expected:<25} {predicted:<25} {status:<8}")

    print()
    real_world_accuracy = correct / total
    print(f"Real-World Query Accuracy: {correct}/{total} = {real_world_accuracy:.4f} ({real_world_accuracy*100:.2f}%)")
    print()

    return real_world_accuracy


def test_response_diversity():
    """Test that the chatbot gives diverse responses (not the same reply every time)."""
    print("=" * 60)
    print("RESPONSE DIVERSITY TEST")
    print("=" * 60)

    # Import the chatbot model
    sys.path.insert(0, os.path.join(os.path.dirname(BASE_DIR), "herbal_medicine"))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "herbal_medicine.settings")

    try:
        import django
        django.setup()
        from nlp_processing.chatbot_model import get_chatbot
        chatbot = get_chatbot()

        # Test that greeting intent gives different responses
        test_messages = ["hi", "hello", "hey", "good morning"]
        responses = set()
        for msg in test_messages:
            result = chatbot.get_response(msg, is_supervisor=False)
            responses.add(result["reply"])

        print(f"Tested {len(test_messages)} greeting messages")
        print(f"Unique responses: {len(responses)}")
        if len(responses) > 1:
            print("✓ PASS: Chatbot provides diverse responses (not the same reply every time)")
        else:
            print("✗ FAIL: Chatbot gives the same reply every time")
        print()

        # Test supervisor responses are different from regular responses
        supervisor_responses = set()
        for msg in test_messages:
            result = chatbot.get_response(msg, is_supervisor=True)
            supervisor_responses.add(result["reply"])

        print(f"Supervisor unique responses: {len(supervisor_responses)}")
        if len(supervisor_responses) > 1:
            print("✓ PASS: Supervisor gets diverse responses")
        else:
            print("✗ FAIL: Supervisor gets the same reply every time")
        print()

        # Check that supervisor responses differ from regular responses
        overlap = responses & supervisor_responses
        if len(overlap) == 0:
            print("✓ PASS: Supervisor responses are different from regular user responses")
        else:
            print(f"⚠ NOTE: {len(overlap)} overlapping response(s) between regular and supervisor")
        print()

    except Exception as e:
        print(f"Could not test response diversity (Django setup required): {e}")
        print("This is expected if Django is not configured. The model itself is tested above.")
        print()


def main():
    print("Loading dataset...")
    intents = load_dataset(DATASET_PATH)
    print(f"Loaded {len(intents)} intents from {DATASET_PATH}")
    print()

    texts, labels = build_training_data(intents)
    print(f"Built {len(texts)} training samples from {len(set(labels))} intents")
    print()

    # Test model accuracy
    test_accuracy, cv_accuracy = test_model_accuracy(texts, labels)

    # Test real-world queries
    real_world_accuracy = test_real_world_queries()

    # Test response diversity
    test_response_diversity()

    # Summary
    print("=" * 60)
    print("TESTING SUMMARY")
    print("=" * 60)
    print(f"Cross-Validation Accuracy:  {cv_accuracy:.4f} ({cv_accuracy*100:.2f}%)")
    print(f"Held-Out Test Accuracy:     {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
    print(f"Real-World Query Accuracy:  {real_world_accuracy:.4f} ({real_world_accuracy*100:.2f}%)")
    print()

    # Overall pass/fail
    overall = (cv_accuracy + test_accuracy + real_world_accuracy) / 3
    print(f"Overall Average Accuracy:   {overall:.4f} ({overall*100:.2f}%)")
    print()

    if overall >= 0.70:
        print("✓ PASS: Model accuracy meets the 70% threshold")
        return 0
    else:
        print("✗ FAIL: Model accuracy is below the 70% threshold")
        return 1


if __name__ == "__main__":
    sys.exit(main())
