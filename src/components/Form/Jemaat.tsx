import React, { useEffect, useState, useRef } from 'react';
import InputText from '../../components/InputText';
import Card from '../../components/Card';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../components/Dropdowns';
import { DayPicker } from "react-day-picker";
import dayjs from 'dayjs';
import DropdownSearch from '../DropdownSearch';
import api from '../../services/api';

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

  const handleMomSelect = (option: { id: string | number; label: string } | null) => {
    setSelectedMom(option);
    setForm((prev) => ({
      ...prev,
      mom_id: option ? option.id.toString() : '',
    }));
  };

  const handleDadSelect = (option: { id: string | number; label: string } | null) => {
    setSelectedDad(option);
    setForm((prev) => ({
      ...prev,
      dad_id: option ? option.id.toString() : '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card title={title}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <InputText
            label={t('name')}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Dropdown
            position="bottom-left"
            label={t('birth_date')}
            trigger={
              <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                {form.birth_date ? dayjs(form.birth_date).format('DD-MM-YYYY') : t('select_birth_date')}
              </button>
            }
          >
            <div className="p-4 w-full">
              <div className='flex flex-row gap-2'>
                <Dropdown
                  fullWidth={true}
                  ref={birthMonthDropdownRef}
                  trigger={
                    <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                      {new Date(0, selectedMonthBirth).toLocaleString('default', { month: 'long' })}
                    </button>
                  }
                >
                  <div className="max-h-40 overflow-y-auto w-full">
                    {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                      <div
                        key={month}
                        className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
                    <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                      {selectedYearBirth}
                    </button>
                  }
                >
                  <div className="max-h-40 overflow-y-auto w-full">
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <div
                        key={year}
                        className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
        <div className="grid grid-cols-1 gap-4">
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
        <div className="grid grid-cols-1 gap-4">
          <Dropdown
            fullWidth={true}
            position="bottom-left"
            label={t('gender')}
            trigger={
              <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                {form.gender === 'male' ? t('male') : t('female')}
              </button>
            }
          >
            <div className="p-2 w-full">
              <div
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectChange('gender', 'male')}
              >
                {t('male')}
              </div>
              <div
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelectChange('gender', 'female')}
              >
                {t('female')}
              </div>
            </div>
          </Dropdown>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Dropdown
            position="bottom-left"
            label={t('baptism_date_optional')}
            trigger={
              <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                {form.baptism_date ? dayjs(form.baptism_date).format('DD-MM-YYYY') : t('select_baptism_date')}
              </button>
            }
          >
            <div className="p-4 w-full">
              <div className='flex flex-row gap-2'>
                <Dropdown
                  fullWidth={true}
                  ref={monthDropdownRef}
                  trigger={
                    <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                      {new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })}
                    </button>
                  }
                >
                  <div className="max-h-40 overflow-y-auto w-full">
                    {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                      <div
                        key={month}
                        className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
                    <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                      {selectedYear}
                    </button>
                  }
                >
                  <div className="max-h-40 overflow-y-auto w-full">
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <div
                        key={year}
                        className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
          <div className="flex items-center gap-2">
            <input
              id="is_married"
              name="is_married"
              type="checkbox"
              checked={form.is_married}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <p className="text-gray-700 dark:text-gray-200 font-semibold">{t('married')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
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
        <button
          onClick={handleSubmit}
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t('saving') : t('save')}
        </button>
      </div>
    </Card>
  );
};

export default JemaatForm;
