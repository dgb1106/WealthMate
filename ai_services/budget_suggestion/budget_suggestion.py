import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('API_KEY')

genai.configure(api_key=API_KEY)
budget_model = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    system_instruction='Bạn hãy giúp người dùng chia tỷ lệ ngân sách cho từng mục chi tiêu trong tháng này dựa vào thu nhập của họ'
    'Ví dụ: tôi có thu nhập 10000000 VND, tôi dành khoảng 3 triệu cho ăn uống, 3 triệu cho nhà ở, 2 triệu cho tiết kiệm và 2 triệu còn lại cho các mục khác'
    'Hãy trả lời theo dạng: Ăn uống: 3000000 VND, Nhà ở: 3000000 VND, Tiết kiệm: 2000000 VND, Các mục khác: 2000000 VND'
    'Chỉ trả lời theo dạng trên mà không kèm theo từ nào khác, chỉ gồm những danh mục trên'
    'Hãy trả lời với bối cảnh là cá nhân đang sinh sống tại thành phố Hà Nội'
)

def budget_suggestion(income):
    prompt = (
        f"Người dùng có thu nhập là {income} VND, hãy giúp họ chia tỷ lệ ngân sách cho từng mục chi tiêu trong tháng này"
    )
    try:
        response = budget_model.generate_content(
            contents=prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 100
            }
        )
        suggestion = response.text.strip()
    except Exception as e:
        suggestion = f'Lỗi trong quá trình xử lý: {e}'
    return suggestion