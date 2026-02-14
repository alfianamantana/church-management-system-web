import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import InputText from '../../components/InputText';
import Button from '../../components/Button';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { IBasicResponse, IJemaat, IPagination, getMessage } from '../../constant';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '@/store/themeConfigSlice';
import { useDispatch } from 'react-redux';
interface IJemaatResponse extends IBasicResponse {
  data: IJemaat[];
  pagination: IPagination;
}
interface IJemaatDetailResponse extends IBasicResponse {
  data: IJemaat[];
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

  // Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<IJemaat | null>(null);

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
          birth_date: dayjs(jemaat.birth_date).format('DD MMM, YYYY'),
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

  const fetchDetailJemaat = async (id: number) => {
    try {
      const { data } = await api({ url: `/jemaat`, method: 'get', params: { id, couple: true, children: true, mom: true, dad: true } });
      const response: IJemaatDetailResponse = data;
      if (response.code === 200) {
        if (response.data.length) {
          return response.data[0];
        } else {
          toast.error(t('jemaat_not_found') as string);
          return null;
        }
      } else {
        toast.error(getMessage(response.message));
        return null;
      }
    } catch (err) {
      toast.error(t('something_went_wrong') as string);
      return null;
    }
  };

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

  const handleViewJemaat = async (row: any) => {
    const data = await fetchDetailJemaat(row.id);
    if (data) {
      setDetailData(data);
      setIsDetailModalOpen(true);
    }
  };

  return (
    <div id="jemaat-list-page">
      <Card title={t("list_jemaat")} id="jemaat-list-card">
        <div className="mb-4 px-2 md:px-0" id="search-section">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2" id="search-controls">
            <InputText
              id="search-input"
              type="text"
              placeholder={t("search_by_name")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 px-2 text-xs"
            />
            <div id="search-buttons" className="flex flex-col gap-2 md:flex-row md:gap-2">
              <Button
                id="search-button"
                onClick={() => {
                  setDebouncedQ(q);
                  setCurrentPage(1);
                }}
                type="button"
                variant="primary"
                size="sm"
                className="px-3 text-xs"
              >
                {t('search')}
              </Button>
              <Button
                onClick={() => navigate('/jemaat/create')}
                id="create-jemaat-button"
                variant="primary"
                size="sm"
                className="px-3 text-xs bg-success hover:bg-success/90 text-white"
              >
                {t("create_jemaat")}
              </Button>
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
              canView={true}
              callbackEdit={(row) => navigate('/jemaat/edit/' + row.id)}
              callbackDelete={handleDeleteJemaat}
              callbackView={handleViewJemaat}
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
          <p className="text-muted-foreground">
            {t('confirm_delete_jemaat') || 'Are you sure you want to delete jemaat'} <strong>{deletingJemaat?.name}</strong>? {t('cannot_be_undone') || 'This action cannot be undone.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2" id="delete-modal-actions">
            <Button
              id="cancel-delete-button"
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
              className="text-sm md:text-base"
            >
              {t('cancel')}
            </Button>
            <Button
              id="confirm-delete-button"
              onClick={handleConfirmDelete}
              variant="destructive"
              loading={deleting}
              className="text-sm md:text-base"
            >
              {deleting ? t('deleting') : t('delete')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        id="detail-modal"
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={t('detail_jemaat') || 'Detail Jemaat'}
        size="lg"
      >
        <div className="space-y-4" id="detail-modal-content">
          {detailData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="detail-grid">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">{t('name')}</label>
                  <p className="text-foreground">{detailData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">{t('gender')}</label>
                  <p className="text-foreground">{detailData.gender === 'male' ? t('male') : t('female')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">{t('birth_date')}</label>
                  <p className="text-foreground">{dayjs(detailData.birth_date).format('DD-MM-YYYY')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">{t('age')}</label>
                  <p className="text-foreground">{detailData.age}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">{t('phone_number')}</label>
                  <p className="text-foreground">{detailData.phone_number || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">{t('born_place')}</label>
                  <p className="text-foreground">{detailData.born_place}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">{t('is_married')}</label>
                  <p className="text-foreground">{detailData.is_married ? t('yes') : t('no')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">{t('baptism_date')}</label>
                  <p className="text-foreground">{detailData.baptism_date ? dayjs(detailData.baptism_date).format('DD-MM-YYYY') : '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">{t('couple')}</label>
                <p className="text-foreground">{detailData.couple ? detailData.couple.name : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">{t('mom')}</label>
                <p className="text-foreground">{detailData.mom ? detailData.mom.name : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">{t('dad')}</label>
                <p className="text-foreground">{detailData.dad ? detailData.dad.name : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">{t('children')}</label>
                {detailData.children && detailData.children.length > 0 ? (
                  <ul className="list-disc list-inside text-foreground">
                    {detailData.children.map((child, index) => (
                      <li key={index}>{child.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-foreground">-</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">{t('loading')}...</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Jemaat;
