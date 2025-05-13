# Audio Data Handler
import numpy as np
import base64, librosa, opensmile, logging

from ..biomarkers.biomarker_config import SAMPLE_RATE, PROSODY_FEATURES, PRONUNCIATION_FEATURES
from ... import config as cf

logger = logging.getLogger(__name__)

# -----------------------------------------------------------------------
# Initialize feature extractor
# -----------------------------------------------------------------------
feature_extractor = opensmile.Smile(
    feature_set     = opensmile.FeatureSet.ComParE_2016,
    feature_level   = opensmile.FeatureLevel.LowLevelDescriptors,
    sampling_rate   = SAMPLE_RATE,
)

# -----------------------------------------------------------------------
# Audio Data
# -----------------------------------------------------------------------
def handle_audio_data(data):
    try:
        # Decode the received base64 data to bytes & get the sample rate
        audio_bytes, sample_rate = base64.b64decode(data["data"]), data["sampleRate"]
        logger.info(f"{cf.YELLOW}[Aud] Audio data received: {len(audio_bytes):,} bytes at {sample_rate:,}Hz")
        
        # Normalize audio data
        audio_array = np.frombuffer(audio_bytes, dtype=np.int16)
        audio_array = audio_array / np.max(np.abs(audio_array))

        # Resample to 16,000 Hz if necessary
        if sample_rate != SAMPLE_RATE:  # SAMPLE_RATE is 16_000
            audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=SAMPLE_RATE)
            logger.info(f"Resampled audio to {SAMPLE_RATE}Hz")

        # Convert to float32 & extract features
        audio_array = librosa.util.buf_to_float(audio_array, n_bytes=2, dtype=np.float32)
        features = feature_extractor.process_signal(audio_array, SAMPLE_RATE)

        # Get only the specified features for each biomarker
        return features[PROSODY_FEATURES], features[PRONUNCIATION_FEATURES]
        
    # On error, returns both as None
    except Exception as e: 
        logger.error(f"Error processing audio data: {e}")
        return None, None
