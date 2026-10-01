import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

gpus = tf.config.list_physical_devices("GPU")
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

if gpus:
    print(f"GPU detected: training will use {len(gpus)} GPU(s) -> {gpus}")
else:
    print("WARNING: No GPU detected by TensorFlow. Training will run on CPU and be much slower.")

DATA_DIR = os.environ.get("PLANTVILLAGE_DATA_DIR", r"D:\archive\plantvillage dataset\color")
OUTPUT_DIR = os.environ.get("TRAIN_OUTPUT_DIR", "trained_model")
TFLITE_PATH = os.environ.get("TFLITE_OUTPUT_PATH", "trained_model/model.tflite")
IMG_SIZE = (224, 224)
BATCH_SIZE = int(os.environ.get("TRAIN_BATCH_SIZE", "32"))
HEAD_EPOCHS = int(os.environ.get("HEAD_EPOCHS", "10"))
FINE_TUNE_EPOCHS = int(os.environ.get("FINE_TUNE_EPOCHS", "8"))
FINE_TUNE_AT_LAYER = 100
WEIGHTS = os.environ.get("BASE_WEIGHTS", "imagenet")
if WEIGHTS == "none":
    WEIGHTS = None

os.makedirs(OUTPUT_DIR, exist_ok=True)

train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.15,
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.15,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

class_names = train_ds.class_names
print(f"Found {len(class_names)} classes in {DATA_DIR}")
with open(os.path.join(OUTPUT_DIR, "labels.txt"), "w") as f:
    for name in class_names:
        f.write(name + "\n")

AUTOTUNE = tf.data.AUTOTUNE

augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.15),
])

train_ds = (
    train_ds.shuffle(500)
    .map(lambda x, y: (augmentation(x, training=True), y), num_parallel_calls=AUTOTUNE)
    .prefetch(AUTOTUNE)
)
val_ds = val_ds.prefetch(AUTOTUNE)

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights=WEIGHTS,
)
base_model.trainable = False

inputs = tf.keras.Input(shape=(224, 224, 3))
x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(len(class_names), activation="softmax")(x)

model = models.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

callbacks = [
    tf.keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=3, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.4, patience=2),
]

print(f"Starting head training for up to {HEAD_EPOCHS} epochs...")
model.fit(train_ds, validation_data=val_ds, epochs=HEAD_EPOCHS, callbacks=callbacks)

base_model.trainable = True
for layer in base_model.layers[:FINE_TUNE_AT_LAYER]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

print(f"Starting fine-tune phase for up to {FINE_TUNE_EPOCHS} epochs...")
model.fit(train_ds, validation_data=val_ds, epochs=FINE_TUNE_EPOCHS, callbacks=callbacks)

val_loss, val_accuracy = model.evaluate(val_ds)
print("keras_validation_accuracy", val_accuracy)

model.save(os.path.join(OUTPUT_DIR, "plant_model.h5"))

converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]
tflite_bytes = converter.convert()
with open(TFLITE_PATH, "wb") as f:
    f.write(tflite_bytes)
print(f"TFLite model written to {TFLITE_PATH} ({len(tflite_bytes) / 1024 / 1024:.2f} MB)")

interpreter = tf.lite.Interpreter(model_content=tflite_bytes)
interpreter.allocate_tensors()
input_index = interpreter.get_input_details()[0]["index"]
output_index = interpreter.get_output_details()[0]["index"]

correct = 0
total = 0
for images, labels in val_ds.take(20):
    for image, label in zip(images.numpy(), labels.numpy()):
        interpreter.set_tensor(input_index, np.expand_dims(image, 0).astype(np.float32))
        interpreter.invoke()
        prediction = interpreter.get_tensor(output_index)[0]
        correct += int(np.argmax(prediction) == np.argmax(label))
        total += 1
tflite_accuracy = correct / max(total, 1)
print(f"tflite_validation_accuracy {tflite_accuracy:.4f} on {total} images")

metadata = {
    "classNames": class_names,
    "inputShape": [1, 224, 224, 3],
    "inputRange": "raw_0_255_float32",
    "preprocessingBakedIntoGraph": True,
    "kerasValAccuracy": float(val_accuracy),
    "tfliteValAccuracy": float(tflite_accuracy),
    "tfliteSizeMB": round(len(tflite_bytes) / 1024 / 1024, 2),
}
with open(os.path.join(OUTPUT_DIR, "training_metadata.json"), "w") as f:
    json.dump(metadata, f, indent=2)

print("Done. Copy model.tflite into public/model/ (already there if you ran this from public/model) and labels.txt to the project root.")