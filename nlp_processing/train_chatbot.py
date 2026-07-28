#!/usr/bin/env python
"""
Chatbot Model Training Script
=============================
Trains a TF-IDF + Logistic Regression classifier on the chatbot intent dataset.
Saves the trained model, vectorizer, and label encoder to disk for inference.

Usage:
    python nlp_processing/train_chatbot.py
"""

import json
import os
import random
import sys

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

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
    """Load intents from the JSON dataset."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["intents"]


def build_training_data(intents):
    """
    Build (text, label) pairs from intents.
    Each pattern becomes a training sample.
    """
    texts = []
    labels = []
    for intent in intents:
        tag = intent["tag"]
        for pattern in intent["patterns"]:
            texts.append(pattern.lower().strip())
            labels.append(tag)
    return texts, labels


def train_model(texts, labels):
    """
    Train a TF-IDF + Logistic Regression classifier.
    Returns the trained model, vectorizer, and label encoder.
    """
    # Encode labels
    le = LabelEncoder()
    y = le.fit_transform(labels)

    # TF-IDF vectorizer with n-grams for better intent matching
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=2000,
        sublinear_tf=True,
        strip_accents="unicode",
    )
    X = vectorizer.fit_transform(texts)

    # Split for evaluation
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # Logistic Regression classifier (lbfgs handles multiclass natively)
    model = LogisticRegression(
        max_iter=1000,
        C=10.0,
        solver="lbfgs",
        random_state=42,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = model.score(X_test, y_test)

    print("=" * 60)
    print("CHATBOT MODEL TRAINING RESULTS")
    print("=" * 60)
    print(f"Total training samples:  {len(texts)}")
    print(f"Number of intents:       {len(le.classes_)}")
    print(f"Training samples:        {X_train.shape[0]}")
    print(f"Testing samples:         {X_test.shape[0]}")
    print(f"Test Accuracy:           {accuracy:.4f} ({accuracy*100:.2f}%)")
    print()
    print("Classification Report:")
    print("-" * 60)
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    print()
    print("Confusion Matrix:")
    print("-" * 60)
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    print()

    # Per-intent accuracy
    print("Per-Intent Accuracy:")
    print("-" * 60)
    for i, intent_name in enumerate(le.classes_):
        mask = y_test == i
        if mask.sum() > 0:
            intent_acc = (y_pred[mask] == i).mean()
            print(f"  {intent_name:30s}  {intent_acc:.4f}  ({mask.sum()} samples)")
    print()

    return model, vectorizer, le, accuracy


def save_model(model, vectorizer, label_encoder, accuracy, intents):
    """Save the trained model and related artifacts to disk."""
    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(label_encoder, LABEL_ENCODER_PATH)

    # Save metadata
    metadata = {
        "accuracy": accuracy,
        "num_intents": len(label_encoder.classes_),
        "intents": list(label_encoder.classes_),
        "num_training_samples": sum(len(i["patterns"]) for i in intents),
        "model_type": "TF-IDF + Logistic Regression",
        "vectorizer_params": {
            "ngram_range": [1, 2],
            "max_features": 2000,
            "sublinear_tf": True,
        },
        "classifier_params": {
            "max_iter": 1000,
            "C": 10.0,
            "solver": "lbfgs",
        },
    }
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"Model saved to:           {MODEL_PATH}")
    print(f"Vectorizer saved to:      {VECTORIZER_PATH}")
    print(f"Label encoder saved to:   {LABEL_ENCODER_PATH}")
    print(f"Metadata saved to:        {METADATA_PATH}")
    print()


def main():
    print("Loading dataset...")
    intents = load_dataset(DATASET_PATH)
    print(f"Loaded {len(intents)} intents from {DATASET_PATH}")
    print()

    texts, labels = build_training_data(intents)
    print(f"Built {len(texts)} training samples from {len(set(labels))} intents")
    print()

    model, vectorizer, label_encoder, accuracy = train_model(texts, labels)
    save_model(model, vectorizer, label_encoder, accuracy, intents)

    print("=" * 60)
    print("TRAINING COMPLETE!")
    print(f"Model accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("=" * 60)

    return accuracy


if __name__ == "__main__":
    accuracy = main()
    # Exit with non-zero if accuracy is below threshold
    if accuracy < 0.70:
        print(f"\nWARNING: Accuracy {accuracy:.4f} is below 0.70 threshold!")
        sys.exit(1)
    sys.exit(0)
