import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { IBasicResponse, IJemaat, IPagination, getMessage } from '../../constant';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '@/store/themeConfigSlice';
import { useDispatch } from 'react-redux';
interface IJemaatResponse extends IBasicResponse {
  data: IJemaat[];
  pagination: IPagination;
}

const Jemaat: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Jemaat'));
  });
  const navigate = useNavigate();
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

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingJemaat, setDeletingJemaat] = useState<IJemaat | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const heads = [
    { label: t('name'), key: 'name' },
    { label: t('gender'), key: 'gender' },
    { label: t('birth_date'), key: 'birth_date' },
    { label: t('age'), key: 'age' },
    { label: t('phone_number'), key: 'phone_number' },
  ];

  const fetchJemaat = async (page: number = 1) => {
    setLoading(true);
    try {
      const { data } = await api({ url: `/jemaat?page=${page}&limit=${PAGE_SIZE}&q=${debouncedQ}`, method: 'GET' });
      const response: IJemaatResponse = data;

      if (response.code === 200) {
        setJemaatData(response.data.map(jemaat => ({
          ...jemaat,
          birth_date: dayjs(jemaat.birth_date).format('DD-MM-YYYY'),
        })));
        setTotalItems(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / PAGE_SIZE));
      } else {
        toast.error(getMessage(response.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
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

  const handleDeleteJemaat = (jemaat: IJemaat) => {
    setDeletingJemaat(jemaat);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingJemaat) return;

    setDeleting(true);
    try {
      const response = await api({ url: `/jemaat`, method: 'DELETE', params: { id: deletingJemaat.id } });

      if (response.data.code === 200) {
        toast.success(t('jemaat_deleted') as string || 'Jemaat deleted successfully');
        setIsDeleteModalOpen(false);
        fetchJemaat(currentPage);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string || 'Failed to delete jemaat');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div id="jemaat-list-page">
      <Card title={t("list_jemaat")} id="jemaat-list-card">
        <div className="mb-4 px-2 md:px-0" id="search-section">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2" id="search-controls">
            <input
              id="search-input"
              type="text"
              placeholder={t("search_by_name")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
            <div className="flex flex-col gap-2 md:flex-row md:gap-2">
              <button
                id="search-button"
                onClick={() => {
                  setDebouncedQ(q);
                  setCurrentPage(1);
                }}
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 text-sm md:text-base"
              >
                {t('search')}
              </button>
              <NavLink to="/jemaat/create">
                <button id="create-jemaat-button" className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200 text-sm md:text-base'>
                  {t("create_jemaat")}
                </button>
              </NavLink>
            </div>
          </div>
        </div>

        {loading ? (
          <div id="loading-indicator" className="text-center py-4">{t('loading')}...</div>
        ) : (
          <>
            <Table
              id="jemaat-table"
              heads={heads}
              data={jemaatData}
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              showIndex={true}
              action={true}
              canDelete={true}
              canEdit={true}
              callbackEdit={(row) => navigate('/jemaat/edit/' + row.id)}
              callbackDelete={handleDeleteJemaat}
            />
            {!loading && jemaatData.length > 0 && (
              <Pagination
                id="jemaat-pagination"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                className="mt-4"
              />
            )}
          </>
        )}
      </Card>

      <Modal
        id="delete-modal"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirm_delete') || 'Confirm Delete'}
        size="sm"
      >
        <div className="space-y-4" id="delete-modal-content">
          <p className="text-gray-700 dark:text-gray-300">
            {t('confirm_delete_jemaat') || 'Are you sure you want to delete jemaat'} <strong>{deletingJemaat?.name}</strong>? {t('cannot_be_undone') || 'This action cannot be undone.'}
          </p>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="delete-modal-actions">
            <button
              id="cancel-delete-button"
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm md:text-base"
            >
              {t('cancel')}
            </button>
            <button
              id="confirm-delete-button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {deleting ? t('deleting') : t('delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Jemaat;
