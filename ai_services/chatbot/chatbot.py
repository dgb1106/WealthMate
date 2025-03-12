import google.generativeai as genai
import re
import enum
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('API_KEY')

class TransactionCategory(enum.Enum):
    EATING = "Ăn uống"
    HOUSING = "Nhà ở"
    TRANSPORT = "Di chuyển"
    EDUCATION = "Giáo dục"
    GIFTS = "Quà tặng"
    BILLS = "Hóa đơn & Tiện ích"
    SHOPPING = "Mua sắm"
    BEAUTY = "Làm đẹp"
    FAMILY = "Gia đình"
    PETS = "Vật nuôi"
    HEALTH = "Sức khỏe"
    ENTERTAINMENT = "Giải trí"
    WORK = "Công việc"
    INSURANCE = "Bảo hiểm"
    OTHER = "Các chi phí khác"
    DEBT = "Trả nợ"
    SPORTS = "Thể thao"
    INVESTMENT = "Đầu tư"
    SALARY = "Lương"
    OTHER_INCOME = "Thu nhập khác"
    UNKNOWN = "Không xác định"

class Mood(enum.Enum):
    IRRITATION = 'Tức giận'
    ECOURAGEMENT = 'Khích lệ'

categories = ', '.join([c.value for c in TransactionCategory])

genai.configure(api_key=API_KEY)
category_classification_model = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    system_instruction='Bạn cần giúp tôi phân loại giao dịch từ danh sách có sẵn'
)

def extract_amount(prompt):
    match = re.search(r'(\d+)\s*(k|K)?', prompt)
    if match:
        amount = int(match.group(1))
        if match.group(2):
            amount *= 1000
        return amount
    return None

def classify_transaction(prompt):
    if not prompt:
        return {'amount': None, 'category': TransactionCategory.UNKNOWN.value}
    amount = extract_amount(prompt)
    llm_prompt = (
        f" Dựa vào mô tả giao dịch từ người dùng {prompt}, hãy xác định xem đây thuộc loại giao dịch nào trong danh sách này: {categories} "
        "Ví dụ, nếu mô tả là 'Ăn sáng 20k' thì có nghĩa là đây là giao dịch thuộc loại 'Ăn uống' với số tiền là 20.000đ "
        "Nếu không xác định được, hãy cho nó vào danh mục 'Các chi phí khác' "
        "Nếu hoàn toàn không phải bất cứ giao dịch thu hoặc chi nào, hãy trả lời 'Không xác định' "
        "Chú ý: chỉ trả về tên loại giao dịch chứ không trả về số tiền hay bất cứ từ nào khác "
    )
    try:
        response = category_classification_model.generate_content(
            contents=llm_prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 100
            }
        )
        category = response.text.strip()
    except Exception as e:
        category = f'Lỗi trong quá trình xử lý: {e}'
    return {
        "amount" : amount,
        "category" : category
    }
    
chat_model = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    system_instruction='Bạn là một trợ lý ảo trong việc quản lý tài chính cá nhân, hãy đưa ra một vài nhận xét về giao dịch của người dùng hoặc lời khuyên có ích '
    'Nếu như mô tả của người dùng không phải thuộc lĩnh vực này, hãy trả lời "Tôi không thể trả lời dựa trên thông tin bạn cung cấp"'
)

def chat(mood, prompt):
    llm_prompt = (
        f'Bạn có trách nhiệm trò chuyện cùng người dùng, bạn phải tỏ ra {mood} '
        'Bạn chỉ đưa ra phản hồi, không hỏi thêm gì từ người dùng.'
    )
    try:
        response = chat_model.generate_content(
            contents=llm_prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 100
            }
        )
        return response.text.strip()
    except Exception as e:
        return f'Lỗi trong quá trình xử lý: {e}'

# input = 'ăn sáng 20k'
# result = classify_transaction(input)
# print(result)
# response = chat(mood=Mood.IRRITATION.value, prompt=input)
# print(response)