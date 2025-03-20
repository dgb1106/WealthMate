'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import styles from './styles.module.css';

// Định nghĩa kiểu dữ liệu cho tin nhắn chat
type ChatMessage = {
  type: 'user' | 'bot';
  content: string;
};

const AiAssistantPage: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [preferredMood, setPreferredMood] = useState<string>('neutral');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferredMood(data.preferredMood);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSendMessage = async () => {
    if (!userInput) return;
    
    // Thêm tin nhắn của người dùng vào lịch sử
    setChatHistory((prev) => [
      ...prev,
      { type: 'user', content: userInput },
    ]);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-utils/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mood: preferredMood, message: userInput }),
    });

    if (response.ok) {
      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { type: 'bot', content: data.reply },
      ]);
    } else {
      setChatHistory((prev) => [
        ...prev,
        { type: 'bot', content: 'Có lỗi xảy ra!' },
      ]);
    }

    setUserInput('');
  };

  return (
    <MainLayout>
      {/* Chỉ code phần nội dung AI Assistant*/}
      <div className={styles.mainContent}>
        {/* Các nút gợi ý */}
        <div className={styles.suggestions}>
          <button
            className={styles.suggestionButton}
            onClick={() => setUserInput('Bitcoin Prediction')}
          >
            Bitcoin Prediction
          </button>
          <button
            className={styles.suggestionButton}
            onClick={() => setUserInput('Goals for New Setup')}
          >
            Goals for New Setup
          </button>
          <button
            className={styles.suggestionButton}
            onClick={() => setUserInput('Savings Advice')}
          >
            Savings Advice
          </button>
          <button
            className={styles.suggestionButton}
            onClick={() => setUserInput('Budget Setup Advice')}
          >
            Budget Setup Advice
          </button>
        </div>

        {/* Khu vực hiển thị chat */}
        <div className={styles.chatBox}>
          {chatHistory.length === 0 ? (
            <p className={styles.emptyChat}>Hãy nhập câu hỏi của bạn ở đây...</p>
          ) : (
            chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`${styles.messageContainer} ${msg.type === 'user' ? styles.userMessage : styles.botMessage}`}
              >
                <div className={styles.messageContent}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ô nhập và nút gửi */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Nhập câu hỏi..."
          />
          <button onClick={handleSendMessage}>Gửi</button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AiAssistantPage;
