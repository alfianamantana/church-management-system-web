import React from 'react';
import FullCalendar from '@fullcalendar/react';
import Card from '../components/Card';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import Modal from '../components/Modal';
import { IEvent, IBasicResponse, IJemaat } from '../constant';
import { toast } from 'react-toastify';
import InputText from '../components/InputText';
import TextArea from '../components/TextArea';
import api from '../services/api';
import SkeletonCalendar from '../components/Skeletons/Calendar';

interface event extends IEvent {
  className: string;
}

interface eventResponse extends IBasicResponse {
  data: IEvent[];
}

interface birthdayEventResponse extends IBasicResponse {
  data: IJemaat[];
}

const Calendar: React.FC = () => {
  const dispatch = useDispatch();
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api({ url: '/events', method: 'GET', params: { start: dataSetStart, end: dataSetEnd } });
      const response: eventResponse = data;

      if (response.code === 200) {
        const formattedEvents = response.data.map((event) => ({
          ...event,
          className: 'bg-primary',
          extendedProps: { type: 'event', description: event.description },
        }));
        setEvents(formattedEvents);
        await fetchJemaatThatHaveBirthday();
      } else {
        toast.error(response.message[0]);
        setLoading(false);
      }
    } catch (error) {
      toast.error('Failed to fetch events.');
      setLoading(false);
    }
  }

  const fetchJemaatThatHaveBirthday = async () => {
    try {
      const { data } = await api({ url: '/jemaat', method: 'GET', params: { birth_date_start: dataSetStart, birth_date_end: dataSetEnd, limit: 1000 } });

      const response: birthdayEventResponse = data;
      if (response.code === 200) {
        const birthdayEvents = response.data.map((jemaat) => ({
          id: jemaat.id,
          title: `Birthday: ${jemaat.name}`,
          start: new Date(new Date(jemaat.birth_date).setFullYear(new Date().getFullYear())).toISOString(),
          end: new Date(new Date(jemaat.birth_date).setFullYear(new Date().getFullYear())).toISOString(),
          description: null,
          createdAt: '',
          updatedAt: '',
          className: 'bg-success',
          extendedProps: { type: 'birthday' },
        }));
        setEvents((prevEvents) => [...prevEvents, ...birthdayEvents]);
      } else {
        toast.error(response.message[0]);
      }
    } catch (error) {
      toast.error('Something went wrong while fetching birthday events.');
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
        toast.error(response.message[0]);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };
  const startDateChange = (event: any) => {
    const dateStr = event.target.value;
    if (dateStr) {
      setMinEndDate(dateFormat(dateStr));
      setParams({ ...params, start: dateStr, end: '' });
    }
  };
  const changeValue = (e: any) => {
    const { value, id } = e.target;
    setParams({ ...params, [id]: value });
  };

  return (
    <Card>
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
          <button type="button" className="btn btn-primary" onClick={() => addEvent()}>
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
                if (!currentRange || currentRange.start.getTime() !== newRange.start.getTime() || currentRange.end.getTime() !== newRange.end.getTime()) {
                  setDataSetStart(arg.start);
                  setDataSetEnd(arg.end);
                  setCurrentRange(newRange);
                }
              }}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth',
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
            />
          )}
        </div>

        {/* add event modal */}
        <Modal isOpen={isAddEventModal} onClose={() => setIsAddEventModal(false)} title={params.id ? 'Edit Event' : 'Add Event'} size="lg">
          <form className="space-y-5">
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

            <InputText
              label="From :"
              id="start"
              type="datetime-local"
              name="start"
              placeholder="Event Start Date"
              value={params.start || ''}
              min={minStartDate}
              onChange={(event: any) => startDateChange(event)}
              required
            />
            <InputText
              label="To :"
              id="end"
              type="datetime-local"
              name="end"
              placeholder="Event End Date"
              value={params.end || ''}
              min={minEndDate}
              onChange={(e) => changeValue(e)}
              required
            />
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
              <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddEventModal(false)}>
                Cancel
              </button>
              <button type="button" onClick={() => createEvent()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                {params.id ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>
      </div>

    </Card>
  );
};

export default Calendar;
