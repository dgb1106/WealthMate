from flask import Flask, request, jsonify
import pandas as pd
from Expense_Forcasting import get_input_data, forecast_expense, model_fit, df

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

if __name__ == '__main__':
    app.run(debug=True)
