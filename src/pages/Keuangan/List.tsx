import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { ITransaction, IBasicResponse, IPagination, ICategory } from '@/constant';
import dayjs from 'dayjs';
import Dropdown from '../../components/Dropdowns';
import { DayPicker } from "react-day-picker";
import { useTranslation } from 'react-i18next';
import TextArea from '../../components/TextArea';

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

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.code === 200) {
        setCategories(data.data);
      } else {
        toast.error(String(t('failed_fetch_categories')));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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
          amount: formatRupiah(parseFloat(transaction.amount).toString()),
          date: dayjs(transaction.date).format('DD-MM-YYYY'),
          createdAt: dayjs(transaction.createdAt).format('DD-MM-YYYY HH:mm'),
        }));
        setTransactions(resData);
        setTotal(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / pageSize));
      } else {
        toast.error(String(t('failed_fetch_transactions')));
      }
    } catch (error) {
      toast.error(String(t('failed_fetch_transactions')));
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
    setFormData({ date: dayjs(today).format('YYYY-MM-DD'), category_id: 0, amount: '', note: '' });
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: ITransaction) => {
    const transactionDate = new Date(transaction.date);
    setSelectedDate(transactionDate);
    const category = categories.find(cat => cat.id === transaction.category_id) || null;
    setSelectedCategory(category);
    setFormData({
      date: transaction.date,
      category_id: transaction.category_id,
      amount: formatRupiah(parseFloat(transaction.amount).toString()),
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
      toast.error(String(t('failed_delete_transaction')));
    } finally {
      setDeleting(false);
    }
  };

  const formatRupiah = (value: string | number) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
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
    amount: `Rp ${t.amount}`,
  }));

  return (
    <div>
      <Card title="Keuangan List">
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200"
            >
              {t('search')}
            </button>
            <button
              className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200'
              onClick={handleAddTransaction}
            >
              {t('add_transaction')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">{t('loading')}...</div>
        ) : (
          <>
            <Table
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
            <Pagination
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
        title={editingTransaction ? t('edit_transaction') : t('add_transaction')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <Dropdown
              required={true}
              position="bottom"
              label={t('date')}
              trigger={
                <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                  {formData.date ? dayjs(formData.date).format('DD/MM/YYYY') : t('select_date')}
                </button>
              }
            >
              <div className="p-4">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </div>
            </Dropdown>
          </div>
          <div>
            <Dropdown
              required={true}
              position="bottom"
              label={t('category')}
              trigger={
                <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                  {selectedCategory ? selectedCategory.name : t('select_category')}
                </button>
              }
            >
              <div className="max-h-48 overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('amount')} <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Rp</span>
              </div>
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder={t('amount_placeholder')}
                className="pl-12 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <TextArea
            label={t('note')}
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={3}
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleFormSubmit}
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting ? (editingTransaction ? t('updating') : t('adding')) : (editingTransaction ? t('update_transaction') : t('add_transaction'))}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirm') + ' ' + t('delete')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('confirm_delete_transaction')}
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {deleting ? t('deleting') : t('delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KeuanganList;