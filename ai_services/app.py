from flask import Flask, request, jsonify
import pandas as pd
from expense_forecast.Expense_Forecasting import get_input_data, forecast_expense, model_fit, df
from chatbot.chatbot import extract_amount, classify_transaction, chat

app = Flask(__name__)

@app.route('/monthly_expense_prediction', methods=['POST'])
def predict():
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
def classify():
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

if __name__ == '__main__':
    app.run(debug=True)
