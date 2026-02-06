import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import InputText from '../../components/InputText';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { setPageTitle } from '@/store/themeConfigSlice';
import { IUser } from '@/constant';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';

const ProfileDetail: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle('Profile Detail'));
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/profile');
      if (data.code === 200) {
        setUser(data.data);
      } else {
        toast.error(data.message[0]);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      toast.error('All fields are required');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New password and confirmation do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      const { data } = await api.put('/profile/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });

      if (data.code === 200) {
        toast.success('Password changed successfully');
        setIsPasswordModalOpen(false);
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        toast.error(data.message[0]);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" id="profile-loading-container">
        <div className="text-center" id="profile-loading-content">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" id="profile-loading-spinner"></div>
          <p className="text-gray-600 dark:text-gray-400" id="profile-loading-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="profile-detail-container">
      {/* Profile Information Card */}
      <Card title="Profile Information" id="profile-information-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="profile-grid">
          {/* Left Column - Profile Details */}
          <div className="space-y-4" id="profile-details-column">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" id="profile-name-row">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:w-32" id="profile-name-label">
                Name:
              </label>
              <div className="text-gray-900 dark:text-gray-100 font-medium" id="profile-name-value">
                {user?.name || 'N/A'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" id="profile-email-row">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:w-32" id="profile-email-label">
                Email:
              </label>
              <div className="text-gray-900 dark:text-gray-100" id="profile-email-value">
                {user?.email || 'N/A'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" id="profile-phone-row">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:w-32" id="profile-phone-label">
                Phone:
              </label>
              <div className="text-gray-900 dark:text-gray-100" id="profile-phone-value">
                {user?.phone_number || 'N/A'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" id="profile-role-row">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:w-32" id="profile-role-label">
                Role:
              </label>
              <div className="text-gray-900 dark:text-gray-100 capitalize" id="profile-role-value">
                {user?.role || 'N/A'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" id="profile-subscription-row">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:w-32" id="profile-subscription-label">
                Subscription:
              </label>
              <div className="text-gray-900 dark:text-gray-100 capitalize" id="profile-subscription-value">
                {user?.subscribe_type || 'N/A'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" id="profile-expires-row">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:w-32" id="profile-expires-label">
                Expires:
              </label>
              <div className="text-gray-900 dark:text-gray-100" id="profile-expires-value">
                {user?.subscribe_until ? dayjs(user.subscribe_until).format('DD MMMM YYYY') : 'N/A'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4" id="profile-joined-row">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 md:w-32" id="profile-joined-label">
                Joined:
              </label>
              <div className="text-gray-900 dark:text-gray-100" id="profile-joined-value">
                {user?.createdAt ? dayjs(user.createdAt).format('DD MMMM YYYY') : 'N/A'}
              </div>
            </div>
          </div>

          {/* Right Column - Password Change */}
          <div className="space-y-4" id="profile-security-column">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 md:p-6" id="security-settings-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4" id="security-settings-title">
                Security Settings
              </h3>
              <div className="mt-6" id="change-password-button-container">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 text-sm md:text-base"
                  id="change-password-button"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        size="md"
        id="change-password-modal"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4" id="change-password-form">
          <div id="current-password-field">
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" id="current-password-label">
              Current Password *
            </label>
            <InputText
              type="password"
              id="current_password"
              name="current_password"
              value={passwordForm.current_password}
              onChange={handlePasswordInputChange}
              placeholder="Enter your current password"
              className="w-full"
              required
            />
          </div>

          <div id="new-password-field">
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" id="new-password-label">
              New Password *
            </label>
            <InputText
              type="password"
              id="new_password"
              name="new_password"
              value={passwordForm.new_password}
              onChange={handlePasswordInputChange}
              placeholder="Enter your new password"
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" id="password-requirements">
              Password must be at least 6 characters long
            </p>
          </div>

          <div id="confirm-password-field">
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" id="confirm-password-label">
              Confirm New Password *
            </label>
            <InputText
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordInputChange}
              placeholder="Confirm your new password"
              className="w-full"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3 pt-4" id="change-password-modal-actions">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              id="cancel-password-change-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              id="submit-password-change-button"
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileDetail;
