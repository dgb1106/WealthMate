import torch
from transformers import AutoProcessor, AutoModelForCTC
import librosa

processor = AutoProcessor.from_pretrained("nguyenvulebinh/wav2vec2-base-vietnamese-250h")
model = AutoModelForCTC.from_pretrained("nguyenvulebinh/wav2vec2-base-vietnamese-250h")

def transcribe(audio_data, sampling_rate):
    if len(audio_data.shape) > 1:
        audio_data = audio_data.mean(axis=1)
        
    if sampling_rate != 16000:
        raise ValueError("Sampling rate phải là 16 kHz")
    
    inputs = processor(audio_data, 
                       sampling_rate=sampling_rate, 
                       return_tensors="pt", 
                       padding="longest")
    
    with torch.no_grad():
        logits = model(input_values=inputs.input_values).logits
    
    predicted_ids = torch.argmax(logits, dim=-1)
    
    transcription = processor.batch_decode(predicted_ids)
    
    return transcription[0]

def transcribe_file(file_path):
    audio_data, sampling_rate = librosa.load(file_path, sr=16000)
    return transcribe(audio_data, sampling_rate)

# if __name__ == "__main__":
#     file_path = "vn.wav"
#     result = transcribe_file(file_path)
#     print(result)