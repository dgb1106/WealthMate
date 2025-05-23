'use client'

import React from 'react';
import styles from './styles.module.css';

enum PreferredMood {
  ENCOURAGEMENT = 'ENCOURAGEMENT',
  IRRITATION = 'IRRITATION'
}

enum PreferredGoal {
  SAVING = 'SAVING',
  INVESTMENT = 'INVESTMENT'
}

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

interface InfoCardProps {
  profile: UserProfile;
  onUpdateClick: () => void;
  onPasswordClick: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ profile, onUpdateClick, onPasswordClick }) => {
  return (
    <div className={styles.infoColumn}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <h2 className={styles.profileName}>{profile.name}</h2>
          <p className={styles.profileJob}>{profile.job}</p>
        </div>
        
        <div className={styles.profileContent}>
          <div className={styles.infoGroup}>
            <h3 className={styles.sectionTitle}>Thông tin liên lạc</h3>
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
              <span className={styles.infoLabel}>Mục tiêu tài chính:</span>
              <span className={styles.infoValue}>
                {profile.preferredGoal === PreferredGoal.SAVING ? 'Saving Money' : 
                 profile.preferredGoal === PreferredGoal.INVESTMENT ? 'Growing Investments' : 
                 profile.preferredGoal}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phong cách phản hồi:</span>
              <span className={styles.infoValue}>
                {profile.preferredMood === PreferredMood.ENCOURAGEMENT ? 'Encouraging' : 
                 profile.preferredMood === PreferredMood.IRRITATION ? 'Direct/Strict' : 
                 profile.preferredMood}
              </span>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.actionButton} ${styles.updateButton}`}
              onClick={onUpdateClick}
            >
              Cập nhật Thông tin
            </button>
            <button 
              className={`${styles.actionButton} ${styles.passwordButton}`}
              onClick={onPasswordClick}
            >
              Thay đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;