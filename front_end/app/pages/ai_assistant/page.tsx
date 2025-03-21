'use client';

import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import styles from './styles.module.css';

type ChatMessage = {
  type: 'user' | 'bot';
  content: string;
  isLoading?: boolean;
};

const AiAssistantPage: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [preferredMood, setPreferredMood] = useState<string>('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          console.log('Không tìm thấy authToken');
          return;
        }

        console.log('Đang lấy thông tin người dùng...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        console.log('API URL:', apiUrl);

        const response = await fetch(`${apiUrl}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Profile API status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Profile data:', data);
          
          localStorage.setItem('preferredMood', data.preferredMood || 'neutral');
          setPreferredMood(data.preferredMood || 'neutral');
        } else {
          console.error('Lỗi khi lấy thông tin người dùng:', response.statusText);
          localStorage.setItem('preferredMood', 'neutral');
        }
      } catch (error) {
        console.error('Lỗi kết nối khi lấy thông tin người dùng:', error);
        localStorage.setItem('preferredMood', 'neutral');
      }
    };

    fetchUserProfile();
    return () => {
      localStorage.removeItem('preferredMood');
    };
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const currentUserInput = userInput;
    setUserInput('');
    setChatHistory((prev) => [
      ...prev,
      { type: 'user', content: currentUserInput },
    ]);
    setChatHistory((prev) => [
      ...prev,
      { type: 'bot', content: 'Đang nhập...', isLoading: true },
    ]);
    
    setIsLoading(true);
    
    try {
      const currentMood = localStorage.getItem('preferredMood') || 'neutral';
      console.log('Đang gửi tin nhắn với mood:', currentMood);
      console.log('Tin nhắn người dùng:', currentUserInput);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/ai-utils/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ 
          mood: currentMood, 
          message: currentUserInput 
        }),
      });

      console.log('Chat API status:', response.status);
      setChatHistory((prev) => prev.filter(msg => !msg.isLoading));

      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
        const botReply = data.reply || data.response || data.message || 'Không có phản hồi từ server';
        
        setChatHistory((prev) => [
          ...prev,
          { type: 'bot', content: botReply },
        ]);
      } else {
        console.error('Lỗi từ API:', response.statusText);
        setChatHistory((prev) => [
          ...prev,
          { type: 'bot', content: `Có lỗi xảy ra! (${response.status})` },
        ]);
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      setChatHistory((prev) => prev.filter(msg => !msg.isLoading));
      
      setChatHistory((prev) => [
        ...prev,
        { type: 'bot', content: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
    handleSendMessage();
  };

  return (
    <MainLayout>
      <h1>Trợ Lý Ảo</h1>
      <div className={styles.mainContent}>
        {/* Các nút gợi ý */}
        <div className={styles.suggestions}>
          <button
            className={styles.suggestionButton}
            onClick={() => handleSuggestionClick('Dự đoán giá Bitcoin')}
            disabled={isLoading}
          >
            Dự đoán giá Bitcoin
          </button>
          <button
            className={styles.suggestionButton}
            onClick={() => handleSuggestionClick('Mục tiêu cho dự án mới')}
            disabled={isLoading}
          >
            Lời khuyên về tiết kiệm
          </button>
          <button
            className={styles.suggestionButton}
            onClick={() => handleSuggestionClick('Lời khuyên về tiết kiệm')}
            disabled={isLoading}
          >
            Lời khuyên về tiết kiệm
          </button>
          <button
            className={styles.suggestionButton}
            onClick={() => handleSuggestionClick('Lời khuyên về thiết lập ngân sách')}
            disabled={isLoading}
          >
            Lời khuyên về thiết lập ngân sách
          </button>
        </div>

        {/* Khu vực hiển thị chat */}
        <div className={styles.chatBox} ref={chatBoxRef}>
          {chatHistory.length === 0 ? (
            <p className={styles.emptyChat}>Hãy nhập câu hỏi của bạn ở đây...</p>
          ) : (
            chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`${styles.messageContainer} ${msg.type === 'user' ? styles.userMessage : styles.botMessage} ${msg.isLoading ? styles.loading : ''}`}
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
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Nhập câu hỏi..."
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
          >
            {isLoading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AiAssistantPage;
