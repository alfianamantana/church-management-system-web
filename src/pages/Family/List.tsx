import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import InputText from '../../components/InputText';
import DropdownSearch from '../../components/DropdownSearch';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import { IFamily, IBasicResponse, IPagination, IJemaat } from '@/constant';
import dayjs from 'dayjs';

interface IFamilyResponse extends IBasicResponse {
  data: IFamily[];
  pagination: IPagination;
}

const FamilyList: React.FC = () => {
  const [families, setFamilies] = useState<IFamily[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 10;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ name: string }>({ name: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingFamily, setEditingFamily] = useState<IFamily | null>(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingFamily, setDeletingFamily] = useState<IFamily | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Jemaat states
  const [allJemaat, setAllJemaat] = useState<IJemaat[]>([]);
  const [selectedJemaatIds, setSelectedJemaatIds] = useState<number[]>([]);
  // View detail states
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewFamily, setViewFamily] = useState<IFamily | null>(null);
  const [viewMembers, setViewMembers] = useState<IJemaat[]>([]);
  const [viewLoading, setViewLoading] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle(t('family_list')));
  }, []);

  const fetchJemaat = async () => {
    try {
      const { data } = await api.get('/jemaat', { params: { page: 1, limit: 1000 } }); // Fetch all jemaat
      if (data.code === 200) {
        setAllJemaat(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch jemaat', error);
    }
  };

  const fetchCurrentFamilyJemaat = async (familyId: number) => {
    try {
      const { data } = await api.get('/jemaat', { params: { family_id: familyId, page: 1, limit: 1000 } });
      if (data.code === 200) {
        setSelectedJemaatIds(data.data.map((j: IJemaat) => j.id));
      }
    } catch (error) {
      console.error('Failed to fetch current family jemaat', error);
    }
  };

  const fetchFamilies = async (page: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api({ url: `/families`, params: { member: true, page, limit: pageSize, q }, method: 'GET' });
      const response: IFamilyResponse = data;

      if (response.code === 200) {
        const resData = response.data.map(family => ({
          ...family,
          createdAt: dayjs(family.createdAt).format('DD-MM-YYYY HH:mm'),
        }));
        setFamilies(resData);
        setTotal(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / pageSize));
      } else {
        toast.error(response.message[0]);
      }
    } catch (error) {
      toast.error(t('failed_fetch_families') as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies(currentPage, search);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFamilies(1, search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddFamily = () => {
    setFormData({ name: '' });
    setEditingFamily(null);
    setSelectedJemaatIds([]);
    fetchJemaat();
    setIsModalOpen(true);
  };

  const handleEditFamily = (family: IFamily) => {
    setFormData({ name: family.name });
    setEditingFamily(family);
    fetchJemaat();
    fetchCurrentFamilyJemaat(family.id);
    setIsModalOpen(true);
  };

  const handleDeleteFamily = (family: IFamily) => {
    setDeletingFamily(family);
    setIsDeleteModalOpen(true);
  };

  const fetchFamilyMembers = async (familyId: number) => {
    setViewLoading(true);
    try {
      const { data } = await api.get('/jemaat', { params: { id: familyId, page: 1, limit: 1000 } });
      const response: IFamilyResponse = data;
      if (response.code === 200) {
        return response.data as IJemaat[];
      } else {
        toast.error(response.message[0]);
        return [];
      }
    } catch (error) {
      toast.error(t('failed_fetch_family_members') as string);
    } finally {
      setViewLoading(false);
    }
    return [];
  };

  const handleViewFamily = async (family: IFamily) => {
    setViewFamily(family);
    setIsViewModalOpen(true);
    setViewMembers(family.jemaats || []);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t('required_fields') as string);
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editingFamily) {
        response = await api({ url: `/families`, method: 'put', data: { ...formData, jemaat_ids: selectedJemaatIds }, params: { id: editingFamily.id } });
      } else {
        response = await api.post('/families', { ...formData, jemaat_ids: selectedJemaatIds });
      }

      if (response.data.code === (editingFamily ? 200 : 201)) {
        toast.success(t(editingFamily ? 'family_updated' : 'family_added') as string);
        setIsModalOpen(false);
        fetchFamilies(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(t(editingFamily ? 'failed_update_family' : 'failed_add_family') as string);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFamily) return;

    setDeleting(true);
    try {
      const response = await api.delete('/families', { params: { id: deletingFamily.id } });

      if (response.data.code === 200) {
        toast.success(t('family_deleted') as string);
        setIsDeleteModalOpen(false);
        fetchFamilies(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(t('failed_delete_family') as string);
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addJemaat = (id: number) => {
    if (!selectedJemaatIds.includes(id)) {
      setSelectedJemaatIds(prev => [...prev, id]);
    }
  };

  const removeJemaat = (id: number) => {
    setSelectedJemaatIds(prev => prev.filter(i => i !== id));
  };

  const tableHeads = [
    { label: t('family_name'), key: 'name' },
  ];

  return (
    <div id="family-list-container">
      <Card title={t('family_list')} id="family-list-card">
        <div className="mb-4 px-2 md:px-0" id="search-section">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2" id="search-controls">
            <input
              type="text"
              placeholder={t('search_by_name')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              id="search-input"
            />
            <div className="flex flex-col gap-2 md:flex-row md:gap-2">
              <button
                onClick={handleSearch}
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 text-sm md:text-base"
                id="search-button"
              >
                {t('search')}
              </button>
              <button
                className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200 text-sm md:text-base'
                onClick={handleAddFamily}
                id="add-family-button"
              >
                {t('add_family')}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4" id="loading-indicator">{t('loading')}...</div>
        ) : (
          <>
            <div className="overflow-x-auto" id="table-container">
              <Table

                id='family-table'
                heads={tableHeads}
                data={families}
                currentPage={currentPage}
                pageSize={pageSize}
                showIndex={true}
                canEdit={true}
                callbackEdit={handleEditFamily}
                canView={true}
                callbackView={handleViewFamily}
                canDelete={true}
                callbackDelete={handleDeleteFamily}
                action={true}
              />
            </div>
            <Pagination
              id='family-pagination'
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              totalItems={total}
            />
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFamily ? t('edit_family') : t('add_new_family')}
        size="md"
        id="family-form-modal"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4" id="form-content">
          <InputText
            label={t('family_name')}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            id="family-name-input"
          />
          <div id="select-members-section">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" id="select-members-label">
              {t('select_members')}
            </label>
            <DropdownSearch
              multiSelect
              placeholder={t('search_jemaat') as string}
              onSearch={async (q: string) => {
                try {
                  const { data } = await api.get('/jemaat', { params: { q, page: 1, limit: 50 } });
                  if (data && data.code === 200) {
                    return data.data.map((j: IJemaat) => ({ id: j.id, label: j.name }));
                  }
                } catch (err) {
                  console.error('jemaat search error', err);
                }
                return [];
              }}
              onSelect={(opt) => {
                if (Array.isArray(opt)) {
                  setSelectedJemaatIds(opt.map(o => Number(o.id)));
                } else if (opt) {
                  setSelectedJemaatIds([Number(opt.id)]);
                } else {
                  setSelectedJemaatIds([]);
                }
              }}
              selectedValue={allJemaat.filter(j => selectedJemaatIds.includes(j.id)).map(j => ({ id: j.id, label: j.name }))}
            />
          </div>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="form-modal-actions">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              id="form-cancel-button"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              id="form-submit-button"
            >
              {submitting ? (editingFamily ? t('updating') : t('adding')) : (editingFamily ? t('update_family') : t('add_family'))}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirm') + ' ' + t('delete')}
        size="sm"
        id="delete-confirmation-modal"
      >
        <div className="space-y-4" id="delete-modal-content">
          <p className="text-gray-700 dark:text-gray-300" id="delete-confirmation-text">
            {t('confirm_delete_family')}
          </p>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="delete-modal-actions">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              id="delete-cancel-button"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              id="delete-confirm-button"
            >
              {deleting ? t('deleting') : t('delete')}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={t('family_detail') + (viewFamily ? `: ${viewFamily.name}` : '')}
        size="md"
        id="view-family-modal"
      >
        <div id="family-detail-modal" className="space-y-4">
          {viewLoading ? (
            <div className="text-center py-4" id="view-loading">{t('loading')}...</div>
          ) : (
            <div className="space-y-4" id="view-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="view-grid">
                <div className="md:col-span-2" id="view-details-section">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('details')}</h4>
                  <div className="mt-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4" id="view-details-card">
                    <div className="mb-2" id="view-family-name">
                      <div className="text-sm text-gray-500">{t('family_name')}</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{viewFamily?.name || '-'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300" id="view-meta-grid">
                      <div id="view-created-at">
                        <div className="text-xs text-gray-500">{t('created_at')}</div>
                        <div className="font-medium">{dayjs(viewFamily?.createdAt).format('DD-MM-YYYY') || '-'}</div>
                      </div>
                      <div id="view-member-count">
                        <div className="text-xs text-gray-500">{t('member_count')}</div>
                        <div className="font-medium">{viewMembers.length}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="view-summary-section">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('summary')}</h4>
                  <div className="mt-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 text-center" id="view-summary-card">
                    <div className="text-xs text-gray-500">{t('members')}</div>
                    <div className="text-2xl font-semibold">{viewMembers.length}</div>
                  </div>
                </div>
              </div>

              <div id="view-members-section">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('members')}</h4>
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md" id="view-members-list">
                  {viewMembers.length > 0 ? (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800" id="members-ul">
                      {viewMembers.map(m => (
                        <li key={m.id} className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900" id={`member-item-${m.id}`}>
                          <div className="flex items-center gap-3" id={`member-info-${m.id}`}>
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-600 dark:text-white" id={`member-avatar-${m.id}`}>{(m.name || '').charAt(0).toUpperCase()}</div>
                            <div id={`member-details-${m.id}`}>
                              <div className="font-medium text-gray-900 dark:text-gray-100" id={`member-name-${m.id}`}>{m.name}</div>
                              <div className="text-xs text-gray-500" id={`member-meta-${m.id}`}>{t(m.gender)} - Age: {m.age}</div>
                              {(m as any).email && <div className="text-xs text-gray-500" id={`member-email-${m.id}`}>{(m as any).email}</div>}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500" id={`member-phone-${m.id}`}>{(m as any).phone || ''}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-sm text-gray-500" id="no-members">{t('no_members_selected')}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="view-modal-actions">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              id="view-close-button"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FamilyList;