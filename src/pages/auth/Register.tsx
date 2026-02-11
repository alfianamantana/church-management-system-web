import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import InputText from '../../components/InputText';
import CountryList from 'country-list-with-dial-code-and-flag';
import CountryFlagSvg from 'country-list-with-dial-code-and-flag/dist/flag-svg';
import Dropdown from '../../components/Dropdowns';
import Card from '../../components/Card';
import { IPriorityNeed } from '../../constant';
import api from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { toggleRTL, toggleTheme } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import ThemeLanguageSwitcher from '../../components/ThemeLanguageSwitcher';

const countries = CountryList.getAll();

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const [flag, setFlag] = useState(themeConfig.locale);

  const setLocale = (flag: string) => {
    setFlag(flag);
    if (flag.toLowerCase() === 'ae') {
      dispatch(toggleRTL('rtl'));
    } else {
      dispatch(toggleRTL('ltr'));
    }
  };

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'ID',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [priorityNeeds, setPriorityNeeds] = useState<IPriorityNeed[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/priority-needs');
        const json = res.data;
        const list = Array.isArray(json) ? json : (json.data || json.priority_needs || []);
        setPriorityNeeds(list);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'phone') {
      // Hanya izinkan angka, tanpa spasi, tanpa karakter lain
      const value = e.target.value.replace(/[^0-9]/g, '');
      setForm({ ...form, phone: value });
    } else if (e.target.name === 'country') {
      setForm({ ...form, country: e.target.value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi sederhana
    const newErrors: { [key: string]: string } = {};
    if (!form.email) newErrors.email = t('email_required');
    if (!form.password) newErrors.password = t('password_required');
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = t('password_mismatch');
    if (!form.phone) newErrors.phone = t('phone_required');
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Submit ke backend
      // ...
    }
  };

  const selectedCountry = CountryList.findOneByCountryCode(form.country);
  const dialCode = selectedCountry ? selectedCountry.dial_code.replace('+', '') : '';
  const flagSvg = selectedCountry ? CountryFlagSvg[selectedCountry.code] : '';

  return (
    <div id="page-register" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-accent px-2 md:px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeLanguageSwitcher />
      </div>
      <Card
        id="register-card"
        className="my-5 w-full max-w-md md:max-w-lg p-4 md:p-8 flex flex-col gap-y-6 rounded-xl hover:shadow-md transition-all duration-300 backdrop-blur-sm"
      >
        <div id="register-header" className="text-center">
          <h2 id="register-title" className="text-2xl md:text-3xl font-bold text-card-foreground mb-2">Lumen</h2>
          <p id="register-subtitle" className="text-muted-foreground">{t('church_management_system')}</p>
        </div>
        <form id="register-form" className="flex flex-col gap-y-4" onSubmit={handleSubmit}>
          <InputText
            id="register-email"
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            error={errors.email}
            autoComplete="email"
          />
          <InputText
            id="register-password"
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            error={errors.password}
            autoComplete="new-password"
          />
          <InputText
            id="register-confirm-password"
            label={t('confirm_password')}
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <div id="register-phone-container" className="relative">
            <label htmlFor="register-phone">
              {t('register_phone_label')} <span className="text-muted-foreground text-sm">{t('register_phone_help')}</span>
            </label>
            <div className="mt-1 relative" id="phone-input-wrapper">
              <div id="register-dial-prefix" className="absolute inset-y-0 left-0 flex items-center h-full z-10">
                <Dropdown
                  id="register-country-dropdown"
                  label={undefined}
                  trigger={
                    <button
                      id="register-country-trigger"
                      type="button"
                      className="flex items-center h-full px-1 border-r ml-1 bg-background text-foreground focus:outline-none"
                    >
                      {flagSvg && <span dangerouslySetInnerHTML={{ __html: flagSvg }} style={{ width: 17, height: 17, marginRight: 8, display: 'inline-block' }} />}
                      <span id="register-dial-code" className="font-semibold text-xs">+{dialCode}</span>
                      <svg
                        id="register-country-chevron"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                      </svg>
                    </button>
                  }
                  onOpenChange={setCountryDropdownOpen}
                >
                  <div id="register-country-list" className="max-h-64 overflow-y-auto w-full md:w-80">
                    {countries.map((country) => (
                      <button
                        id={`register-country-${country.code}`}
                        key={country.code}
                        type="button"
                        className={`w-full flex items-center px-3 py-2 hover:bg-muted ${form.country === country.code ? 'bg-accent font-bold' : ''}`}
                        onClick={() => {
                          setForm({ ...form, country: country.code });
                          setCountryDropdownOpen(false);
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
                id="register-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder={t('register_phone_placeholder')}
                autoComplete="tel"
                pattern="[0-9]+"
                inputMode="numeric"
                maxLength={15}
                aria-invalid={errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'register-phone-error' : undefined}
                className="pl-24 w-full px-3 py-2 border rounded-lg  focus:outline-none focus:ring-2 border-border focus:ring-ring bg-input text-foreground dark:focus:ring-ring"
                style={{ marginBottom: 0 }}
              />
              {errors.phone && (
                <div id="register-phone-error" className="text-destructive mt-1 text-sm">{errors.phone}</div>
              )}
            </div>

            <div id="register-priority-container" className="mt-3 p-2 md:p-4 rounded-lg bg-muted border border-border shadow-sm">
              <div id="register-priority-label" className="text-xs md:text-sm font-semibold mb-1 text-foreground">{t('register_priority_title')}</div>
              <div id="register-priority-sub" className="text-xs text-card-foreground mb-3">{t('register_priority_sub')}</div>
              <div id="register-priority-list" className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {priorityNeeds.map((p) => (
                  <label key={p.id} htmlFor={`register-priority-${p.id}`} className="flex items-start gap-2 md:gap-3 p-1 md:p-2 rounded-md hover:bg-accent transition-colors">
                    <input
                      id={`register-priority-${p.id}`}
                      name="priorityNeeds"
                      type="checkbox"
                      checked={selectedPriorities.includes(p.id)}
                      onChange={() => {
                        if (selectedPriorities.includes(p.id)) {
                          setSelectedPriorities(selectedPriorities.filter((x) => x !== p.id));
                        } else {
                          setSelectedPriorities([...selectedPriorities, p.id]);
                        }
                      }}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <div className="text-xs md:text-sm font-medium text-foreground">{t(p.name)}</div>
                      {p.description && <div className="text-xs text-muted-foreground">{t(p.description)}</div>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            id="register-submit"
            type="submit"
            className="w-full py-2 md:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {t('register') || 'Register'}
          </button>
        </form>
        <button
          id="register-back"
          onClick={() => navigate('/login')}
          type="button"
          className="w-full py-2 md:py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {t('back')}
        </button>
      </Card>
    </div>
  );
};

export default RegisterPage;