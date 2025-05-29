# ======================================================================= 
# Load Packages
# =======================================================================
# General behavior
import os
import time


# For logging
import warnings, logging

# For text-to-speech (tts)
#import azure.cognitiveservices.speech as speechsdk
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# =======================================================================
# Global Variables
# =======================================================================
USE_CLOUD     = False  # (return default values instead of using the cloud APIs while testing)
USE_LLM       = os.getenv("APP_ENVIRONMENT", "production") != "sandbox" # (don't actually need to load the LLM to test)
THIS_LANGUAGE = "en-US"

script_check    = 1
overlap_check   = 0
chat_history    = list()
game_start_time = time.time()

script_path     = './Script/Script' +"("+time.strftime('%y-%m-%d %H-%M', time.localtime(time.time()))+")"+'.csv'

# Colors for logging
RED    = "\033[0;31m"
GREEN  = "\033[0;32m"
YELLOW = "\033[0;33m"
BLUE   = "\033[0;34m"
CYAN   = "\033[0;96m"
RESET  = "\033[0m"


# =======================================================================
# API Keys & Audio Device Configuration 
# =======================================================================
# MS Auzre / used at 'tts.py' and 'asr.py' files
#speech_key, service_region = "3249fb4e6d8248569b42d5dbf693c259", "eastus"
#speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
# audio_config = speechsdk.audio.AudioConfig(device_name="{0.0.1.00000000}.{9485502f-1e25-43a1-b32e-f2064ed250be}")
# audio_config = speechsdk.audio.AudioConfig(device_name="{0.0.1.00000000}.{c600777f-5cb7-44a2-9457-68fe97eb7632}")

#audio_device_name = os.getenv("AUDIO_DEVICE_NAME", None)
#if audio_device_name: audio_config = speechsdk.audio.AudioConfig(device_name=audio_device_name)
#else:                 audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)

# Final ASR steup
#voice = f"Microsoft Server Speech Text to Speech Voice ({THIS_LANGUAGE}, JennyNeural)"
#speech_config.speech_synthesis_voice_name = voice

# =======================================================================
# Logging Setup
# =======================================================================
# Ignore warnings
warnings.filterwarnings(action='ignore')

# Making the log folders if they do not exist
if not os.path.exists("./logs/"  ): os.mkdir("./logs/"  )
if not os.path.exists("./script/"): os.mkdir("./script/")

# Set up log file written format (ex: 01:39:09)
logging.basicConfig(
    format="%(asctime)s %(levelname)s: %(name)s: %(message)s",
    level=logging.DEBUG,
    filename='./logs/dm.log',
    # encoding='utf-8',
    datefmt="%H:%M:%S",
    #stream=sys.stderr,
)

logging.getLogger("chardet.charsetprober").disabled = True
logger = logging.getLogger(__name__)


# =======================================================================
# Testing Utilities
# =======================================================================
# Check for model files individually
def check_for_model_files(LLM_model_path, pronunciation_model_path, prosody_model_path):
    missing_files = []
    if not os.path.exists(LLM_model_path) and USE_LLM  : missing_files.append(f"LLM_model_path: {                    LLM_model_path}")
    if not os.path.exists(pronunciation_model_path)    : missing_files.append(f"pronunciation_model_path: {pronunciation_model_path}")
    if not os.path.exists(      prosody_model_path)    : missing_files.append(f"prosody_model_path: {            prosody_model_path}")

    if len(missing_files) > 0:
        missing_str = f"Missing required file(s): {'; '.join(missing_files)}"
        logger.error           (missing_str)
        raise FileNotFoundError(missing_str)
    

# =======================================================================
# LLM & Other Models' Settings
# =======================================================================
# For checking the model files are there
current_path = os.path.dirname(os.path.abspath(__file__))

# LLM Parameters
max_length = 256
prompt = "You are an assistant for dementia patients. Provide any response as much short as possible."

try:
    # Get paths to the saved models
    LLM_model_path           = current_path + "/services/Phi-3_finetuned.gguf"
    pronunciation_model_path = current_path + "/services/pronunciation_rf(v4).pkl"
    prosody_model_path       = current_path + "/services/prosody_rf(v1).pkl"

    # Make sure the saved models exist
    check_for_model_files(LLM_model_path, pronunciation_model_path, prosody_model_path)

    # Load the saved LLM model OR use a testing object that just returns sample data
    if USE_LLM:
        from llama_cpp import Llama
        print(Llama.__doc__)
        
        llm = Llama(model_path   = LLM_model_path, 
                    n_ctx        = max_length, 
                    n_threads    = 8,    # was 16 before 
                    n_gpu_layers = -1,   # 0 for CPU
                    verbose      = True,
                )
        
        logger.info("LLM initialized successfully")
    else:
        from .services.llm.dummy_LLM import DummyLLM
        llm = DummyLLM()

except Exception as e:
    logger.error(f"Failed to initialize LLM: {e}")
    raise
