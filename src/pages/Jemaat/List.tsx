import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import SkeletonTable from '../../components/Skeletons/Table'
import SkeletonPagination from '../../components/Skeletons/Pagination';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { IPagination, IUser, IBasicResponse } from '../../constant';

interface IJemaatResponse extends IBasicResponse {
  data: IUser[];
  pagination: IPagination;
}

const Jemaat: React.FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jemaatData, setJemaatData] = useState<any[]>([]);
  const PAGE_SIZE = 10;

  const heads = [
    { label: 'Nama', key: 'name' },
    { label: 'Phone', key: 'phone_number' },
  ];

  const fetchJemaat = async (page: number = 1) => {
    setLoading(true);
    try {
      const { data } = await api({ url: `/jemaat?page=${page}&limit=${PAGE_SIZE}`, method: 'GET' });
      const response: IJemaatResponse = data;

      if (response.code === 200) {
        setJemaatData(response.data);
        setTotalItems(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / PAGE_SIZE));
      } else {
        toast.error(response.message[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch jemaat data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJemaat(currentPage);
  }, [currentPage]);

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
      <Card title={t("list_jemaat")}>
        {loading ? <SkeletonTable /> : <Table heads={heads} data={jemaatData} currentPage={currentPage} pageSize={PAGE_SIZE} />}
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
