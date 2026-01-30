import React, { useState } from 'react';
import InputText from '../../components/InputText';
import Card from '../../components/Card';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { IBasicResponse } from '../../constant';
import { useNavigate } from 'react-router-dom';
const CreateJemaat: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      <InputText
        label="Nama"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <InputText
        label="Tanggal Lahir"
        name="birth_date"
        type="date"
        value={form.birth_date}
        onChange={handleChange}
        required
      />
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
      <InputText
        label="Tanggal Baptis (opsional)"
        name="baptism_date"
        type="date"
        value={form.baptism_date}
        onChange={handleChange}
      />
      <div className="flex items-center gap-2">
        <input
          id="is_married"
          name="is_married"
          type="checkbox"
          checked={form.is_married}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_married" className="text-gray-700 dark:text-gray-200">Sudah Menikah</label>
      </div>
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
      <button
        onClick={handleSubmit}
        type="submit"
        className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? (t('saving')) : t('save')}
      </button>
    </Card>
  );
};

export default CreateJemaat;
