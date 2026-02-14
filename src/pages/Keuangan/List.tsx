import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import InputText from '../../components/InputText';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { ITransaction, IBasicResponse, IPagination, ICategory, getCurrency } from '@/constant';
import dayjs from 'dayjs';
import Dropdown from '../../components/Dropdowns';
import { useTranslation } from 'react-i18next';
import TextArea from '../../components/TextArea';
import Button from '../../components/Button';
import DatePicker from '../../components/DayPicker';
import { ChevronDown } from 'lucide-react';

interface ITransactionResponse extends IBasicResponse {
  data: ITransaction[];
  pagination: IPagination;
}

const KeuanganList: React.FC = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 10;
  const dispatch = useDispatch();

  // Date picker state
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Category dropdown state
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);

  // Currency symbol state
  const [currencySymbol, setCurrencySymbol] = useState<string>('Rp');

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ date: string; category_id: number; amount: string; note: string }>({
    date: '',
    category_id: 0,
    amount: '',
    note: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingTransaction, setDeletingTransaction] = useState<ITransaction | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle(t('finance_list')));
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedCategory) {
      setFormData((prev) => ({
        ...prev,
        category_id: selectedCategory.id,
      }));
    }
  }, [selectedCategory]);

  // Load currency symbol from localStorage
  useEffect(() => {
    const loadCurrency = () => {
      const savedCurrency = localStorage.getItem('selected_currency') || 'IDR';
      const currency = getCurrency(savedCurrency);
      if (currency) {
        setCurrencySymbol(currency.symbol);
      }
    };

    // Load initial currency
    loadCurrency();

    // Listen for currency change events
    const handleCurrencyChange = () => {
      loadCurrency();
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.code === 200) {
        setCategories(data.data);
      } else {
        toast.error(String(t('failed_fetch_categories')));
      }
    } catch (error) {
      toast.error(String(t('failed_fetch_categories')));
    }
  };

  const fetchTransactions = async (page: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions?page=${page}&limit=${pageSize}&q=${q}`);
      const response: ITransactionResponse = data;

      if (response.code === 200) {
        const resData = response.data.map(transaction => ({
          ...transaction,
          amount: formatRupiah(typeof transaction.amount === 'string' ? transaction.amount : transaction.amount.toString()),
          date: dayjs(transaction.date).format('DD MMM, YYYY'),
          createdAt: dayjs(transaction.createdAt).format('DD MMM, YYYY'),
        }));
        setTransactions(resData);
        setTotal(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / pageSize));
      } else {
        toast.error(String(t('failed_fetch_transactions')));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage, search);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTransactions(1, search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddTransaction = () => {
    const today = new Date();
    setSelectedDate(today);
    setSelectedCategory(null);
    setIsCategoryDropdownOpen(false);
    setFormData({ date: dayjs(today).format('YYYY-MM-DD'), category_id: 0, amount: '', note: '' });
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: ITransaction) => {
    const transactionDate = new Date(transaction.date);
    setSelectedDate(transactionDate);
    const category = categories.find(cat => cat.id === transaction.category_id) || null;
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
    setFormData({
      date: transaction.date,
      category_id: transaction.category_id,
      amount: formatRupiah(typeof transaction.amount === 'string' ? transaction.amount : transaction.amount.toString()),
      note: transaction.note || ''
    });
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: ITransaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = parseFloat(formData.amount.replace(/[^\d]/g, ''));
    if (!formData.date || !selectedCategory || isNaN(amountValue) || amountValue <= 0) {
      toast.error(String(t('required_fields')));
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount.replace(/[^\d]/g, ''))
      };
      let response;
      if (editingTransaction) {
        response = await api({ url: `/transactions`, method: 'put', data: submitData, params: { id: editingTransaction.id } });
      } else {
        response = await api.post('/transactions', submitData);
      }

      if (response.data.code === (editingTransaction ? 200 : 201)) {
        toast.success(String(editingTransaction ? t('transaction_updated') : t('transaction_added')));
        setIsModalOpen(false);
        fetchTransactions(currentPage, search);
      } else {
        toast.error(String(editingTransaction ? t('failed_update_transaction') : t('failed_add_transaction')));
      }
    } catch (error) {
      toast.error(String(editingTransaction ? t('failed_update_transaction') : t('failed_add_transaction')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;

    setDeleting(true);
    try {
      const response = await api.delete('/transactions', { params: { id: deletingTransaction.id } });

      if (response.data.code === 200) {
        toast.success(String(t('transaction_deleted')));
        setIsDeleteModalOpen(false);
        fetchTransactions(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setDeleting(false);
    }
  };

  const formatRupiah = (value: string | number) => {
    // Convert to string if it's a number
    const stringValue = typeof value === 'number' ? value.toString() : value;
    // Remove all non-digit characters
    const numericValue = stringValue.replace(/[^\d]/g, '');
    // Format with thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'amount') {
      // For amount field, format as Rupiah
      const formattedValue = formatRupiah(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const tableHeads = [
    { label: t('date'), key: 'date' },
    { label: t('category'), key: 'category_name' },
    { label: t('amount'), key: 'amount', tdClass: 'text-right', render: (value: any, row: any) => <span className={row.category?.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{value}</span> },
    { label: t('note'), key: 'note' },
    { label: t('created_at'), key: 'createdAt' },
  ];

  const processedTransactions = transactions.map(t => ({
    ...t,
    category_name: `${t.category?.name || 'Unknown'} (${t.category?.type || 'Unknown'})`,
    amount: `${currencySymbol} ${t.amount}`,
  }));

  return (
    <div id="keuangan-list-container">
      <Card title="Keuangan List" id="keuangan-list-card">
        <div className="mb-4 px-2 md:px-0" id="search-section">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2" id="search-controls">
            <InputText
              id="search-input"
              type="text"
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-2 text-xs"
            />
            <div className="flex flex-col gap-2 md:flex-row md:gap-2">
              <Button
                id="search-button"
                variant="primary"
                size="sm"
                onClick={handleSearch}
                type="button"
              >
                {t('search')}
              </Button>
              <Button
                onClick={handleAddTransaction}
                id="add-transaction-button"
                variant="primary"
                size="sm"
                className="bg-success"
              >
                {t('add_transaction')}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4" id="loading-indicator">{t('loading')}...</div>
        ) : (
          <>
            <div className="overflow-x-auto" id="table-container">
              <Table
                id="transactions-table"
                heads={tableHeads}
                data={processedTransactions}
                currentPage={currentPage}
                pageSize={pageSize}
                showIndex={true}
                canEdit={true}
                callbackEdit={handleEditTransaction}
                canDelete={true}
                callbackDelete={handleDeleteTransaction}
                action={true}
              />
            </div>
            <Pagination
              id="transactions-pagination"
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
        id="transaction-form-modal"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? t('edit_transaction') : t('add_transaction')}
        size="md"
      >
        <div className="space-y-4" id="form-modal-content">
          <DatePicker
            label={t('date')}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            id="transaction-date"
            position="bottom-left"
            disabled={{ after: new Date() }}
          />
          <div id="category-field">
            <Dropdown
              required={true}
              position="bottom"
              label={t('category')}
              onOpenChange={(open) => setIsCategoryDropdownOpen(open)}
              trigger={
                <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between" id="category-dropdown-button">
                  <span>{selectedCategory ? selectedCategory.name : t('select_category')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              }
            >
              <div className="max-h-48 overflow-y-auto" id="category-list">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                    id={`category-option-${cat.id}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>
          <div id="amount-field">
            <InputText
              label={t('amount')}
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder={`0`}
              required
              leftIcon={<span className="text-gray-500 dark:text-gray-400 font-medium">{currencySymbol}</span>}
            />
          </div>
          <TextArea
            label={t('note')}
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={3}
          />
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="form-modal-actions">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
              size="md"
              id="form-cancel-button"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleFormSubmit}
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              id="form-submit-button"
            >
              {submitting ? (editingTransaction ? t('updating') : t('adding')) : (editingTransaction ? t('update_transaction') : t('add_transaction'))}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        id="delete-confirmation-modal"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirm') + ' ' + t('delete')}
        size="sm"
      >
        <div className="space-y-4" id="delete-modal-content">
          <p className="text-gray-700 dark:text-gray-300" id="delete-confirmation-text">
            {t('confirm_delete_transaction')}
          </p>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="delete-modal-actions">
            <Button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
              size="md"
              id="delete-cancel-button"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="destructive"
              size="md"
              loading={deleting}
              id="delete-confirm-button"
            >
              {deleting ? t('deleting') : t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KeuanganList;