'use client';

import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import styles from './styles.module.css';
import { Button, Modal, message } from 'antd';
import { AudioOutlined, UploadOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

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

  // Các state mới cho voice & image
  const [isRecording, setIsRecording] = useState(false);
  const [recordingNotification, setRecordingNotification] = useState<any>(null);

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

  // --- Hàm Upload hình ảnh ---
  const handleUploadImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const imageData = event.target?.result as string;
          
          try {
            // Lưu ảnh tạm vào localStorage (nếu cần)
            localStorage.setItem('tempTransactionImage', imageData);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-utils/image-to-transaction`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ image: imageData }),
            });
  
            if (!response.ok) {
              throw new Error('Failed to process image');
            }
  
            const transactionData = await response.json();
            // Thay vì gọi form và modal của transaction, ta hiển thị modal với thông tin trả về
            Modal.info({
              title: 'Image Processed',
              content: (
                <div>
                  <p><strong>Description:</strong> {transactionData.description}</p>
                  <p><strong>Amount:</strong> {transactionData.amount}</p>
                  <p><strong>Category ID:</strong> {transactionData.categoryId}</p>
                </div>
              ),
              width: 600,
              okText: 'Close',
            });
            message.success('Image processed successfully');
          } catch (error) {
            console.error('Error processing image:', error);
            message.error('Failed to process image');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  // --- Hàm ghi âm voice ---
  const handleVoiceRecord = async () => {
    try {
      if (!isRecording) {
        // Bắt đầu ghi âm
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm', 
          audioBitsPerSecond: 128000
        });
        
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        });
        
        mediaRecorder.addEventListener('stop', async () => {
          try {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const wavBlob = await audioBufferToWav(audioBuffer);
            
            const formData = new FormData();
            formData.append('file', wavBlob, 'audio.wav');
            
            const loadingMessage = message.loading('Processing audio...', 0);
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-utils/speech-to-text`, {
              method: 'POST',
              body: formData,
            });
            
            loadingMessage();
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Server error response:', errorText);
              throw new Error(`Failed to process audio: ${response.status}`);
            }
  
            const data = await response.json();
            const text = data.text || data.transcription || data.result || "No text returned";
          
            Modal.info({
              title: 'Transcribed Text',
              content: text,
              width: 600,
              okText: 'Close',
            });
            
            message.success('Audio processed successfully');
          } catch (error) {
            console.error('Error processing audio:', error);
            message.error('Failed to process audio');
          }
        });
        
        mediaRecorder.start(10);
        
        const notification = message.loading('Recording... Press the Voice button again to stop', 0);
        setRecordingNotification(notification);
        (window as any).currentRecorder = mediaRecorder;
        setIsRecording(true);
      } else {
        const mediaRecorder = (window as any).currentRecorder;
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          mediaRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          (window as any).currentRecorder = null;
        }
        
        if (recordingNotification) {
          recordingNotification();
        }
        
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      message.error('Could not access microphone');
      setIsRecording(false);
    }
  };

  // --- Hàm phụ trợ chuyển AudioBuffer sang WAV ---
  function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
    return new Promise(resolve => {
      const numChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = 16;
      
      const bytesPerSample = bitDepth / 8;
      const blockAlign = numChannels * bytesPerSample;
      
      const dataLength = buffer.length * blockAlign;
      const bufferLength = 44 + dataLength;
      
      const arrayBuffer = new ArrayBuffer(bufferLength);
      const view = new DataView(arrayBuffer);
      
      // RIFF identifier
      writeString(view, 0, 'RIFF');
      // RIFF chunk length
      view.setUint32(4, 36 + dataLength, true);
      // RIFF type
      writeString(view, 8, 'WAVE');
      // format chunk identifier
      writeString(view, 12, 'fmt ');
      // format chunk length
      view.setUint32(16, 16, true);
      // sample format (raw)
      view.setUint16(20, format, true);
      // channel count
      view.setUint16(22, numChannels, true);
      // sample rate
      view.setUint32(24, sampleRate, true);
      // byte rate (sample rate * block align)
      view.setUint32(28, sampleRate * blockAlign, true);
      // block align (channel count * bytes per sample)
      view.setUint16(32, blockAlign, true);
      // bits per sample
      view.setUint16(34, bitDepth, true);
      // data chunk identifier
      writeString(view, 36, 'data');
      // data chunk length
      view.setUint32(40, dataLength, true);
      
      // Ghi dữ liệu PCM
      const channels = [];
      for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
      }
      
      let offset = 44;
      for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, channels[channel][i]));
          const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          
          view.setInt16(offset, value, true);
          offset += 2;
        }
      }
      
      const wavBlob = new Blob([view], { type: 'audio/wav' });
      resolve(wavBlob);
    });
  }
  
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  return (
    <MainLayout>
      <div className={styles.mainContent}>
        {/* Thêm 2 nút mới cho Upload và Voice */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <Button icon={<UploadOutlined />} onClick={handleUploadImage}>
            Upload
          </Button>
          <Button 
            icon={<AudioOutlined />} 
            onClick={handleVoiceRecord}
            className={isRecording ? styles.recordingButton : ''}
          >
            {isRecording ? 'Stop' : 'Voice'}
          </Button>
        </div>

        {/* Các nút gợi ý hiện có */}
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
                  {msg.type === 'bot' && /[#_*~`]/.test(msg.content) ? (
                    <ReactMarkdown components={{
                      p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                      strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold' }} {...props} />,
                      ul: ({ node, ...props }) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ margin: '4px 0' }} {...props} />,
                    }}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
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
