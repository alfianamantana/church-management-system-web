import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { IMember, IBasicResponse, IPagination } from '@/constant';
import dayjs from 'dayjs';

interface IMemberResponse extends IBasicResponse {
  data: IMember[];
  pagination: IPagination;
}

const MemberList: React.FC = () => {
  const [members, setMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 10;
  const dispatch = useDispatch();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ name: string; phone: string }>({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<IMember | null>(null);

  useEffect(() => {
    dispatch(setPageTitle('Member List'));
  }, []);

  const fetchMembers = async (page: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/music/members?page=${page}&limit=${pageSize}&q=${q}`);
      const response: IMemberResponse = data;

      if (response.code === 200) {
        const resData = response.data.map(member => ({
          ...member,
          createdAt: dayjs(member.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        }));
        setMembers(resData);
        setTotal(response.pagination.total);
        setTotalPages(Math.ceil(response.pagination.total / pageSize));
      } else {
        toast.error(response.message[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(currentPage, search);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMembers(1, search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddMember = () => {
    setFormData({ name: '', phone: '' });
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: IMember) => {
    setFormData({ name: member.name, phone: member.phone || '' });
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      let url = '/music/members';
      if (editingMember) {
        response = await api({ url: `/music/members`, method: 'put', data: formData, params: { id: editingMember.id } });
      } else {
        response = await api.post('/music/members', formData);
      }

      if (response.data.code === (editingMember ? 200 : 201)) {
        toast.success(`Member ${editingMember ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchMembers(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(`Failed to ${editingMember ? 'update' : 'add'} member`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const tableHeads = [
    { label: 'Name', key: 'name' },
    { label: 'Phone', key: 'phone' },
  ];

  return (
    <div>
      <Card title="Member List">
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name..."
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
              onClick={handleAddMember}
            >
              Add Member
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            <Table
              heads={tableHeads}
              data={members}
              currentPage={currentPage}
              pageSize={pageSize}
              showIndex={true}
              canEdit={true}
              callbackEdit={handleEditMember}
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
        title={editingMember ? 'Edit Member' : 'Add New Member'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
              {submitting ? (editingMember ? 'Updating...' : 'Adding...') : (editingMember ? 'Update Member' : 'Add Member')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MemberList;