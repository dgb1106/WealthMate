import google.generativeai as genai
import PIL.Image
import os
from dotenv import load_dotenv
from chatbot.transaction_categories import TransactionCategory

load_dotenv()

API_KEY = os.getenv('API_KEY')

categories = ', '.join([c.value for c in TransactionCategory])

genai.configure(api_key=API_KEY)
scan_model = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    system_instruction='Hãy giúp tôi quét hóa đơn và trích xuất thông tin từ hóa đơn này'
    f'Hãy giúp tôi phân loại giao dịch từ danh sách có sẵn: {categories} và cho tôi biết số tiền của giao dịch đó'
    'Ví dụ: Mua sắm 200000 VND'
    'Chỉ trả lời theo dạng: Tên danh mục: số tiền VND'
)

def scan_bills(image_path):
    organ = PIL.Image.open(image_path)
    try:
        response = scan_model.generate_content(
            contents=[organ],
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 100
            }
        )
        result = response.text.strip()
    except Exception as e:
        result = f'Lỗi trong quá trình xử lý: {e}'
    return result

# if __name__ == '__main__':
#     path = r'C:\Users\duong\Documents\UET-VNU\K68-CS1\HKII_2024-2025\Software_Engineering\ai_services\read_image\test.jpg'
#     print(scan_bills(path))