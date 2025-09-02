import sys
import joblib
import numpy as np
import soundfile as sf

model = joblib.load("loudness_model.pkl")

def extract_features(path):
    y, sr = sf.read(path, dtype="float32")   # faster than librosa
    if y.ndim > 1:   # stereo → mono
        y = y.mean(axis=1)
    if len(y) > 8000:  # only use 0.5 sec at 16kHz
        y = y[:8000]

    peak = np.max(np.abs(y))
    lufs = 20 * np.log10(np.mean(np.abs(y)) + 1e-6)
    zcr = np.mean(np.abs(np.diff(np.sign(y)))) / 2
    centroid = np.sum(np.arange(len(y)) * np.abs(y)) / (np.sum(np.abs(y)) + 1e-6)
    rms = np.sqrt(np.mean(y**2))

    return [peak, lufs, zcr, centroid], rms

def rms_to_category(rms, prediction):
    if rms < 0.05:
        return "Low / Silent"
    elif prediction < 0.15:
        return "Acceptable"
    else:
        return "Too Loud"

if __name__ == "__main__":
    audio_path = sys.argv[1]
    try:
        features, rms = extract_features(audio_path)
        prediction = model.predict([features])[0]
        print(rms_to_category(rms, prediction))
    except Exception as e:
        print("error:", str(e))
