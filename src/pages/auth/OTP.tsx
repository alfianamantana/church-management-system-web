import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/Card';
import ThemeLanguageSwitcher from '../../components/ThemeLanguageSwitcher';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { IBasicResponse } from '@/constant';

const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Get email from location state (passed from register/login)
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    if (value.length <= 6) {
      setOtp(value);
      if (errors.otp) {
        setErrors({ ...errors, otp: '' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setErrors({ otp: t('otp_invalid_length') || 'OTP must be 6 digits' });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/user/verify-account', { email, otp });
      const response: IBasicResponse = data;
      if (response.code === 200) {
        toast.success('Account verified successfully');
        navigate('/create-church'); // Redirect to create church after verification
      } else {
        throw new Error(response.message?.en?.[0] || 'Verification failed');
      }

    } catch (error: any) {
      const message = error.response?.data?.message?.en?.[0] || error.message || t('otp_verification_failed') || 'OTP verification failed';
      setErrors({ otp: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);

    try {
      const { data } = await api.post('/user/resend-otp', { email });
      const response: IBasicResponse = data;

      if (response.code === 200) {
        toast.success('OTP sent successfully');
      } else {
        throw new Error(response.message?.en?.[0] || 'Failed to resend OTP');
      }

      // Restart timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      const message = error.response?.data?.message || t('otp_resend_failed') || 'Failed to resend OTP';
      toast.error(message);
      setCanResend(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeLanguageSwitcher />
      </div>

      <Card id="otp-card" className="w-full max-w-md">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('otp_title') || 'Verify Your Email'}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('otp_subtitle') || 'Enter the 6-digit code sent to'}
            </p>
            <p className="text-foreground font-medium mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp-input" className="block text-sm font-medium text-foreground mb-2">
                {t('otp_code') || 'OTP Code'}
              </label>
              <input
                id="otp-input"
                type="text"
                value={otp}
                onChange={handleChange}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:outline-none focus:ring-2 border-border focus:ring-ring bg-input text-foreground dark:focus:ring-ring"
                aria-invalid={errors.otp ? 'true' : 'false'}
                aria-describedby={errors.otp ? 'otp-error' : undefined}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (t('verifying') || 'Verifying...') : (t('verify_otp') || 'Verify OTP')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {t('otp_not_received') || "Didn't receive the code?"}
            </p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend}
              className="text-primary hover:text-primary/80 font-medium disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {canResend
                ? (t('resend_otp') || 'Resend OTP')
                : `${t('resend_in') || 'Resend in'} ${resendTimer}s`
              }
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-muted-foreground hover:text-foreground text-sm underline"
            >
              {t('back_to_register') || 'Back to Register'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OTPPage;
