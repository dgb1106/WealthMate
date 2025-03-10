import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX

df = pd.read_csv('sample_data_extended.csv')

def preprocess_data(df):
    df = df.dropna()
    # Set the time column as the index
    df['Time'] = pd.to_datetime(df['Time'])
    df = df.set_index('Time')
    # convert string to float and remove commas
    df['Total expense (VND)'] = df['Total expense (VND)'].str.replace(',', '').astype(float)
    df['Income (VND)'] = df['Income (VND)'].str.replace(',', '').astype(float)
    return df

def plot_data(df):
    plt.figure(figsize=(10, 6))
    plt.plot(df['Total expense (VND)'], label='Total expense (VND)')
    plt.plot(df['Income (VND)'], label='Income (VND)')
    plt.legend(loc='best')
    plt.show()
    
def fit_model(df):
    # define the output and exxogenous variables
    y = df['Total expense (VND)']
    exog = df[['Income (VND)', 'Interest rate (%)', 'Inflation rate (%)', 'Holidays']]
    # define orders for the model
    order = (1, 1, 1)
    seasonal_order = (1, 1, 1, 12)
    # fit the model
    model = SARIMAX(y, exog=exog, order=order, seasonal_order=seasonal_order)
    model_fit = model.fit()
    return model_fit

def get_input_data(income, interest_rate, inflation_rate, holidays):
    input_data = pd.DataFrame({
        'Income (VND)': [income],
        'Interest rate (%)': [interest_rate],
        'Inflation rate (%)': [inflation_rate],
        'Holidays': [holidays]
    })
    return input_data

def forecast_expense(model_fit, input_data, df):
    forecast = model_fit.predict(start=len(df), end=len(df), exog=input_data)
    return forecast.iloc[0]

df = preprocess_data(df)
model_fit = fit_model(df)

# def main():
#     global df
#     df = preprocess_data(df)
#     model_fit = fit_model(df)
#     input_data = get_input_data(10000000, 5, 3, 0)
#     forecast = forecast_expense(model_fit, input_data)
#     print(forecast)

# if __name__ == '__main__':
#     main()