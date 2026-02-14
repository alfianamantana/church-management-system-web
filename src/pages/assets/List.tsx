import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import dayjs from 'dayjs';
import Dropdown from '../../components/Dropdowns';
import DatePicker from '../../components/DayPicker';
import { useTranslation } from 'react-i18next';
import InputText from '../../components/InputText';
import TextArea from '../../components/TextArea';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../../components/Button';
import { getMessage, getCurrency, IBasicResponse, IAsset, IPagination } from '@/constant';

interface IAssetDisplay {
  id: number;
  name: string;
  description?: string;
  value: string;
  acquisition_date: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  location?: string;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface IAssetResponse extends IBasicResponse {
  data: IAsset[];
  pagination: IPagination;
}

const AssetList: React.FC = () => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<IAssetDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 10;
  const dispatch = useDispatch();

  // Date picker state
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Month/Year picker state
  const conditionDropdownRef = useRef<{ close: () => void }>(null);

  // Dropdown open states for chevron icons
  const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);

  // Condition dropdown state
  const [selectedCondition, setSelectedCondition] = useState<string>('good');

  // Currency symbol state
  const [currencySymbol, setCurrencySymbol] = useState<string>('Rp');

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    value: string;
    acquisition_date: string;
    condition: string;
    location: string;
    category: string;
    notes: string;
  }>({
    name: '',
    description: '',
    value: '',
    acquisition_date: '',
    condition: 'good',
    location: '',
    category: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<IAssetDisplay | null>(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingAsset, setDeletingAsset] = useState<IAsset | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle(t('asset_list')));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        acquisition_date: dayjs(selectedDate).format('YYYY-MM-DD'),
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      condition: selectedCondition,
    }));
  }, [selectedCondition]);

  // Load currency symbol from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selected_currency') || 'IDR';
    const currency = getCurrency(savedCurrency);
    if (currency) {
      setCurrencySymbol(currency.symbol);
    }
  }, []);

  // Reset dropdown states when closed
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsConditionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAssets = async (page: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/assets?page=${page}&limit=${pageSize}&q=${q}`);
      const response: IAssetResponse = data;

      if (response.code === 200) {
        const resData = response.data.map(asset => ({
          ...asset,
          value: asset.value ? formatRupiah(asset.value.toString()) : '-',
          acquisition_date: asset.acquisition_date ? dayjs(asset.acquisition_date).format('D MMM, YYYY') : '-',
          createdAt: dayjs(asset.createdAt).format('DD-MM-YYYY HH:mm'),
        }));
        setAssets(resData);
        setTotal(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / pageSize));
      } else {
        toast.error(String(t('failed_fetch_assets')));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(currentPage, search);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAssets(1, search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddAsset = () => {
    const today = new Date();
    setSelectedDate(today);
    setSelectedCondition('good');
    setFormData({
      name: '',
      description: '',
      value: '',
      acquisition_date: dayjs(today).format('YYYY-MM-DD'),
      condition: 'good',
      location: '',
      category: '',
      notes: ''
    });
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleEditAsset = (asset: IAssetDisplay) => {
    const assetDate = asset.acquisition_date && asset.acquisition_date !== '-' ? new Date(asset.acquisition_date.split('-').reverse().join('-')) : new Date();
    setSelectedDate(assetDate);
    setSelectedCondition(asset.condition);
    setFormData({
      name: asset.name,
      description: asset.description || '',
      value: asset.value && asset.value !== '-' ? asset.value.replace(/[^\d]/g, '') : '',
      acquisition_date: asset.acquisition_date && asset.acquisition_date !== '-' ? asset.acquisition_date.split('-').reverse().join('-') : dayjs().format('YYYY-MM-DD'),
      condition: asset.condition,
      location: asset.location || '',
      category: asset.category || '',
      notes: asset.notes || ''
    });
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDeleteAsset = (asset: IAsset) => {
    setDeletingAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(String(t('asset_name_required')));
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        value: formData.value ? parseInt(formData.value.replace(/[^\d]/g, '')) : null,
      };

      let response;
      if (editingAsset) {
        response = await api({ method: 'put', url: `/assets/`, data: submitData, params: { id: editingAsset.id } });
      } else {
        response = await api({ method: 'post', url: '/assets', data: submitData });
      }

      if (response.data.code === (editingAsset ? 200 : 201)) {
        toast.success(String(editingAsset ? t('asset_updated') : t('asset_added')));
        setIsModalOpen(false);
        fetchAssets(currentPage, search);
      } else {
        toast.error(String(editingAsset ? t('failed_update_asset') : t('failed_add_asset')));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);

    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return;

    setDeleting(true);
    try {
      const { data } = await api({ method: 'delete', url: `/assets/`, params: { id: deletingAsset.id } });
      const response: IBasicResponse = data;

      if (response.code === 200) {
        toast.success(String(t('asset_deleted')));
        setIsDeleteModalOpen(false);
        fetchAssets(currentPage, search);
      } else {
        toast.error(getMessage(response.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setDeleting(false);
    }
  };

  const formatRupiah = (value: string | number) => {
    const numericValue = value.toString().replace(/[^\d]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'value') {
      // For value field, format as Rupiah
      const formattedValue = formatRupiah(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const conditionOptions = [
    { value: 'excellent', label: t('excellent') },
    { value: 'good', label: t('good') },
    { value: 'fair', label: t('fair') },
    { value: 'poor', label: t('poor') },
    { value: 'damaged', label: t('damaged') },
  ];

  const tableHeads = [
    { label: t('asset_name'), key: 'name', thClass: 'w-32' },
    { label: t('value'), key: 'value', tdClass: 'text-right', thClass: 'w-32' },
    { label: t('description'), key: 'description', thClass: 'w-72' },
    {
      label: t('condition'), key: 'condition', thClass: 'w-32', render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          value === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            value === 'fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              value === 'poor' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
          {t(value)}
        </span>
      )
    },
    { label: t('location'), key: 'location', thClass: 'w-32' },
    { label: t('category'), key: 'category', thClass: 'w-32' },
    { label: t('acquisition_date'), key: 'acquisition_date', thClass: 'w-32' },
  ];

  const processedAssets = assets.map(asset => ({
    ...asset,
    value: asset.value && asset.value !== '-' ? `${currencySymbol} ${asset.value}` : '-',
    description: asset.description || '-',
    location: asset.location || '-',
    category: asset.category || '-',
  }));

  return (
    <Card title={t('asset_list')} id="asset-list-card clas">
      <div className="mb-4 px-2 md:px-0">
        <div className="flex flex-col gap-3 md:flex-row md:gap-2">
          <InputText
            type="text"
            placeholder={t('search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-2 text-xs"
          />
          <div className="flex flex-col gap-2 md:flex-row md:gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearch}
            >
              {t('search')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddAsset}
              className="bg-success"
            >
              {t('add_asset')}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">{t('loading')}...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table
              id="asset-table"
              heads={tableHeads}
              data={processedAssets}
              currentPage={currentPage}
              pageSize={pageSize}
              showIndex={true}
              canEdit={true}
              callbackEdit={handleEditAsset}
              canDelete={true}
              callbackDelete={handleDeleteAsset}
              action={true}
            />
          </div>
          <Pagination
            id="asset-pagination"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            totalItems={total}
          />
        </>
      )}
      <Modal
        id="asset-modal"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAsset ? t('edit_asset') : t('add_asset')}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4" id="asset-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="asset-form-grid-1">
            <InputText
              id="asset-name-input"
              label={t('asset_name')}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <InputText
              id="asset-value-input"
              label={t('value')}
              type="text"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              placeholder={`0`}
              leftIcon={<span className="text-muted-foreground font-medium">{currencySymbol}</span>}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="asset-form-grid-2">
            <div id="asset-condition-container">
              <label id="asset-condition-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('condition')}
              </label>
              <Dropdown
                id="asset-condition-dropdown"
                ref={conditionDropdownRef}
                onOpenChange={setIsConditionDropdownOpen}
                trigger={
                  <div
                    id="asset-condition-trigger"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-left flex items-center justify-between"
                  >
                    <span>{conditionOptions.find(option => option.value === selectedCondition)?.label || t('select_condition')}</span>
                    {isConditionDropdownOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                }
                position='bottom-right'
              >
                <div id="asset-condition-options" className="max-h-40 overflow-y-auto w-full" onMouseDown={(e) => e.stopPropagation()}>
                  {conditionOptions.map(option => (
                    <div
                      key={option.value}
                      id={`asset-condition-option-${option.value}`}
                      className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCondition(option.value as 'excellent' | 'good' | 'fair' | 'poor' | 'damaged');
                        conditionDropdownRef.current?.close();
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </Dropdown>
            </div>

            <DatePicker
              label={t('acquisition_date')}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              id="asset-acquisition"
              position="bottom-left"
              disabled={{ after: new Date() }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="asset-form-grid-3">
            <InputText
              id="asset-location-input"
              label={t('location')}
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />

            <InputText
              id="asset-category-input"
              label={t('category')}
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div>

          <div id="asset-description-container">
            <label id="asset-description-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('description')}
            </label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div id="asset-notes-container">
            <label id="asset-notes-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('notes')}
            </label>
            <TextArea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="asset-form-actions">
            <Button
              id="asset-cancel-button"
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
              className="w-full md:flex-1 py-3 text-xs"
            >
              {t('cancel')}
            </Button>
            <Button
              id="asset-submit-button"
              variant="primary"
              size="md"
              type="submit"
              disabled={submitting}
              loading={submitting}
              className="w-full md:flex-1 py-3 text-xs"
            >
              {editingAsset ? t('update') : t('save')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        id="delete-asset-modal"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirm') + ' ' + t('delete')}
        size="sm"
      >
        <div className="space-y-4" id="delete-modal-content">
          <p className="text-foreground" id="delete-confirmation-text">
            {t('confirm_delete_asset')} <strong>{deletingAsset?.name}</strong>?
          </p>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="delete-modal-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-full md:flex-1"
              id="delete-cancel-button"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              loading={deleting}
              className="w-full md:flex-1"
              id="delete-confirm-button"
            >
              {deleting ? t('deleting') : t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default AssetList;
