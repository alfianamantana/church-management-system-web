import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import InputText from '../../components/InputText';
// @ts-ignore
import cityList from '../../kota.json';
import CountryList from 'country-list-with-dial-code-and-flag';
import CountryFlagSvg from 'country-list-with-dial-code-and-flag/dist/flag-svg';
import Dropdown from '../../components/Dropdowns';
import Card from '../../components/Card';
import { getMessage, IBasicResponse, IUser } from '../../constant';
import api from '../../services/api';
import ThemeLanguageSwitcher from '../../components/ThemeLanguageSwitcher';
import { toast } from 'react-toastify';
import { encryptData } from '@/services/crypto';

const countries = CountryList.getAll();

interface ResponseSubmitChurch extends IBasicResponse {
  data?: IUser;
}

const CreateChurchPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    city: '',
    country: 'ID',
    phone_number: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone_number') {
      // Only allow numbers, no spaces, no other characters
      const numericValue = value.replace(/[^0-9]/g, '');
      setForm(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    setForm(prev => ({ ...prev, country: countryCode }));
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: '' }));
    }
    // Close the dropdown after selection
    if (dropdownRef.current) {
      dropdownRef.current.close();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) {
      newErrors.name = t('name_required') || 'Church name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = t('email_required') || 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = t('email_invalid') || 'Email is invalid';
    }

    if (!form.city.trim()) {
      newErrors.city = t('city_required') || 'City is required';
    }

    if (!form.country) {
      newErrors.country = t('country_required') || 'Country is required';
    }

    if (!form.phone_number.trim()) {
      newErrors.phone_number = t('phone_required') || 'Phone number is required';
    } else if (form.phone_number.length < 10 || form.phone_number.length > 15) {
      newErrors.phone_number = t('phone_invalid') || 'Phone number must be 10-15 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const churchData = {
        ...form,
        phone_number: dialCode + form.phone_number,
      };

      const { data } = await api.post('/churches', churchData);
      const response: ResponseSubmitChurch = data;
      if (response.code === 201) {
        const string = JSON.stringify(response.data);
        const userEncrypted = await encryptData(string);
        await localStorage.setItem('user', userEncrypted);
        toast.success(getMessage(response.message) as string);
        navigate('/select-church');
      } else {
        toast.error(getMessage(response.message) as string);
      }
    } catch (error: any) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCountry = countries.find(c => c.code === form.country);
  const selectedPhoneCountry = CountryList.findOneByCountryCode(form.country);
  const dialCode = selectedPhoneCountry ? selectedPhoneCountry.dial_code.replace('+', '') : '';
  const flagSvg = selectedPhoneCountry ? CountryFlagSvg[selectedPhoneCountry.code] : '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeLanguageSwitcher />
      </div>

      <Card id="create-church-card" className="w-full max-w-md">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('create_church_title') || 'Create Your Church'}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('create_church_subtitle') || 'Set up your church information'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="w-full flex flex-col gap-1">
              <InputText
                label={t('church_name') || 'Church Name'}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t('enter_church_name') || 'Enter church name'}
                error={errors.name}
                required
              />
            </div>

            <div className="w-full flex flex-col gap-1">
              <InputText
                label={t('email') || 'Email'}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('enter_email') || 'Enter email address'}
                error={errors.email}
                required
              />
            </div>

            <div className="w-full flex flex-col gap-1">
              <InputText
                label={t('city') || 'City'}
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder={t('enter_city') || 'Enter city'}
                error={errors.city}
                required
                list="city-list"
                autoComplete="off"
              />
            </div>

            <div className="w-full flex flex-col gap-1">
              <Dropdown
                ref={dropdownRef}
                label={t('country') || 'Country'}
                required
                className="w-full"
                position="bottom"
                trigger={
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left border rounded focus:outline-none focus:ring-2 border-border focus:ring-ring bg-input text-foreground flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {flagSvg && (
                        <span dangerouslySetInnerHTML={{ __html: flagSvg }} style={{ width: 20, height: 15, marginRight: 8, display: 'inline-block' }} />
                      )}
                      <span>{selectedCountry?.name || t('select_country') || 'Select Country'}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
                onOpenChange={setCountryDropdownOpen}
              >
                <div className="max-h-60 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country.code)}
                      className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center"
                    >
                      <span dangerouslySetInnerHTML={{ __html: CountryFlagSvg[country.code] }} style={{ width: 20, height: 15, marginRight: 8, display: 'inline-block' }} />
                      <span>{country.name}</span>
                    </button>
                  ))}
                </div>
              </Dropdown>
              {errors.country && (
                <div className="text-destructive mt-1 text-sm">{errors.country}</div>
              )}
            </div>

            <div className="w-full flex flex-col gap-1 relative" id="create-church-phone-container">
              <label htmlFor="create-church-phone" className="block font-semibold text-foreground">
                {t('phone_number') || 'Phone Number'} <span className="text-muted-foreground text-sm">{t('enter_phone_number') || 'Enter your phone number'}</span>
              </label>
              <div className="mt-1 relative" id="phone-input-wrapper">
                <div id="create-church-dial-prefix" className="absolute inset-y-0 left-0 flex items-center h-full z-10">
                  <Dropdown
                    id="create-church-phone-dropdown"
                    label={undefined}
                    trigger={
                      <button
                        id="create-church-phone-trigger"
                        type="button"
                        className="flex items-center h-full px-1 border-r ml-1 bg-input text-foreground focus:outline-none"
                      >
                        {flagSvg && <span dangerouslySetInnerHTML={{ __html: flagSvg }} style={{ width: 17, height: 17, marginRight: 8, display: 'inline-block' }} />}
                        <span id="create-church-dial-code" className="font-semibold text-xs">+{dialCode}</span>
                        <svg
                          id="create-church-phone-chevron"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${phoneDropdownOpen ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        >
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                        </svg>
                      </button>
                    }
                    onOpenChange={setPhoneDropdownOpen}
                  >
                    <div id="create-church-phone-country-list" className="max-h-64 overflow-y-auto w-full md:w-80">
                      {countries.map((country) => (
                        <button
                          id={`create-church-phone-country-${country.code}`}
                          key={country.code}
                          type="button"
                          className={`w-full flex items-center px-3 py-2 hover:bg-muted ${form.country === country.code ? 'bg-accent font-bold' : ''}`}
                          onClick={() => {
                            setForm({ ...form, country: country.code });
                            setPhoneDropdownOpen(false);
                          }}
                        >
                          <span dangerouslySetInnerHTML={{ __html: CountryFlagSvg[country.code] }} style={{ width: 20, height: 20, marginRight: 8, display: 'inline-block' }} />
                          <span className="mr-2 text-foreground text-sm">{country.name}</span>
                          <span className="text-muted-foreground">({country.dial_code})</span>
                        </button>
                      ))}
                    </div>
                  </Dropdown>
                </div>

                <input
                  id="create-church-phone"
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange}
                  required
                  placeholder={t('enter_phone_number') || 'Enter phone number'}
                  autoComplete="tel"
                  pattern="[0-9]+"
                  inputMode="numeric"
                  maxLength={15}
                  aria-invalid={errors.phone_number ? 'true' : 'false'}
                  aria-describedby={errors.phone_number ? 'create-church-phone-error' : undefined}
                  className="pl-24 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-border focus:ring-ring bg-input text-foreground dark:focus:ring-ring"
                  style={{ marginBottom: 0 }}
                />
              </div>
              {errors.phone_number && (
                <div id="create-church-phone-error" className="text-destructive mt-1 text-sm">{errors.phone_number}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (t('creating') || 'Creating...') : (t('create_church') || 'Create Church')}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateChurchPage;