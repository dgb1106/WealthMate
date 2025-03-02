from flask import Flask, request, render_template
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import librosa
from io import BytesIO

app = Flask(__name__)

# Load model và processor
model_name = 'openai/whisper-large-v3-turbo'
processor = WhisperProcessor.from_pretrained(model_name)
model = WhisperForConditionalGeneration.from_pretrained(model_name)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Kiểm tra xem có file audio được tải lên không
        if 'audio' not in request.files:
            return render_template('index.html', error="Không tìm thấy file audio. Vui lòng tải lên file audio!")
        audio_file = request.files['audio']
        try:
            # Đọc file audio vào bộ nhớ
            audio_bytes = audio_file.read()
            # Load file audio và resample về 16 kHz (yêu cầu của Whisper)
            audio_data, sr = librosa.load(BytesIO(audio_bytes), sr=16000)
            
            # Xử lý file audio thành input features
            input_features = processor(audio_data, sampling_rate=sr, return_tensors="pt").input_features
            
            # Sinh văn bản từ audio (có thể điều chỉnh tham số generation nếu cần)
            predicted_ids = model.generate(input_features)
            transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)
            result = transcription[0]
            
            return render_template('index.html', result=result)
        except Exception as e:
            return render_template('index.html', error=str(e))
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)