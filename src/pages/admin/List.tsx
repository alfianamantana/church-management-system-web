import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Dropdown from '../../components/Dropdown';
import InputText from '../../components/InputText';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { setPageTitle } from '@/store/themeConfigSlice';
import { IUser, IBasicResponse, IPagination, getMessage } from '@/constant';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';

interface IUserResponse extends IBasicResponse {
  data: IUser[];
  pagination: IPagination;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
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
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    phone_number: string;
    role: 'superadmin' | 'user';
    subscribe_type: 'bibit' | 'bertumbuh' | 'full';
  }>({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'user',
    subscribe_type: 'bibit',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle('User List'));
  }, []);

  const fetchUsers = async (page: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/user', { params: { page, limit: pageSize, q } });
      const response: IUserResponse = data;

      if (response.code === 200) {
        const resData = response.data.map(user => ({
          ...user,
          createdAt: dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        }));
        setUsers(resData);
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
    fetchUsers(currentPage, search);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone_number: '',
      role: 'user',
      subscribe_type: 'bibit',
    });
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: IUser) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Password not shown for edit
      phone_number: user.phone_number,
      role: user.role,
      subscribe_type: user.subscribe_type,
    });
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: IUser) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      toast.error('Password is required for new user');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editingUser) {
        response = await api.put('/user', {
          id: editingUser.id,
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number,
          role: formData.role,
          subscribe_type: formData.subscribe_type,
        });
      } else {
        response = await api.post('/user/create', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          role: formData.role,
          subscribe_type: formData.subscribe_type,
        });
      }

      if (response.data.code === (editingUser ? 200 : 201)) {
        toast.success(`User ${editingUser ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchUsers(currentPage, search);
      } else {
        toast.error(getMessage(response.data.message));
      }
    } catch (error) {
      toast.error(`Failed to ${editingUser ? 'update' : 'add'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setDeleting(true);
    try {
      const response = await api.delete('/user', { params: { id: deletingUser.id } });

      if (response.data.code === 200) {
        toast.success('User deleted successfully');
        setIsDeleteModalOpen(false);
        fetchUsers(currentPage, search);
      } else {
        toast.error(getMessage(response.data.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone_number') {
      // Allow only numbers
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const tableHeads = [
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Role', key: 'role' },
    { label: 'Subscribe Type', key: 'subscribe_type' },
  ];

  return (
    <div>
      <Card title="User List" id="user-list-card">
        <div className="mb-4 px-2 md:px-0" id="search-section">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2" id="search-controls">
            <InputText
              id="search-input"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-2 text-xs"
            />
            <div className="flex flex-col gap-2 md:flex-row md:gap-2">
              <button
                id="search-button"
                onClick={handleSearch}
                type="button"
                className="px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary transition-all duration-200 text-xs"
              >
                Search
              </button>
              <button onClick={handleAddUser} id="add-user-button" className='px-3 bg-success text-white rounded-md hover:opacity-90 transition-all duration-200 text-xs'>
                Add User
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
                id="user-table"
                heads={tableHeads}
                data={users}
                currentPage={currentPage}
                pageSize={pageSize}
                showIndex={true}
                canEdit={true}
                callbackEdit={handleEditUser}
                canDelete={true}
                callbackDelete={handleDeleteUser}
                action={true}
              />
            </div>
            <Pagination
              id="user-pagination"
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
        id="user-modal"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <InputText
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <InputText
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {!editingUser && (
            <InputText
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          )}
          <InputText
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
          />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <Dropdown
              btnClassName="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
              button={
                <span className="flex items-center justify-between">
                  {formData.role === 'user' ? 'User' : 'Superadmin'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              }
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg py-1">
                <div
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                >
                  User
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'superadmin' }))}
                >
                  Superadmin
                </div>
              </div>
            </Dropdown>
          </div>
          <div>
            <label htmlFor="subscribe_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subscribe Type
            </label>
            <Dropdown
              btnClassName="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
              button={
                <span className="flex items-center justify-between">
                  {formData.subscribe_type === 'bibit' ? 'Bibit' : formData.subscribe_type === 'bertumbuh' ? 'Bertumbuh' : 'Full'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              }
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg py-1">
                <div
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setFormData(prev => ({ ...prev, subscribe_type: 'bibit' }))}
                >
                  Bibit
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setFormData(prev => ({ ...prev, subscribe_type: 'bertumbuh' }))}
                >
                  Bertumbuh
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setFormData(prev => ({ ...prev, subscribe_type: 'full' }))}
                >
                  Full
                </div>
              </div>
            </Dropdown>
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
              {submitting ? (editingUser ? 'Updating...' : 'Adding...') : (editingUser ? 'Update User' : 'Add User')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        id="delete-user-modal"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete user <strong>{deletingUser?.name}</strong>? This action cannot be undone.
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

export default UserList;
