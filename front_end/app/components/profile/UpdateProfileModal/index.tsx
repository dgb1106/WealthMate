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

interface UpdateFormData {
  name?: string;
  phone?: string;
  city?: string;
  district?: string;
  job?: string;
  preferredMood?: string;
  preferredGoal?: string;
}

interface UpdateProfileModalProps {
  show: boolean;
  onClose: () => void;
  updateForm: UpdateFormData;
  updateError: string;
  updateSuccess: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  show,
  onClose,
  updateForm,
  updateError,
  updateSuccess,
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
          <h3>Cập nhật Thông tin</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Tên đầy đủ:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={updateForm.name || ''}
              onChange={onFormChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="phone">Số điện thoại:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={updateForm.phone || ''}
              onChange={onFormChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="job">Nghề nghiệp:</label>
            <input
              type="text"
              id="job"
              name="job"
              value={updateForm.job || ''}
              onChange={onFormChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="city">Thành phố:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={updateForm.city || ''}
              onChange={onFormChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="district">Quận:</label>
            <input
              type="text"
              id="district"
              name="district"
              value={updateForm.district || ''}
              onChange={onFormChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="preferredMood">Phong cách phản hồi:</label>
            <select
              id="preferredMood"
              name="preferredMood"
              value={updateForm.preferredMood || ''}
              onChange={onFormChange}
              className={styles.selectField}
            >
              <option value="">Chọn phong cách phản hồi</option>
              <option value="ENCOURAGEMENT">Động viên</option>
              <option value="IRRITATION">Nghiêm khắc</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="preferredGoal">Mục tiêu tài chính:</label>
            <select
              id="preferredGoal"
              name="preferredGoal"
              value={updateForm.preferredGoal || ''}
              onChange={onFormChange}
              className={styles.selectField}
            >
              <option value="">Chọn mục tiêu tài chính</option>
              <option value="SAVING">Tiết kiệm</option>
              <option value="INVESTMENT">Phát triển đầu tư</option>
            </select>
          </div>
          
          {updateError && <p className={styles.errorMessage}>{updateError}</p>}
          {updateSuccess && <p className={styles.successMessage}>{updateSuccess}</p>}
          
          <div className={styles.modalActions}>
            <button type="submit" className={styles.submitButton}>
              Cập nhật
            </button>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={onClose}
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileModal;