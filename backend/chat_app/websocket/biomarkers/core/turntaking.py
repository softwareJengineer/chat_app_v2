# =======================================================================
# Turntaking Biomarker
# =======================================================================

# Number of interruptions per X seconds of speech
def generate_turntaking_score(overlapped_speech_count, norm=10):
    normalized_score = min(overlapped_speech_count / norm, 1)
    return normalized_score
