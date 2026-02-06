import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Dropdown from '../../components/Dropdowns';
import { DayPicker } from "react-day-picker";
import api from '@/services/api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { ISchedule, IBasicResponse, IPagination, getMessage } from '@/constant';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface IScheduleResponse extends IBasicResponse {
  data: ISchedule[];
  pagination: IPagination;
}

const ScheduleList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 10;
  const dispatch = useDispatch();

  // View modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewSchedule, setViewSchedule] = useState<ISchedule | null>(null);
  const [viewLoading, setViewLoading] = useState<boolean>(false);

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ service_name: string; scheduled_at: string }>({ service_name: '', scheduled_at: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<ISchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingSchedule, setDeletingSchedule] = useState<ISchedule | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setPageTitle('Schedule List'));
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      setFormData((prev) => ({
        ...prev,
        scheduled_at: `${dateStr}T${selectedTime}`,
      }));
    }
  }, [selectedDate, selectedTime]);

  const fetchSchedules = async (page: number = 1, q: string = '') => {
    setLoading(true);
    try {
      const { data } = await api({ url: `/music/schedules`, params: { page, limit: pageSize, q, musician: true } });
      const response: IScheduleResponse = data;

      if (response.code === 200) {
        const resData = response.data.map(schedule => ({
          ...schedule,
          createdAt: dayjs(schedule.createdAt).format('DD-MM-YYYY HH:mm'),
          scheduled_at: dayjs(schedule.scheduled_at).format('DD-MM-YYYY HH:mm'),
        }));
        setSchedules(resData);
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
    fetchSchedules(currentPage, search);
  }, [currentPage]);

  const handleViewSchedule = async (schedule: ISchedule) => {
    setViewLoading(true);
    try {
      // We already have assignments in payload (musician=true), just set state
      setViewSchedule(schedule);
      setIsViewModalOpen(true);
    } catch (err) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setViewLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSchedules(1, search);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditSchedule = (schedule: ISchedule) => {
    navigate(`/schedule/edit/${schedule.id}`);
  };

  const handleDeleteSchedule = (schedule: ISchedule) => {
    setDeletingSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_name.trim() || !formData.scheduled_at.trim()) {
      toast.error('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editingSchedule) {
        response = await api({ url: `/music/schedules`, method: 'put', data: formData, params: { id: editingSchedule.id } });
      } else {
        response = await api.post('/music/schedules', formData);
      }

      if (response.data.code === (editingSchedule ? 200 : 201)) {
        toast.success(`Schedule ${editingSchedule ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchSchedules(currentPage, search);
      } else {
        toast.error(response.data.message[0]);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSchedule) return;

    setDeleting(true);
    try {
      const response = await api.delete('/music/schedules', { params: { id: deletingSchedule.id } });

      if (response.data.code === 200) {
        toast.success('Schedule deleted successfully');
        setIsDeleteModalOpen(false);
        fetchSchedules(currentPage, search);
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
    { label: 'Service Name', key: 'service_name' },
    { label: 'Scheduled At', key: 'scheduled_at' },
  ];

  return (
    <div id="schedule-list-container">
      <Card title="Schedule List" id="schedule-list-card">
        <div className="mb-4 px-2 md:px-0" id="search-section">
          <div className="flex flex-col gap-3 md:flex-row md:gap-2" id="search-controls">
            <input
              type="text"
              placeholder="Search by service name..."
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
                Search
              </button>
              <button
                className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200 text-sm md:text-base'
                onClick={() => navigate('/schedule/create')}
                id="add-schedule-button"
              >
                Add Schedule
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4" id="loading-indicator">Loading...</div>
        ) : (
          <>
            <Table
              id="schedule-table"
              heads={tableHeads}
              data={schedules}
              currentPage={currentPage}
              pageSize={pageSize}
              showIndex={true}
              canEdit={true}
              callbackEdit={handleEditSchedule}
              canDelete={true}
              callbackDelete={handleDeleteSchedule}
              canView={true}
              callbackView={handleViewSchedule}
              action={true}
            />
            <Pagination
              id="schedule-pagination"
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
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={viewSchedule ? `${t('schedule')}: ${viewSchedule.service_name}` : t('schedule')}
        size="md"
        id="view-schedule-modal"
      >
        <div className="space-y-4" id="view-modal-content">
          {viewLoading ? (
            <div className="text-center py-4" id="view-loading">Loading...</div>
          ) : (
            viewSchedule && (
              <div id="view-schedule-details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="view-grid">
                  <div className="md:col-span-2" id="view-details-section">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('details')}</h4>
                    <div className="mt-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4" id="view-details-card">
                      <div className="mb-2" id="view-service-name">
                        <div className="text-sm text-gray-500">{t('service_name')}</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{viewSchedule.service_name}</div>
                      </div>
                      <div className="mb-2" id="view-scheduled-at">
                        <div className="text-sm text-gray-500">{t('scheduled_at')}</div>
                        <div className="font-medium">{dayjs(viewSchedule.scheduled_at).format('DD-MM-YYYY HH:mm')}</div>
                      </div>
                    </div>
                  </div>

                  <div id="view-summary-section">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('summary')}</h4>
                    <div className="mt-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 text-center" id="view-summary-card">
                      <div className="text-xs text-gray-500">{t('members')}</div>
                      <div className="text-2xl font-semibold">{(viewSchedule.serviceAssignments || []).length}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4" id="view-musicians-section">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('musicians')}</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md" id="view-musicians-list">
                    {(viewSchedule.serviceAssignments || []).length > 0 ? (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-800" id="musicians-ul">
                        {(viewSchedule.serviceAssignments || []).map(a => (
                          <li key={a.id} className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900" id={`musician-item-${a.id}`}>
                            <div className="flex items-center gap-3" id={`musician-info-${a.id}`}>
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-600 dark:text-white">{(a.member?.name || '').charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{a.member?.name || '-'}</div>
                                <div className="text-xs text-gray-500">{a.role?.role_name || '-'}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500"></div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-sm text-gray-500" id="no-musicians">No musician assigned</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-4" id="view-modal-actions">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    id="view-close-button"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </Modal>

      <Modal
        id="form-schedule-modal"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
        size="md"
      >
        <div className="space-y-4" id="form-modal-content">
          <div id="service-name-field">
            <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service Name *
            </label>
            <input
              type="text"
              id="service_name"
              name="service_name"
              value={formData.service_name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div id="scheduled-at-field">
            <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Scheduled At *
            </label>
            <Dropdown
              position="bottom"
              trigger={
                <button className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-500 text-left" id="date-time-picker-button">
                  {formData.scheduled_at ? dayjs(formData.scheduled_at).format('DD-MM-YYYY HH:mm') : 'Pilih Tanggal dan Waktu'}
                </button>
              }
              id="date-time-dropdown"
            >
              <div className="p-4 space-y-4" id="date-time-picker-content">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  id="day-picker"
                />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  id="time-input"
                />
              </div>
            </Dropdown>
          </div>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="form-modal-actions">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              id="form-cancel-button"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              id="form-submit-button"
            >
              {submitting ? (editingSchedule ? 'Updating...' : 'Adding...') : (editingSchedule ? 'Update Schedule' : 'Add Schedule')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        id="delete-schedule-modal"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4" id="delete-modal-content">
          <p className="text-gray-700 dark:text-gray-300" id="delete-confirmation-text">
            Are you sure you want to delete schedule <strong>{deletingSchedule?.service_name}</strong>? This action cannot be undone.
          </p>
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3" id="delete-modal-actions">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              id="delete-cancel-button"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              id="delete-confirm-button"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleList;