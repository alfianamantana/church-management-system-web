import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import Card from '../../components/Card';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Modal from '../../components/Modal';
import { IEvent, IBasicResponse, IJemaat, getMessage } from '../../constant';
import { toast } from 'react-toastify';
import InputText from '../../components/InputText';
import TextArea from '../../components/TextArea';
import api from '../../services/api';
import SkeletonCalendar from '../../components/Skeletons/Calendar';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../components/Dropdowns';
import { DayPicker } from "react-day-picker";
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface event {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  className: string;
  extendedProps?: { type: string; description: string | null };
}

interface eventResponse extends IBasicResponse {
  data: IEvent[];
}

interface birthdayEventResponse extends IBasicResponse {
  data: IJemaat[];
}

const Calendar: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    dispatch(setPageTitle('Calendar'));
  });

  const [events, setEvents] = useState<event[]>([]);
  const [isAddEventModal, setIsAddEventModal] = useState(false);
  const [minStartDate, setMinStartDate] = useState<any>(new Date());
  const [minEndDate, setMinEndDate] = useState<any>(new Date());
  const defaultParams = { id: null, title: '', start: '', end: '', description: '', type: 'event' };
  const [params, setParams] = useState<any>(defaultParams);
  const [dataSetStart, setDataSetStart] = useState<any>(null);
  const [dataSetEnd, setDataSetEnd] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentRange, setCurrentRange] = useState<{ start: any; end: any } | null>(null);

  // Datepicker states
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();
  const [selectedStartYear, setSelectedStartYear] = useState(new Date().getFullYear());
  const [selectedEndYear, setSelectedEndYear] = useState(new Date().getFullYear());
  const [selectedStartMonth, setSelectedStartMonth] = useState(new Date().getMonth());
  const [selectedEndMonth, setSelectedEndMonth] = useState(new Date().getMonth());
  const startYearDropdownRef = useRef<{ close: () => void }>(null);
  const endYearDropdownRef = useRef<{ close: () => void }>(null);
  const startMonthDropdownRef = useRef<{ close: () => void }>(null);
  const endMonthDropdownRef = useRef<{ close: () => void }>(null);

  // Dropdown open states for chevron icons
  const [isStartDateDropdownOpen, setIsStartDateDropdownOpen] = useState(false);
  const [isEndDateDropdownOpen, setIsEndDateDropdownOpen] = useState(false);
  const [isStartMonthDropdownOpen, setIsStartMonthDropdownOpen] = useState(false);
  const [isEndMonthDropdownOpen, setIsEndMonthDropdownOpen] = useState(false);
  const [isStartYearDropdownOpen, setIsStartYearDropdownOpen] = useState(false);
  const [isEndYearDropdownOpen, setIsEndYearDropdownOpen] = useState(false);
  const dateFormat = (dt: any) => {
    dt = new Date(dt);
    const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
    const date = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
    const hours = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours();
    const mins = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();
    dt = dt.getFullYear() + '-' + month + '-' + date + 'T' + hours + ':' + mins;
    return dt;
  };

  const addEvent = (data: any = null) => {
    let params = JSON.parse(JSON.stringify(defaultParams));
    if (data) {
      params = {
        id: data.id,
        title: data.title,
        start: dateFormat(data.start),
        end: dateFormat(data.end),
        description: data.extendedProps?.description || '',
        type: data.extendedProps?.type || 'event',
      };
      // Initialize datepicker states for editing
      if (data.start) {
        const startDate = new Date(data.start);
        setSelectedStartDate(startDate);
        setSelectedStartYear(startDate.getFullYear());
        setSelectedStartMonth(startDate.getMonth());
      }
      if (data.end) {
        const endDate = new Date(data.end);
        setSelectedEndDate(endDate);
        setSelectedEndYear(endDate.getFullYear());
        setSelectedEndMonth(endDate.getMonth());
      }
    } else {
      // Reset datepicker states for new event
      setSelectedStartDate(undefined);
      setSelectedEndDate(undefined);
      setSelectedStartYear(new Date().getFullYear());
      setSelectedEndYear(new Date().getFullYear());
      setSelectedStartMonth(new Date().getMonth());
      setSelectedEndMonth(new Date().getMonth());
    }
    setParams(params);
    setIsAddEventModal(true);
  };

  const editDate = (data: any) => {
    let obj = {
      event: {
        start: data.start,
        end: data.end,
      },
    };
    addEvent(obj);
  };

  useEffect(() => {
    if (dataSetStart && dataSetEnd) {
      fetchEvents();
    }
  }, [dataSetStart, dataSetEnd]);

  // Sync selected dates with params
  useEffect(() => {
    if (selectedStartDate) {
      setParams((prev: any) => ({
        ...prev,
        start: dayjs(selectedStartDate).format('YYYY-MM-DDTHH:mm'),
      }));
      setSelectedStartYear(selectedStartDate.getFullYear());
      setSelectedStartMonth(selectedStartDate.getMonth());
    }
  }, [selectedStartDate]);

  useEffect(() => {
    if (selectedEndDate) {
      setParams((prev: any) => ({
        ...prev,
        end: dayjs(selectedEndDate).format('YYYY-MM-DDTHH:mm'),
      }));
      setSelectedEndYear(selectedEndDate.getFullYear());
      setSelectedEndMonth(selectedEndDate.getMonth());
    }
  }, [selectedEndDate]);

  // Update end date when start date changes
  useEffect(() => {
    if (selectedStartDate && (!selectedEndDate || selectedEndDate < selectedStartDate)) {
      setSelectedEndDate(selectedStartDate);
    }
  }, [selectedStartDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api({ url: '/events', method: 'GET', params: { start: dataSetStart, end: dataSetEnd } });
      const response: eventResponse = data;

      if (response.code === 200) {
        const formattedEvents = response.data.map((event) => ({
          id: event.id.toString(),
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          className: 'bg-primary',
          extendedProps: { type: 'event', description: event.description },
        }));
        setEvents(formattedEvents);
        await fetchJemaatThatHaveBirthday();
      } else {
        toast.error(getMessage(response.message));
        setLoading(false);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
      setLoading(false);
    }
  }

  const fetchJemaatThatHaveBirthday = async () => {
    try {
      let startMonth = dayjs(dataSetStart).startOf('month').toISOString();

      const { data } = await api({ url: '/jemaat/birthday', method: 'GET', params: { date: startMonth, limit: 1000 } });

      const response: birthdayEventResponse = data;
      if (response.code === 200) {
        const birthdayEvents = response.data.map((jemaat) => ({
          id: jemaat.id.toString(),
          title: `Birthday: ${jemaat.name}`,
          start: new Date(new Date(jemaat.birth_date).setFullYear(new Date().getFullYear())).toISOString(),
          end: new Date(new Date(jemaat.birth_date).setFullYear(new Date().getFullYear())).toISOString(),
          description: null,
          createdAt: '',
          updatedAt: '',
          className: 'bg-success',
          extendedProps: { type: 'birthday', description: null },
        }));
        setEvents((prevEvents) => [...prevEvents, ...birthdayEvents]);
      } else {
        toast.error(getMessage(response.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setLoading(false);
    }
  }

  const createEvent = async () => {
    if (!params.title || params.title.trim() === '' || !params.start || !params.end) {
      return toast.error('Please fill all required fields.');
    }

    const now = new Date();
    const startDate = new Date(params.start);
    const endDate = new Date(params.end);

    if (startDate < now) {
      return toast.error('Start date cannot be in the past.');
    }

    if (endDate < startDate) {
      return toast.error('End date must be after start date.');
    }

    try {
      const method = params.id ? 'PUT' : 'POST';
      const url = params.id ? `/events?id=${params.id}` : '/events';
      const { data } = await api({
        url,
        method,
        data: {
          title: params.title,
          start: params.start,
          end: params.end,
          description: params.description,
        }
      })
      const response: IBasicResponse = data;

      if (response.code === (params.id ? 200 : 201)) {
        toast.success(`Event ${params.id ? 'updated' : 'created'} successfully!`);
        fetchEvents();
        setIsAddEventModal(false);
      } else {
        toast.error(getMessage(response.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    }
  };
  const changeValue = (e: any) => {
    const { value, id } = e.target;
    setParams({ ...params, [id]: value });
  };

  return (
    <Card id="calendar-card">
      <div>
        <div className="mb-4 flex items-center sm:flex-row flex-col sm:justify-between justify-center">
          <div className="sm:mb-0 mb-4">
            <div className="text-lg font-semibold ltr:sm:text-left rtl:sm:text-right text-center">Calendar</div>
            <div className="flex items-center mt-2 flex-wrap sm:justify-start justify-center">
              <div className="flex items-center ltr:mr-4 rtl:ml-4">
                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-primary"></div>
                <div>Birthday</div>
              </div>

              <div className="flex items-center ltr:mr-4 rtl:ml-4">
                <div className="h-2.5 w-2.5 rounded-sm ltr:mr-2 rtl:ml-2 bg-success"></div>
                <div>Event</div>
              </div>

            </div>
          </div>
          <button id="create-event-btn" type="button" className="btn btn-primary" onClick={() => addEvent()}>
            Create Event
          </button>
        </div>
        <div className="calendar-wrapper">
          {loading ? (
            <SkeletonCalendar />
          ) : (
            <FullCalendar
              datesSet={(arg) => {
                const newRange = { start: arg.start, end: arg.end };
                if (!currentRange || currentRange?.start?.getTime() !== newRange?.start?.getTime() || currentRange?.end?.getTime() !== newRange?.end?.getTime()) {
                  setDataSetStart(arg.start);
                  setDataSetEnd(arg.end);
                  setCurrentRange(newRange);
                }
              }}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                right: 'prev,next',
              }}
              editable={true}
              dayMaxEvents={true}
              selectable={true}
              droppable={true}
              eventClick={(event: any) => {
                if (event.event.extendedProps.type === 'event') {
                  addEvent(event.event);
                }
              }}
              select={(event: any) => editDate(event)}
              events={events}
              lazyFetching={true}
            />
          )}
        </div>

        {/* add event modal */}
        <Modal id="add-event-modal" isOpen={isAddEventModal} onClose={() => setIsAddEventModal(false)} title={params.id ? 'Edit Event' : 'Add Event'} size="lg">
          <div className="space-y-5">
            <InputText
              label="Event Title :"
              id="title"
              type="text"
              name="title"
              placeholder="Enter Event Title"
              value={params.title || ''}
              onChange={(e) => changeValue(e)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropdown
                position="bottom"
                label="From :"
                trigger={
                  <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                    {params.start ? dayjs(params.start).format('DD-MM-YYYY HH:mm') : 'Select Start Date & Time'}
                    {isStartDateDropdownOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                }
                onOpenChange={setIsStartDateDropdownOpen}
              >
                <div className="p-4 w-full">
                  <div className='flex flex-row gap-2 mb-4'>
                    <Dropdown
                      fullWidth={true}
                      ref={startMonthDropdownRef}
                      trigger={
                        <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                          {new Date(0, selectedStartMonth).toLocaleString('default', { month: 'long' })}
                          {isStartMonthDropdownOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      }
                      onOpenChange={setIsStartMonthDropdownOpen}
                    >
                      <div className="max-h-40 overflow-y-auto w-full">
                        {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                          <div
                            key={month}
                            className="px-4 py-2 w-full hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedStartMonth(month);
                              startMonthDropdownRef.current?.close();
                            }}
                          >
                            {new Date(0, month).toLocaleString('default', { month: 'long' })}
                          </div>
                        ))}
                      </div>
                    </Dropdown>
                    <Dropdown
                      fullWidth={true}
                      ref={startYearDropdownRef}
                      trigger={
                        <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                          {selectedStartYear}
                          {isStartYearDropdownOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      }
                      onOpenChange={setIsStartYearDropdownOpen}
                    >
                      <div className="max-h-40 overflow-y-auto w-full">
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <div
                            key={year}
                            className="px-4 py-2 w-full hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedStartYear(year);
                              startYearDropdownRef.current?.close();
                            }}
                          >
                            {year}
                          </div>
                        ))}
                      </div>
                    </Dropdown>
                  </div>
                  <DayPicker
                    animate
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
                    month={new Date(selectedStartYear, selectedStartMonth)}
                  />
                  <div className="mt-4">
                    <InputText
                      label="Time :"
                      id="start-time"
                      type="time"
                      name="start-time"
                      value={params.start ? dayjs(params.start).format('HH:mm') : ''}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (selectedStartDate && time) {
                          const [hours, minutes] = time.split(':');
                          const newDate = new Date(selectedStartDate);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setSelectedStartDate(newDate);
                        }
                      }}
                      required
                    />
                  </div>
                </div>
              </Dropdown>

              <Dropdown
                position="bottom"
                label="To :"
                trigger={
                  <button className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                    {params.end ? dayjs(params.end).format('DD-MM-YYYY HH:mm') : 'Select End Date & Time'}
                    {isEndDateDropdownOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                }
                onOpenChange={setIsEndDateDropdownOpen}
              >
                <div className="p-4 w-full">
                  <div className='flex flex-row gap-2 mb-4'>
                    <Dropdown
                      fullWidth={true}
                      ref={endMonthDropdownRef}
                      trigger={
                        <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                          {new Date(0, selectedEndMonth).toLocaleString('default', { month: 'long' })}
                          {isEndMonthDropdownOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      }
                      onOpenChange={setIsEndMonthDropdownOpen}
                    >
                      <div className="max-h-40 overflow-y-auto w-full">
                        {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                          <div
                            key={month}
                            className="px-4 py-2 w-full hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedEndMonth(month);
                              endMonthDropdownRef.current?.close();
                            }}
                          >
                            {new Date(0, month).toLocaleString('default', { month: 'long' })}
                          </div>
                        ))}
                      </div>
                    </Dropdown>
                    <Dropdown
                      fullWidth={true}
                      ref={endYearDropdownRef}
                      trigger={
                        <button className=" w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between">
                          {selectedEndYear}
                          {isEndYearDropdownOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      }
                      onOpenChange={setIsEndYearDropdownOpen}
                    >
                      <div className="max-h-40 overflow-y-auto w-full">
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <div
                            key={year}
                            className="px-4 py-2 w-full hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedEndYear(year);
                              endYearDropdownRef.current?.close();
                            }}
                          >
                            {year}
                          </div>
                        ))}
                      </div>
                    </Dropdown>
                  </div>
                  <DayPicker
                    animate
                    mode="single"
                    selected={selectedEndDate}
                    onSelect={setSelectedEndDate}
                    month={new Date(selectedEndYear, selectedEndMonth)}
                  />
                  <div className="mt-4">
                    <InputText
                      label="Time :"
                      id="end-time"
                      type="time"
                      name="end-time"
                      value={params.end ? dayjs(params.end).format('HH:mm') : ''}
                      onChange={(e) => {
                        const time = e.target.value;
                        if (selectedEndDate && time) {
                          const [hours, minutes] = time.split(':');
                          const newDate = new Date(selectedEndDate);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setSelectedEndDate(newDate);
                        }
                      }}
                      required
                    />
                  </div>
                </div>
              </Dropdown>
            </div>
            <TextArea
              label="Event Description :"
              id="description"
              name="description"
              className="min-h-[130px]"
              placeholder="Enter Event Description"
              value={params.description || ''}
              onChange={(e) => changeValue(e)}
            />

            <div className="flex justify-end items-center !mt-8">
              <button id="cancel-event-btn" type="button" className="btn btn-outline-danger" onClick={() => setIsAddEventModal(false)}>
                Cancel
              </button>
              <button id="submit-event-btn" type="button" onClick={() => createEvent()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                {params.id ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </Modal>
      </div>

    </Card>
  );
};

export default Calendar;
