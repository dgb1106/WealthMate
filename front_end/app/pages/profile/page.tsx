'use client'

import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout/index';
import ProfileComponents from '@/components/profile/ProfileComponents';

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
      
      // Create the API payload with proper key names
      const apiPayload: any = {};
      
      if (updateForm.name !== profile.name) apiPayload.name = updateForm.name;
      if (updateForm.phone !== profile.phone) apiPayload.phone = updateForm.phone;
      if (updateForm.city !== profile.city) apiPayload.city = updateForm.city;
      if (updateForm.district !== profile.district) apiPayload.district = updateForm.district;
      if (updateForm.job !== profile.job) apiPayload.job = updateForm.job;
      if (updateForm.preferredMood !== profile.preferredMood) apiPayload.preferred_mood = updateForm.preferredMood;
      if (updateForm.preferredGoal !== profile.preferredGoal) apiPayload.preferred_goal = updateForm.preferredGoal;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${profile.id}`, 
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(apiPayload)
        }
      );
      
      if (!response.ok) {
        let errorMessage = 'Unable to update information';
        try {
          const errorData = await response.json();
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

  return (
    <MainLayout>
      <h1>Thông tin cá nhân</h1>
      <ProfileComponents
        profile={profile}
        loading={loading}
        error={error}
        showUpdateModal={showUpdateModal}
        showPasswordModal={showPasswordModal}
        updateForm={updateForm}
        passwordForm={passwordForm}
        updateError={updateError}
        passwordError={passwordError}
        updateSuccess={updateSuccess}
        passwordSuccess={passwordSuccess}
        setShowUpdateModal={setShowUpdateModal}
        setShowPasswordModal={setShowPasswordModal}
        handleUpdateFormChange={handleUpdateFormChange}
        handlePasswordFormChange={handlePasswordFormChange}
        handleUpdateProfile={handleUpdateProfile}
        handleChangePassword={handleChangePassword}
      />
    </MainLayout>
  );
};

export default ProfilePage;