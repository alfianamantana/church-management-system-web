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
  const { t } = useTranslation();
  const [selectedBaptism, setSelectedBaptism] = useState<Date>();
  const [selectedBirth, setSelectedBirth] = useState<Date>();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedYearBirth, setSelectedYearBirth] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedMonthBirth, setSelectedMonthBirth] = useState(new Date().getMonth());
  const yearDropdownRef = useRef<{ close: () => void }>(null);
  const birthYearDropdownRef = useRef<{ close: () => void }>(null);
  const monthDropdownRef = useRef<{ close: () => void }>(null);
  const birthMonthDropdownRef = useRef<{ close: () => void }>(null);

  // Dropdown open states for chevron icons
  const [isBirthDateDropdownOpen, setIsBirthDateDropdownOpen] = useState(false);
  const [isBirthMonthDropdownOpen, setIsBirthMonthDropdownOpen] = useState(false);
  const [isBirthYearDropdownOpen, setIsBirthYearDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [isBaptismDateDropdownOpen, setIsBaptismDateDropdownOpen] = useState(false);
  const [isBaptismMonthDropdownOpen, setIsBaptismMonthDropdownOpen] = useState(false);
  const [isBaptismYearDropdownOpen, setIsBaptismYearDropdownOpen] = useState(false);

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
  });

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({ ...prev, ...initialData }));
      if (initialData.birth_date) {
        const birthDate = new Date(initialData.birth_date);
        setSelectedBirth(birthDate);
        setSelectedYearBirth(birthDate.getFullYear());
        setSelectedMonthBirth(birthDate.getMonth());
      }
      if (initialData.baptism_date) {
        const baptismDate = new Date(initialData.baptism_date);
        setSelectedBaptism(baptismDate);
        setSelectedYear(baptismDate.getFullYear());
        setSelectedMonth(baptismDate.getMonth());
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
      setSelectedYear(selectedBaptism.getFullYear());
      setSelectedMonth(selectedBaptism.getMonth());
    }
  }, [selectedBaptism]);

  useEffect(() => {
    if (selectedBirth) {
      setForm((prev) => ({
        ...prev,
        birth_date: dayjs(selectedBirth).format('YYYY-MM-DD'),
      }));
      setSelectedYearBirth(selectedBirth.getFullYear());
      setSelectedMonthBirth(selectedBirth.getMonth());
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
      console.error('Error searching jemaat:', error);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card title={title} id="jemaat-form-card">
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('personal_information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputText
              label={t('name')}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Dropdown
              fullWidth={true}
              position="bottom"
              label={t('gender')}
              trigger={
                <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                  {form.gender === 'male' ? t('male') : t('female')}
                  {isGenderDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              }
              onOpenChange={setIsGenderDropdownOpen}
            >
              <div className="py-2 max-h-40 overflow-y-auto w-48">
                <div
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white transition-all duration-200"
                  onClick={() => handleSelectChange('gender', 'male')}
                >
                  {t('male')}
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white transition-all duration-200"
                  onClick={() => handleSelectChange('gender', 'female')}
                >
                  {t('female')}
                </div>
              </div>
            </Dropdown>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputText
              label={t('birth_place')}
              name="born_place"
              value={form.born_place}
              onChange={handleChange}
              required
            />
            <InputText
              label={t('phone_number')}
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Birth Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('birth_information')}
          </h3>
          <Dropdown
            position="bottom"
            label={t('birth_date')}
            trigger={
              <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                {form.birth_date ? dayjs(form.birth_date).format('DD-MM-YYYY') : t('select_birth_date')}
                {isBirthDateDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            }
            onOpenChange={setIsBirthDateDropdownOpen}
          >
            <div className="p-4 w-full">
              <div className='flex flex-row gap-2 mb-4'>
                <Dropdown
                  fullWidth={true}
                  ref={birthMonthDropdownRef}
                  trigger={
                    <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                      {new Date(0, selectedMonthBirth).toLocaleString('default', { month: 'long' })}
                      {isBirthMonthDropdownOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  }
                  onOpenChange={setIsBirthMonthDropdownOpen}
                >
                  <div className="max-h-40 overflow-y-auto w-full">
                    {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                      <div
                        key={month}
                        className="px-4 py-2 w-full hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSelectedMonthBirth(month);
                          birthMonthDropdownRef.current?.close();
                        }}
                      >
                        {new Date(0, month).toLocaleString('default', { month: 'long' })}
                      </div>
                    ))}
                  </div>
                </Dropdown>
                <Dropdown
                  fullWidth={true}
                  ref={birthYearDropdownRef}
                  trigger={
                    <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                      {selectedYearBirth}
                      {isBirthYearDropdownOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  }
                  onOpenChange={setIsBirthYearDropdownOpen}
                >
                  <div className="max-h-40 overflow-y-auto w-full">
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <div
                        key={year}
                        className="px-4 py-2 w-full hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSelectedYearBirth(year);
                          birthYearDropdownRef.current?.close();
                        }}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                </Dropdown>
              </div>
              <DayPicker
                disabled={{ after: new Date() }}
                animate
                mode="single"
                selected={selectedBirth}
                onSelect={setSelectedBirth}
                month={new Date(selectedYearBirth, selectedMonthBirth)}
              />
            </div>
          </Dropdown>
        </div>

        {/* Baptism Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('baptism_information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dropdown
              position="top"
              label={t('baptism_date_optional')}
              trigger={
                <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                  {form.baptism_date ? dayjs(form.baptism_date).format('DD-MM-YYYY') : t('select_baptism_date')}
                  {isBaptismDateDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              }
              onOpenChange={setIsBaptismDateDropdownOpen}
            >
              <div className="p-4 w-full">
                <div className='flex flex-row gap-2 mb-4'>
                  <Dropdown
                    fullWidth={true}
                    ref={monthDropdownRef}
                    trigger={
                      <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                        {new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })}
                        {isBaptismMonthDropdownOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    }
                    onOpenChange={setIsBaptismMonthDropdownOpen}
                  >
                    <div className="max-h-40 overflow-y-auto w-full">
                      {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                        <div
                          key={month}
                          className="px-4 py-2 w-full hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => {
                            setSelectedMonth(month);
                            monthDropdownRef.current?.close();
                          }}
                        >
                          {new Date(0, month).toLocaleString('default', { month: 'long' })}
                        </div>
                      ))}
                    </div>
                  </Dropdown>
                  <Dropdown
                    fullWidth={true}
                    ref={yearDropdownRef}
                    trigger={
                      <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                        {selectedYear}
                        {isBaptismYearDropdownOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    }
                    onOpenChange={setIsBaptismYearDropdownOpen}
                  >
                    <div className="max-h-40 overflow-y-auto w-full">
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <div
                          key={year}
                          className="px-4 py-2 w-full hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => {
                            setSelectedYear(year);
                            yearDropdownRef.current?.close();
                          }}
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                  </Dropdown>
                </div>
                <DayPicker
                  disabled={{ after: new Date() }}
                  animate
                  pagedNavigation
                  mode="single"
                  selected={selectedBaptism}
                  onSelect={setSelectedBaptism}
                  month={new Date(selectedYear, selectedMonth)}
                />
              </div>
            </Dropdown>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="is_married"
                name="is_married"
                type="checkbox"
                checked={form.is_married}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_married" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('married')}
              </label>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('family_information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('mom')}
              </label>
              <DropdownSearch
                placeholder={t('search_mom')}
                onSearch={searchJemaat}
                onSelect={handleMomSelect}
                selectedValue={selectedMom}
                debounceMs={500}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('dad')}
              </label>
              <DropdownSearch
                placeholder={t('search_dad')}
                onSearch={searchJemaat}
                onSelect={handleDadSelect}
                selectedValue={selectedDad}
                debounceMs={500}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSubmit}
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default JemaatForm;
