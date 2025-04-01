import csv
from .. import config as cf
import dementia_chat.services.tts as tts

# set API keys
speech_key, service_region = cf.speech_key, cf.service_region
speech_config = cf.speech_config
audio_config = cf.audio_config

# set logger
logger = cf.logging.getLogger("__asr__")


def record_chat():
    mode = "w" if cf.script_check == 1 else "a"
    with open(cf.script_path, encoding="utf-8-sig", newline='', mode=mode) as f:
        writer = csv.writer(f)
        cf.chat_history.sort(key=lambda x: x['Time'])

        if cf.script_check == 1:
            writer.writerow(['Speaker', 'Utt', 'Time'])
        writer.writerow(cf.chat_history[-1].values())
    cf.script_check += 1

