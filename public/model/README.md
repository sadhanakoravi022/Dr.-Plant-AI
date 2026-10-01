# On-device model

The app runs `model.tflite` fully offline using LiteRT.js (the successor to TensorFlow Lite for the web).

- File: `trained_model/model.tflite` (about 4.4 MB, float16 weights)
- Input: float32, shape [1, 224, 224, 3], raw pixel values 0 to 255 (normalization is inside the model)
- Output: float32, shape [1, 38], softmax probabilities in the order of `labels.txt`

## Retrain on your GPU (native Windows, plain venv)

Requirements: CUDA 11.2, cuDNN 8.1, Python 3.10.

```
py -3.10 -m venv drplant-train
drplant-train\Scripts\activate
pip install -r requirements.txt
set PLANTVILLAGE_DATA_DIR=D:\archive\plantvillage dataset\color
python train_mobilenet.py
```

The script trains, exports `model.tflite` next to itself and writes `trained_model/labels.txt`. It also prints the accuracy of the exported `.tflite` on real validation images. No tensorflowjs and no second environment needed.

If the class order in `trained_model/labels.txt` differs from the root `labels.txt`, update `PLANTVILLAGE_CLASSES` in `src/lib/tflite-pipeline.ts`.

Optional environment variables: `TRAIN_BATCH_SIZE` (use 16 on a 4 GB GPU), `HEAD_EPOCHS`, `FINE_TUNE_EPOCHS`.