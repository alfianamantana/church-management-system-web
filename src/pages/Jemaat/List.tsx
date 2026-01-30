import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import SkeletonTable from '../../components/Skeletons/Table'
import SkeletonPagination from '../../components/Skeletons/Pagination';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import InputText from '../../components/InputText';
import { IBasicResponse, IJemaat, IPagination } from '../../constant';
import dayjs from 'dayjs';

interface IJemaatResponse extends IBasicResponse {
  data: IJemaat[];
  pagination: IPagination;
}

const Jemaat: React.FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jemaatData, setJemaatData] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const PAGE_SIZE = 10;
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const calculateAge = (birthDate: string | Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const heads = [
    { label: 'Nama', key: 'name' },
    { label: 'Tanggal Lahir', key: 'birth_date' },
    { label: 'Umur', key: 'age' },
    { label: 'Phone', key: 'phone_number' },
  ];

  const fetchJemaat = async (page: number = 1) => {
    setLoading(true);
    try {
      const { data } = await api({ url: `/jemaat?page=${page}&limit=${PAGE_SIZE}&q=${debouncedQ}`, method: 'GET' });
      const response: IJemaatResponse = data;

      if (response.code === 200) {
        setJemaatData(response.data.map(jemaat => ({
          ...jemaat,
          age: calculateAge(jemaat.birth_date),
          birth_date: dayjs(jemaat.birth_date).format('DD-MM-YYYY'),
        })));
        setTotalItems(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / PAGE_SIZE));
      } else {
        toast.error(response.message[0]);
      }
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJemaat(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedQ(q);
    }, 500); // 500ms delay

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [q]);

  useEffect(() => {
    fetchJemaat(1);
    setCurrentPage(1);
  }, [debouncedQ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className='flex flex-col gap-y-5'>
      <NavLink to="/jemaat/create" className="self-end">
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          {t("create_jemaat")}
        </button>
      </NavLink>
      <InputText
        placeholder="Search by name..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Card title={t("list_jemaat")}>
        {loading ? <SkeletonTable /> : <Table heads={heads} data={jemaatData} currentPage={currentPage} pageSize={PAGE_SIZE} showIndex={true} />}
        {loading ? <SkeletonPagination /> : !loading && jemaatData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            className="mt-4"
          />
        )}
      </Card>
    </div>
  );
};

export default Jemaat;
