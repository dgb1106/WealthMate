'use client'

import React from 'react';
import styles from './styles.module.css';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  show: boolean;
  onClose: () => void;
  passwordForm: PasswordFormData;
  passwordError: string;
  passwordSuccess: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  show,
  onClose,
  passwordForm,
  passwordError,
  passwordSuccess,
  onFormChange,
  onSubmit
}) => {
  // This is critical - if not showing, return null
  if (!show) return null;

  // When show is true, render the modal
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        {/* Rest of modal content */}
        <div className={styles.modalHeader}>
          <h3>Change password</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">Current Password:</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={onFormChange}
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
              onChange={onFormChange}
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
              onChange={onFormChange}
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
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;