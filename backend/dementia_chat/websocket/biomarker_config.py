import pandas as pd
import os

# Constants
WINDOW_SIZE = 5      # seconds
HOP_LENGTH  = 0.01   # 10ms for feature extraction
SAMPLE_RATE = 16000  # Hz

PROSODY_FEATURES = [
    'F0final_sma', 'voicingFinalUnclipped_sma',
    'audspec_lengthL1norm_sma', 'audspecRasta_lengthL1norm_sma',
    'pcm_RMSenergy_sma', 'pcm_zcr_sma', 'jitterLocal_sma', 
    'jitterDDP_sma', 'shimmerLocal_sma', 'logHNR_sma'
]

PRONUNCIATION_FEATURES = [
    'audSpec_Rfilt_sma[3]', 'audSpec_Rfilt_sma[5]', 'audSpec_Rfilt_sma[9]', 'audSpec_Rfilt_sma[11]', 
    'audSpec_Rfilt_sma[12]', 'audSpec_Rfilt_sma[16]', 'audSpec_Rfilt_sma[20]', 'audSpec_Rfilt_sma[21]', 
    'audSpec_Rfilt_sma[23]', 'audSpec_Rfilt_sma[24]', 'audSpec_Rfilt_sma[25]', 'pcm_fftMag_fband250-650_sma', 
    'pcm_fftMag_spectralCentroid_sma', 'pcm_fftMag_spectralVariance_sma', 'mfcc_sma[5]', 'mfcc_sma[9]', 'mfcc_sma[10]', 
    'mfcc_sma[13]'
    ] 



# -----------------------------------------------------------------------
# Features for the pragmatic score
# -----------------------------------------------------------------------
current_path = os.path.dirname(os.path.abspath(__file__))

bm_vectors   = pd.read_csv  (f"{current_path}/biomarker_models/new_LSA.csv", index_col=0 )
bm_entropy   = pd.read_csv  (f"{current_path}/biomarker_models/Hoffman_entropy_53758.csv")
bm_stop_list = pd.read_table(f"{current_path}/biomarker_models/stoplist.txt", header=None)

