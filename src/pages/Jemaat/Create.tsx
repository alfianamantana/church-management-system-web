import React, { useEffect, useState } from 'react';
import InputText from '../../components/InputText';
import Card from '../../components/Card';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { IBasicResponse } from '../../constant';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../../components/Dropdowns';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { DayPicker } from "react-day-picker";
// import "react-day-picker/style.css";

const CreateJemaat: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Tambah Jemaat'));
  });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedBaptism, setSelectedBaptism] = useState<Date>();
  const [selectedBirth, setSelectedBirth] = useState<Date>();

  useEffect(() => {
    if (selectedBaptism) {
      setForm((prev) => ({
        ...prev,
        baptism_date: selectedBaptism.toISOString().split('T')[0], // YYYY-MM-DD
      }));
    }
  }, [selectedBaptism]);

  useEffect(() => {
    if (selectedBirth) {
      setForm((prev) => ({
        ...prev,
        birth_date: selectedBirth.toISOString().split('T')[0], // YYYY-MM-DD
      }));
    }
  }, [selectedBirth]);

  const [form, setForm] = useState({
    name: '',
    birth_date: '',
    born_place: '',
    phone_number: '',
    baptism_date: '',
    is_married: false,
    mom_id: '',
    dad_id: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        mom_id: form.mom_id ? Number(form.mom_id) : undefined,
        dad_id: form.dad_id ? Number(form.dad_id) : undefined,
        baptism_date: form.baptism_date || undefined,
      };
      const { data } = await api.post('/jemaat', payload);
      const response: IBasicResponse = data;

      if (response.code === 201) {
        setForm({
          name: '',
          birth_date: '',
          born_place: '',
          phone_number: '',
          baptism_date: '',
          is_married: false,
          mom_id: '',
          dad_id: '',
        });
        navigate('/jemaat');
        toast.success('Jemaat berhasil ditambahkan!');
      } else {
        toast.error(response.message[0]);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Tambah Jemaat">
      <div id='create-jemaat' className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputText
            label="Nama"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Dropdown
            position="left"
            label="Tanggal Lahir"
            trigger={
              <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                {form.birth_date ? form.birth_date : 'Pilih Tanggal Lahir'}
              </button>
            }
          >
            <div className="p-4">
              <DayPicker
                mode="single"
                selected={selectedBirth}
                onSelect={setSelectedBirth}
              />
            </div>
          </Dropdown>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputText
            label="Tempat Lahir"
            name="born_place"
            value={form.born_place}
            onChange={handleChange}
            required
          />
          <InputText
            label="Nomor Telepon"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label="Tanggal Baptis (opsional)"
            trigger={
              <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                {form.baptism_date ? form.baptism_date : 'Pilih Tanggal Baptis'}
              </button>
            }
          >
            <div className="p-4">
              <DayPicker
                mode="single"
                selected={selectedBaptism}
                onSelect={setSelectedBaptism}
              />
            </div>
          </Dropdown>
          <div className="flex items-center gap-2 self-center">
            <input
              id="is_married"
              name="is_married"
              type="checkbox"
              checked={form.is_married}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className='flex self-center'>

              <p className="text-gray-700 dark:text-gray-200 font-semibold ">Sudah Menikah</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputText
            label="ID Ibu (opsional)"
            name="mom_id"
            type="number"
            value={form.mom_id}
            onChange={handleChange}
          />
          <InputText
            label="ID Ayah (opsional)"
            name="dad_id"
            type="number"
            value={form.dad_id}
            onChange={handleChange}
          />
        </div>
        <button
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

export default CreateJemaat;
