import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { setPageTitle } from '@/store/themeConfigSlice';
import { IRole, IBasicResponse, IPagination, getMessage } from '@/constant';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';

interface IRoleResponse extends IBasicResponse {
  data: IRole[];
  pagination: IPagination;
}

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
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
  const [formData, setFormData] = useState<{ role_name: string }>({ role_name: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingRole, setDeletingRole] = useState<IRole | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle('Role List'));
  }, []);

  const fetchRoles = async (page: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/music/roles?page=${page}&limit=${pageSize}&q=${q}`);
      const response: IRoleResponse = data;

      if (response.code === 200) {
        const resData = response.data.map(role => ({
          ...role,
          createdAt: dayjs(role.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        }));
        setRoles(resData);
        setTotal(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / pageSize));
      } else {
        toast.error(getMessage(response.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles(currentPage, search);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRoles(1, search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddRole = () => {
    setFormData({ role_name: '' });
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: IRole) => {
    setFormData({ role_name: role.role_name });
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = (role: IRole) => {
    setDeletingRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editingRole) {
        response = await api({ url: `/music/roles`, method: 'put', data: formData, params: { id: editingRole.id } });
      } else {
        response = await api.post('/music/roles', formData);
      }

      if (response.data.code === (editingRole ? 200 : 201)) {
        toast.success(`Role ${editingRole ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchRoles(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(`Failed to ${editingRole ? 'update' : 'add'} role`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;

    setDeleting(true);
    try {
      const response = await api.delete('/music/roles', { params: { id: deletingRole.id } });

      if (response.data.code === 200) {
        toast.success('Role deleted successfully');
        setIsDeleteModalOpen(false);
        fetchRoles(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const tableHeads = [
    { label: 'Role Name', key: 'role_name' },
  ];

  return (
    <div>
      <Card title="Role List" id="role-list-card">
        <div className="mb-4 px-2 md:px-0">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2">
            <input
              type="text"
              placeholder="Search by role name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
            <div className="flex flex-col gap-2 md:flex-row md:gap-2">
              <button
                onClick={handleSearch}
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 text-sm md:text-base"
              >
                Search
              </button>
              <button
                className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200 text-sm md:text-base'
                onClick={handleAddRole}
              >
                Add Role
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                id="role-table"
                heads={tableHeads}
                data={roles}
                currentPage={currentPage}
                pageSize={pageSize}
                showIndex={true}
                canEdit={true}
                callbackEdit={handleEditRole}
                canDelete={true}
                callbackDelete={handleDeleteRole}
                action={true}
              />
            </div>
            <Pagination
              id="role-pagination"
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
        id="role-modal"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit Role' : 'Add New Role'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="role_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role Name *
            </label>
            <input
              type="text"
              id="role_name"
              name="role_name"
              value={formData.role_name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3">
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
              {submitting ? (editingRole ? 'Updating...' : 'Adding...') : (editingRole ? 'Update Role' : 'Add Role')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        id="delete-role-modal"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete role <strong>{deletingRole?.role_name}</strong>? This action cannot be undone.
          </p>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3">
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

export default RoleList;