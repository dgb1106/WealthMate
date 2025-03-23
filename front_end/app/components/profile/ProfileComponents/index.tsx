'use client'

import React from 'react';
import styles from './styles.module.css';
import CatDisplay from '../CatDisplay';
import InfoCard from '../InfoCard';
import UpdateProfileModal from '../UpdateProfileModal';
import ChangePasswordModal from '../ChangePasswordModal';

interface ProfileComponentsProps {
  profile: any;
  loading: boolean;
  error: string;
  showUpdateModal: boolean;
  showPasswordModal: boolean;
  updateForm: any;
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  updateError: string;
  passwordError: string;
  updateSuccess: string;
  passwordSuccess: string;
  setShowUpdateModal: (show: boolean) => void;
  setShowPasswordModal: (show: boolean) => void;
  handleUpdateFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handlePasswordFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  handleChangePassword: (e: React.FormEvent) => void;
}

const ProfileComponents: React.FC<ProfileComponentsProps> = ({
  profile,
  loading,
  error,
  showUpdateModal,
  showPasswordModal,
  updateForm,
  passwordForm,
  updateError,
  passwordError,
  updateSuccess,
  passwordSuccess,
  setShowUpdateModal,
  setShowPasswordModal,
  handleUpdateFormChange,
  handlePasswordFormChange,
  handleUpdateProfile,
  handleChangePassword
}) => {
  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  if (!profile) {
    return <div className={styles.errorContainer}>User profile not found</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.splitWrapper}>
        <CatDisplay currentBalance={profile.currentBalance} />
        
        <InfoCard 
          profile={profile}
          onUpdateClick={() => setShowUpdateModal(true)}
          onPasswordClick={() => setShowPasswordModal(true)}
        />
      </div>

      {/* Modals should be here at the root level */}
      <UpdateProfileModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        updateForm={updateForm}
        updateError={updateError}
        updateSuccess={updateSuccess}
        onFormChange={handleUpdateFormChange}
        onSubmit={handleUpdateProfile}
      />

      <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        passwordForm={passwordForm}
        passwordError={passwordError}
        passwordSuccess={passwordSuccess}
        onFormChange={handlePasswordFormChange}
        onSubmit={handleChangePassword}
      />
    </div>
  );
};

export default ProfileComponents;