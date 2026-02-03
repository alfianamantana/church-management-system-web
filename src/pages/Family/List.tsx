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
import { IFamily, IBasicResponse, IPagination } from '@/constant';
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

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ name: string }>({ name: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingFamily, setEditingFamily] = useState<IFamily | null>(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingFamily, setDeletingFamily] = useState<IFamily | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle('Family List'));
  }, []);

  const fetchFamilies = async (page: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/families?page=${page}&limit=${pageSize}&q=${q}`);
      const response: IFamilyResponse = data;

      if (response.code === 200) {
        const resData = response.data.map(family => ({
          ...family,
          createdAt: dayjs(family.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        }));
        setFamilies(resData);
        setTotal(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / pageSize));
      } else {
        toast.error(response.message[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch families.');
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
    setIsModalOpen(true);
  };

  const handleEditFamily = (family: IFamily) => {
    setFormData({ name: family.name });
    setEditingFamily(family);
    setIsModalOpen(true);
  };

  const handleDeleteFamily = (family: IFamily) => {
    setDeletingFamily(family);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Family name is required');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editingFamily) {
        response = await api({ url: `/families`, method: 'put', data: formData, params: { id: editingFamily.id } });
      } else {
        response = await api.post('/families', formData);
      }

      if (response.data.code === (editingFamily ? 200 : 201)) {
        toast.success(`Family ${editingFamily ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchFamilies(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(`Failed to ${editingFamily ? 'update' : 'add'} family`);
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
        toast.success('Family deleted successfully');
        setIsDeleteModalOpen(false);
        fetchFamilies(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error('Failed to delete family');
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const tableHeads = [
    { label: 'Family Name', key: 'name' },
  ];

  return (
    <div>
      <Card title="Family List">
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by family name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200"
            >
              Search
            </button>
            <button
              className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200'
              onClick={handleAddFamily}
            >
              Add Family
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            <Table
              heads={tableHeads}
              data={families}
              currentPage={currentPage}
              pageSize={pageSize}
              showIndex={true}
              canEdit={true}
              callbackEdit={handleEditFamily}
              canDelete={true}
              callbackDelete={handleDeleteFamily}
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
        title={editingFamily ? 'Edit Family' : 'Add New Family'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <InputText
            label="Family Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (editingFamily ? 'Updating...' : 'Adding...') : (editingFamily ? 'Update Family' : 'Add Family')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete family <strong>{deletingFamily?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FamilyList;