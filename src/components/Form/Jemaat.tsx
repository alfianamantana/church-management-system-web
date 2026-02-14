import React, { useEffect, useState, useRef } from 'react';
import InputText from '../../components/InputText';
import Card from '../../components/Card';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../components/Dropdowns';
import { DayPicker } from "react-day-picker";
import dayjs from 'dayjs';
import DropdownSearch from '../DropdownSearch';
import api from '../../services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import CountryList from 'country-list-with-dial-code-and-flag';
import CountryFlagSvg from 'country-list-with-dial-code-and-flag/dist/flag-svg';
import DatePicker from '../DayPicker';
import Button from '../Button';

interface JemaatFormData {
  name: string;
  birth_date: string;
  born_place: string;
  phone_number: string;
  baptism_date: string;
  is_married: boolean;
  mom_id: string;
  dad_id: string;
  gender: string;
  couple_id?: string;
}

interface JemaatFormInitialData extends JemaatFormData {
  mom?: { id: number; name: string } | null;
  dad?: { id: number; name: string } | null;
}

interface JemaatFormProps {
  title: string;
  initialData?: Partial<JemaatFormInitialData>;
  onSubmit: (data: JemaatFormData) => void;
  loading: boolean;
}

const JemaatForm: React.FC<JemaatFormProps> = ({ title, initialData, onSubmit, loading }) => {
  // Country code for phone input (default to ID)
  const countries = CountryList.getAll();
  const [country, setCountry] = useState('ID');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const selectedCountry = CountryList.findOneByCountryCode(country);
  const dialCode = selectedCountry ? selectedCountry.dial_code.replace('+', '') : '';
  const flagSvg = selectedCountry ? CountryFlagSvg[selectedCountry.code] : '';
  const { t } = useTranslation();
  const [selectedBaptism, setSelectedBaptism] = useState<Date>();
  const [selectedBirth, setSelectedBirth] = useState<Date>();

  // Dropdown open states for chevron icons
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);

  const [selectedMom, setSelectedMom] = useState<{ id: string | number; label: string } | null>(null);
  const [selectedDad, setSelectedDad] = useState<{ id: string | number; label: string } | null>(null);

  const [form, setForm] = useState<JemaatFormData>({
    name: '',
    birth_date: '',
    born_place: '',
    phone_number: '',
    baptism_date: '',
    is_married: false,
    mom_id: '',
    dad_id: '',
    gender: 'male',
    couple_id: '',
  });

  const [selectedCouple, setSelectedCouple] = useState<{ id: string | number; label: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({ ...prev, ...initialData }));
      try {
        if (initialData.birth_date) {
          const birthDate = new Date(initialData.birth_date);
          if (!isNaN(birthDate.getTime())) {
            setSelectedBirth(birthDate);
          }
        }
        if (initialData.baptism_date) {
          const baptismDate = new Date(initialData.baptism_date);
          if (!isNaN(baptismDate.getTime())) {
            setSelectedBaptism(baptismDate);
          }
        }
      } catch (error) {
        console.error('Error parsing dates in JemaatForm:', error);
      }
      if (initialData.mom) {
        setSelectedMom({ id: initialData.mom.id, label: initialData.mom.name });
      }
      if (initialData.dad) {
        setSelectedDad({ id: initialData.dad.id, label: initialData.dad.name });
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (selectedBaptism) {
      setForm((prev) => ({
        ...prev,
        baptism_date: dayjs(selectedBaptism).format('YYYY-MM-DD'),
      }));
    }
  }, [selectedBaptism]);

  useEffect(() => {
    if (selectedBirth) {
      setForm((prev) => ({
        ...prev,
        birth_date: dayjs(selectedBirth).format('YYYY-MM-DD'),
      }));
    }
  }, [selectedBirth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === 'phone_number') {
      // Allow only numbers
      const numericValue = value.replace(/[^\d]/g, '');
      setForm((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchJemaat = async (query: string) => {
    try {
      const { data } = await api.get('/jemaat', { params: { q: query, limit: 10 } });
      if (data.code === 200) {
        return data.data.map((jemaat: any) => ({ id: jemaat.id, label: jemaat.name }));
      }
      return [];
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
      return [];
    }
  };

  const handleMomSelect = (option: { id: string | number; label: string } | { id: string | number; label: string }[] | null) => {
    const selectedOption = Array.isArray(option) ? option[0] : option;
    setSelectedMom(selectedOption);
    setForm((prev) => ({
      ...prev,
      mom_id: selectedOption ? selectedOption.id.toString() : '',
    }));
  };

  const handleDadSelect = (option: { id: string | number; label: string } | { id: string | number; label: string }[] | null) => {
    const selectedOption = Array.isArray(option) ? option[0] : option;
    setSelectedDad(selectedOption);
    setForm((prev) => ({
      ...prev,
      dad_id: selectedOption ? selectedOption.id.toString() : '',
    }));
  };

  const handleCoupleSelect = (option: { id: string | number; label: string } | { id: string | number; label: string }[] | null) => {
    const selectedOption = Array.isArray(option) ? option[0] : option;
    setSelectedCouple(selectedOption);
    setForm((prev) => ({
      ...prev,
      couple_id: selectedOption ? selectedOption.id.toString() : '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card title={title} id="jemaat-form-card">
      <div className="space-y-6" id="jemaat-form-fields">
        {/* Personal Information */}
        <div className="space-y-4" id="personal-info-section">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2" id="personal-info-title">
            {t('personal_information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="personal-info-grid-1">
            <InputText
              id="jemaat-name"
              label={t('name')}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Dropdown
              id="jemaat-gender-dropdown"
              fullWidth={true}
              position="bottom"
              label={t('gender')}
              trigger={
                <button id="jemaat-gender-trigger" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-border focus:ring-ring bg-card text-card-foreground text-left flex items-center justify-between">
                  {form.gender === 'male' ? t('male') : t('female')}
                  {isGenderDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              }
              onOpenChange={setIsGenderDropdownOpen}
            >
              <div className="py-2 max-h-40 overflow-y-auto w-48" id="jemaat-gender-options">
                <div
                  id="jemaat-gender-male"
                  className="px-4 py-2 hover:bg-accent cursor-pointer text-foreground transition-all duration-200"
                  onClick={() => handleSelectChange('gender', 'male')}
                >
                  {t('male')}
                </div>
                <div
                  id="jemaat-gender-female"
                  className="px-4 py-2 hover:bg-accent cursor-pointer text-foreground transition-all duration-200"
                  onClick={() => handleSelectChange('gender', 'female')}
                >
                  {t('female')}
                </div>
              </div>
            </Dropdown>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="personal-info-grid-2">
            <InputText
              id="jemaat-birth-place"
              label={t('birth_place')}
              name="born_place"
              value={form.born_place}
              onChange={handleChange}
              required
            />
            <div id="jemaat-phone-container" className="relative">
              <label htmlFor="jemaat-phone-number">
                {t('phone_number')}
              </label>
              <div className="mt-1 relative" id="jemaat-phone-input-wrapper">
                <div id="jemaat-dial-prefix" className="absolute inset-y-0 left-0 flex items-center h-full z-10">
                  <Dropdown
                    id="jemaat-country-dropdown"
                    label={undefined}
                    trigger={
                      <button
                        id="jemaat-country-trigger"
                        type="button"
                        className="flex items-center h-full px-1 border-r ml-1 bg-input text-foreground focus:outline-none"
                      >
                        {flagSvg && <span dangerouslySetInnerHTML={{ __html: flagSvg }} style={{ width: 17, height: 17, marginRight: 8, display: 'inline-block' }} />}
                        <span id="jemaat-dial-code" className="font-semibold text-xs">+{dialCode}</span>
                        <svg
                          id="jemaat-country-chevron"
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
                    <div id="jemaat-country-list" className="max-h-64 overflow-y-auto w-full md:w-80">
                      {countries.map((c: any, i) => (
                        <button
                          id={`jemaat-country-${c.code}`}
                          key={c.code + i}
                          type="button"
                          className={`w-full flex items-center px-3 py-2 hover:bg-muted ${country === c.code ? 'bg-accent font-bold' : ''}`}
                          onClick={() => {
                            setCountry(c.code);
                            setCountryDropdownOpen(false);
                          }}
                        >
                          <span dangerouslySetInnerHTML={{ __html: CountryFlagSvg[c.code] }} style={{ width: 20, height: 20, marginRight: 8, display: 'inline-block' }} />
                          <span className="mr-2 text-foreground text-sm">{c.name}</span>
                          <span className="text-muted-foreground">({c.dial_code})</span>
                        </button>
                      ))}
                    </div>
                  </Dropdown>
                </div>
                <input
                  id="jemaat-phone-number"
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange}
                  required
                  placeholder={t('register_phone_placeholder')}
                  autoComplete="tel"
                  pattern="[0-9]+"
                  inputMode="numeric"
                  maxLength={15}
                  className="pl-24 w-full px-3 py-2 border rounded-lg  focus:outline-none focus:ring-2 border-border focus:ring-ring bg-input text-foreground dark:focus:ring-ring"
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2" id="jemaat-married-checkbox-container">
            <div className="flex items-center gap-2">
              <input
                id="jemaat-is-married"
                name="is_married"
                type="checkbox"
                checked={form.is_married}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="jemaat-is-married" className="text-sm font-medium text-foreground" id="jemaat-married-label">
                {t('married')}
              </label>
            </div>
            {form.is_married && (
              <div className="mt-2" id="jemaat-couple-dropdown-container">
                <label className="block text-sm font-medium text-foreground mb-1" id="jemaat-couple-label">
                  {t('couple')}
                </label>
                <DropdownSearch
                  id="jemaat-couple-dropdown"
                  placeholder={t('search_couple')}
                  onSearch={searchJemaat}
                  onSelect={handleCoupleSelect}
                  selectedValue={selectedCouple}
                  debounceMs={500}
                />
              </div>
            )}
          </div>
        </div>

        {/* Birth Information */}
        <div className="space-y-4" id="birth-info-section">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2" id="birth-info-title">
            {t('birth_information')}
          </h3>
          <DatePicker
            label={t('birth_date')}
            selectedDate={selectedBirth}
            onSelect={setSelectedBirth}
            id="jemaat-birth-date"
            position="bottom-left"
            disabled={{ after: new Date() }}
          />
        </div>

        {/* Baptism Information */}
        <div className="space-y-4" id="baptism-info-section">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2" id="baptism-info-title">
            {t('baptism_information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="baptism-info-grid">
            <DatePicker
              label={t('baptism_date_optional')}
              selectedDate={selectedBaptism}
              onSelect={setSelectedBaptism}
              id="jemaat-baptism-date"
              position="top-left"
              disabled={{ after: new Date() }}
            />
          </div>
        </div>

        {/* Family Information */}
        <div className="space-y-4" id="family-info-section">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2" id="family-info-title">
            {t('family_information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="family-info-grid">
            <div id="jemaat-mom-dropdown-container">
              <label className="block text-sm font-medium text-foreground mb-1" id="jemaat-mom-label">
                {t('mom')}
              </label>
              <DropdownSearch
                id="jemaat-mom-dropdown"
                placeholder={t('search_mom')}
                onSearch={searchJemaat}
                onSelect={handleMomSelect}
                selectedValue={selectedMom}
                debounceMs={500}
              />
            </div>
            <div id="jemaat-dad-dropdown-container">
              <label className="block text-sm font-medium text-foreground mb-1" id="jemaat-dad-label">
                {t('dad')}
              </label>
              <DropdownSearch
                id="jemaat-dad-dropdown"
                placeholder={t('search_dad')}
                onSearch={searchJemaat}
                onSelect={handleDadSelect}
                selectedValue={selectedDad}
                debounceMs={500}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border" id="jemaat-form-submit-container">
          <Button
            id="jemaat-form-submit"
            onClick={handleSubmit}
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            {loading ? t('saving') : t('save')}
          </Button>
          <Button
            variant="secondary"
            className="w-full mt-2"
            onClick={() => window.history.back()}
          >
            {t('cancel')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JemaatForm;
