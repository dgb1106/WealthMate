from flask import Flask, request, jsonify
import pandas as pd
from expense_forecast.Expense_Forecasting import get_input_data, forecast_expense, model_fit, df
from chatbot.chatbot import extract_amount, classify_transaction, chat
from speech_transcribe.speech_transcribe import transcribe_file
from budget_suggestion.budget_suggestion import budget_suggestion
from read_image.scan_bills import scan_bills
import os

app = Flask(__name__)

@app.route('/monthly_expense_prediction', methods=['POST'])
def handle_predict():
    data = request.get_json()
    input_data = get_input_data(
        data['Income (VND)'], 
        data['Interest rate (%)'], 
        data['Inflation rate (%)'], 
        data['Holidays']
    )
    forecast = forecast_expense(model_fit, input_data, df)
    return jsonify({'forecasted_expense': forecast})

@app.route('/transaction_classification', methods=['POST'])
def handle_classify():
    data = request.get_json()
    result = classify_transaction(data['prompt'])
    return jsonify(result)

@app.route('/chat', methods=['POST'])
def chat_with_user():
    data = request.get_json()
    mood = data['mood']
    prompt = data['prompt']
    response = chat(mood, prompt)
    return jsonify({'response': response})

@app.route('/speech_transcribe', methods=['POST'])
def handle_transcribe_speech():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    temp_path = 'temp_audio.wav'
    file.save(temp_path)
    try:
        transcription = transcribe_file(temp_path)
        return jsonify({'transcription': transcription})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
@app.route('/suggest_budget', methods=['POST'])
def handle_suggest_budget():
    data = request.get_json()
    amount = extract_amount(data['income'])
    suggestion_text = budget_suggestion(amount)
    budget_dict = {}
    items = suggestion_text.split(',')
    for item in items:
        if ':' in item:
            key, value = item.split(':')
            budget_dict[key.strip()] = value.strip()
    return jsonify(budget_dict)

@app.route('/scan_bills', methods=['POST'])
def handle_scan_bills():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    temp_path = 'temp_image.jpg'
    file.save(temp_path)
    try:
        result = scan_bills(temp_path)
        key, value = result.split(':')
        value = value.strip()
        result_dict = {}
        result_dict[key] = value
        return jsonify(result_dict)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
if __name__ == '__main__':
    app.run(debug=True)
