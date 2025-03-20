'use client'

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
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

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [updateForm, setUpdateForm] = useState<Partial<UserProfile>>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateError, setUpdateError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
          setError('Please log in to view information');
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
          throw new Error('Unable to retrieve user information');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError('An error occurred while retrieving information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setUpdateForm({
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        district: profile.district,
        job: profile.job,
        preferredMood: profile.preferredMood,
        preferredGoal: profile.preferredGoal,
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        setUpdateError('Please log in to update information');
        return;
      }

      if (!profile?.id) {
        setUpdateError('User information not found');
        return;
      }
      const updatePayload: Partial<UserProfile> = {};
      if (updateForm.name !== profile.name) updatePayload.name = updateForm.name;
      if (updateForm.phone !== profile.phone) updatePayload.phone = updateForm.phone;
      if (updateForm.city !== profile.city) updatePayload.city = updateForm.city;
      if (updateForm.district !== profile.district) updatePayload.district = updateForm.district;
      if (updateForm.job !== profile.job) updatePayload.job = updateForm.job;
      if (updateForm.preferredMood !== profile.preferredMood) updatePayload.preferredMood = updateForm.preferredMood;
      if (updateForm.preferredGoal !== profile.preferredGoal) updatePayload.preferredGoal = updateForm.preferredGoal;
      console.log('Sending update with data:', updatePayload);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${profile.id}`, 
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        }
      );
      
      if (!response.ok) {
        let errorMessage = 'Unable to update information';
        try {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('Error status:', response.status, response.statusText);
        }
        throw new Error(errorMessage);
      }
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setUpdateSuccess('Information updated successfully!');
      
      setTimeout(() => {
        setShowUpdateModal(false);
        setUpdateSuccess('');
      }, 1000);
      
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while updating information';
      setUpdateError(errorMessage);
      console.error('Update profile error:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        setPasswordError('Please log in to change password');
        return;
      }
      
      const userId = profile?.id;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unable to change password');
      }
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 500);
      
    } catch (err: any) {
      setPasswordError(err.message || 'An error occurred while changing password');
      console.error(err);
    }
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
        <h1 className={styles.profileTitle}>Personal information</h1>
        
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
                  <h3 className={styles.sectionTitle}>Contact Information</h3>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{profile.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phone Number:</span>
                    <span className={styles.infoValue}>{profile.phone}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Address:</span>
                    <span className={styles.infoValue}>{profile.district}, {profile.city}</span>
                  </div>
                </div>
                
                <div className={styles.infoGroup}>
                  <h3 className={styles.sectionTitle}>Financial Information</h3>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Primary Financial Goal:</span>
                    <span className={styles.infoValue}>{profile.preferredGoal}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Preferred Feedback Style:</span>
                    <span className={styles.infoValue}>{profile.preferredMood}</span>
                  </div>
                </div>
                
                {/* Thêm phần buttons cho cập nhật thông tin và đổi mật khẩu */}
                <div className={styles.actionButtons}>
                  <button 
                    className={`${styles.actionButton} ${styles.updateButton}`}
                    onClick={() => setShowUpdateModal(true)}
                  >
                    Update information
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.passwordButton}`}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div> {/* end splitWrapper */}
        
        {/* Update Profile Modal */}
        {showUpdateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Update Information</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowUpdateModal(false)}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleUpdateProfile}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={updateForm.name || ''}
                    onChange={handleUpdateFormChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number:</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={updateForm.phone || ''}
                    onChange={handleUpdateFormChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="job">Occupation:</label>
                  <input
                    type="text"
                    id="job"
                    name="job"
                    value={updateForm.job || ''}
                    onChange={handleUpdateFormChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="city">City:</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={updateForm.city || ''}
                    onChange={handleUpdateFormChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="district">District:</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={updateForm.district || ''}
                    onChange={handleUpdateFormChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="preferredMood">Preferred Feedback Style:</label>
                  <select
                    id="preferredMood"
                    name="preferredMood"
                    value={updateForm.preferredMood || ''}
                    onChange={handleUpdateFormChange}
                    className={styles.selectField}
                  >
                    <option value="">Select feedback style</option>
                    <option value={PreferredMood.ENCOURAGEMENT}>Encouraging</option>
                    <option value={PreferredMood.IRRITATION}>Direct/Strict</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="preferredGoal">Primary Financial Goal:</label>
                  <select
                    id="preferredGoal"
                    name="preferredGoal"
                    value={updateForm.preferredGoal || ''}
                    onChange={handleUpdateFormChange}
                    className={styles.selectField}
                  >
                    <option value="">Select primary goal</option>
                    <option value={PreferredGoal.SAVING}>Saving Money</option>
                    <option value={PreferredGoal.INVESTMENT}>Growing Investments</option>
                  </select>
                </div>
                
                {updateError && <p className={styles.errorMessage}>{updateError}</p>}
                {updateSuccess && <p className={styles.successMessage}>{updateSuccess}</p>}
                
                <div className={styles.modalActions}>
                  <button type="submit" className={styles.submitButton}>
                    Update
                  </button>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setShowUpdateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Change password</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowPasswordModal(false)}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleChangePassword}>
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword">Current Password:</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password:</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm New Password:</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFormChange}
                    required
                  />
                </div>
                
                {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                {passwordSuccess && <p className={styles.successMessage}>{passwordSuccess}</p>}
                
                <div className={styles.modalActions}>
                  <button type="submit" className={styles.submitButton}>
                    Đổi mật khẩu
                  </button>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
