'use client'

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import styles from './styles.module.css';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  job: string;
  preferredMood: string;
  preferredGoal: string;
  currentBalance: number;
  fullAddress: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
          setError('Vui lòng đăng nhập để xem thông tin');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Không thể lấy thông tin người dùng');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError('Đã có lỗi xảy ra khi lấy thông tin');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <p>Đang tải thông tin...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <p>Không tìm thấy thông tin người dùng</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.profileContainer}>
        <h1 className={styles.profileTitle}>Thông tin cá nhân</h1>
        
        {/* 
          .splitWrapper: Chia 2 cột 
          - .catColumn: chứa mèo 
          - .infoColumn: chứa card thông tin 
        */}
        <div className={styles.splitWrapper}>
          
          {/* CỘT MÈO */}
          <div className={styles.catColumn}>
            <div className={styles.cat}>
              <div className={styles.body}></div>
              <div className={styles["body-merge"]}></div>
              <div className={styles["ear-left"]}></div>
              <div className={styles["ear-right"]}></div>
              <div className={`${styles["eye"]} ${styles["eye__left"]}`}></div>
              <div className={`${styles["eye"]} ${styles["eye__right"]}`}></div>
              <div className={styles["mouth-left"]}></div>
              <div className={styles["mouth-right"]}></div>
              <div className={`${styles["paw"]} ${styles["paw__left"]}`}>
                <div className={`${styles["paw-detail-small"]} ${styles["paw-detail__top"]}`}></div>
                <div className={`${styles["paw-detail-small"]} ${styles["paw-detail__left"]}`}></div>
                <div className={`${styles["paw-detail-small"]} ${styles["paw-detail__right"]}`}></div>
                <div className={`${styles["paw-detail-large"]} ${styles["paw-detail__bottom"]}`}></div>
              </div>
              <div className={styles["paw-right-down"]}></div>
              <div className={styles["paw-merge-right"]}></div>
              <div className={styles["desk"]}></div>
              
              {/* Hiển thị số dư trên desk */}
              <div className={`${styles.balanceOnDesk} ${profile.currentBalance < 0 ? styles.balanceNegative : styles.balancePositive}`}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(profile.currentBalance * 1000)}
              </div>
            </div>
          </div>
          
          {/* CỘT THÔNG TIN */}
          <div className={styles.infoColumn}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <h2 className={styles.profileName}>{profile.name}</h2>
                <p className={styles.profileJob}>{profile.job}</p>
              </div>
              
              <div className={styles.profileContent}>
                <div className={styles.infoGroup}>
                  <h3 className={styles.sectionTitle}>Thông tin liên hệ</h3>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{profile.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Số điện thoại:</span>
                    <span className={styles.infoValue}>{profile.phone}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Địa chỉ:</span>
                    <span className={styles.infoValue}>{profile.district}, {profile.city}</span>
                  </div>
                </div>
                
                <div className={styles.infoGroup}>
                  <h3 className={styles.sectionTitle}>Thông tin tài chính</h3>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Mục tiêu:</span>
                    <span className={styles.infoValue}>{profile.preferredGoal}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Tâm trạng ưa thích:</span>
                    <span className={styles.infoValue}>{profile.preferredMood}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div> {/* end splitWrapper */}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
