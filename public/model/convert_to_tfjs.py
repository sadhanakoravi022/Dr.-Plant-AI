import os
import shutil
import tensorflow as tf
import tensorflowjs as tfjs

SAVED_MODEL_PATH = os.environ.get("TRAIN_OUTPUT_DIR", "trained_model") + "/saved_model"
TFJS_OUTPUT_DIR = os.environ.get("TFJS_OUTPUT_DIR", ".")
LABELS_SOURCE = os.environ.get("TRAIN_OUTPUT_DIR", "trained_model") + "/labels.txt"

model = tf.keras.models.load_model(SAVED_MODEL_PATH)

for old_file in ["model.json"]:
    old_path = os.path.join(TFJS_OUTPUT_DIR, old_file)
    if os.path.exists(old_path):
        os.remove(old_path)
for existing in os.listdir(TFJS_OUTPUT_DIR):
    if existing.startswith("group1-shard") and existing.endswith(".bin"):
        os.remove(os.path.join(TFJS_OUTPUT_DIR, existing))

tfjs.converters.save_keras_model(model, TFJS_OUTPUT_DIR)

if os.path.exists(LABELS_SOURCE):
    shutil.copy(LABELS_SOURCE, os.path.join(TFJS_OUTPUT_DIR, "..", "..", "labels.txt"))

print("TFJS model written to:", TFJS_OUTPUT_DIR)
print("Copy the updated labels order into PLANTVILLAGE_CLASSES in src/lib/tflite-pipeline.ts if it changed.")
