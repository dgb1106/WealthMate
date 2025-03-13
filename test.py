import requests

url = "https://wealthmate.onrender.com/transactions"

payload = {}
headers = {
  'Cookie': 'auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRxdmFiazI5QGdtYWlsLmNvbSIsInN1YiI6IjY4MWExYzhhLTI4YTYtNDFhNS05YzE3LTRmNDBkODMzNWExYyIsImlhdCI6MTc0MTc5MzcyMCwiZXhwIjoxNzQxNzk3MzIwfQ.LkdiSaE8Yd6HyRHU4g6m8o6LTNx3SVes3Mzgk9-azMo'
}

response = requests.request("GET", url, headers=headers, data=payload)

print(response.text)
