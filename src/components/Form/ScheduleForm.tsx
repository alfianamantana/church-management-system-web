import React, { useState, useEffect, useRef } from 'react';
import Card from '../Card';
import InputText from '../InputText';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import Dropdown from '../Dropdowns';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { DayPicker } from "react-day-picker";
import dayjs from 'dayjs';
import api from '@/services/api';
import { IMusician, IBasicResponse, IRole, getMessage } from '@/constant';

interface IResponseFetchMusicians extends IBasicResponse {
  data: IMusician[];
}

interface IResponseFetchRoles extends IBasicResponse {
  data: IRole[];
}

interface IScheduleFormData {
  service_name: string;
  scheduled_at: string;
  instrument_assignments: Record<string, number[]>;
  instruments: string[];
  musician_ids?: number[];
}

interface ScheduleFormProps {
  mode: 'create' | 'edit';
  initialSchedules?: IScheduleFormData[];
  onSubmit: (schedules: IScheduleFormData[], roles: IRole[]) => Promise<void>;
}

const DraggableMusician: React.FC<{ musician: IMusician }> = ({ musician }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `musician-${musician.id}`,
    data: { musician },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md cursor-grab active:cursor-grabbing"
    >
      <div>
        <div className="font-medium text-gray-900 dark:text-gray-100">{musician.name}</div>
        <div className="text-sm text-gray-500">{musician.phone}</div>
      </div>
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
        {musician.name.charAt(0)}
      </div>
    </div>
  );
};

const DraggableRole: React.FC<{ role: IRole }> = ({ role }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `role-${role.id}`,
    data: { role },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md cursor-grab active:cursor-grabbing"
    >
      <div>
        <div className="font-medium text-gray-900 dark:text-gray-100">{role.role_name}</div>
      </div>
      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
        {role.role_name.charAt(0)}
      </div>
    </div>
  );
};

// AssignedMusician: draggable representation of a musician already assigned to an instrument
const AssignedMusician: React.FC<{ musician: IMusician; scheduleIndex: number; instrument: string; onRemove: () => void; }> = ({ musician, scheduleIndex, instrument, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `assigned-${scheduleIndex}-${musician.id}`,
    data: { musician, scheduleIndex, fromInstrument: instrument },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center justify-between p-2 bg-blue-100 dark:bg-blue-800 rounded-md cursor-grab active:cursor-grabbing"
    >
      <span className="text-sm">{musician.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 transition-all duration-200"
      >
        ×
      </button>
    </div>
  );
};

const DroppableInstrument: React.FC<{
  instrument: string;
  scheduleIndex: number;
  assignedMusicians: number[];
  onAddMusician: (instrument: string, id: number) => void;
  onRemoveMusician: (instrument: string, id: number) => void;
  onRemoveInstrument: (instrument: string) => void;
  instrumentsLength: number;
  instrumentIndex?: number;
  musicians: IMusician[];
  t: any;
}> = ({ instrumentIndex, instrument, scheduleIndex, assignedMusicians, onAddMusician, onRemoveMusician, onRemoveInstrument, instrumentsLength, musicians, t }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `schedule-${scheduleIndex}-${instrument.toLowerCase().replace(/\s+/g, '-')}`,
  });

  const filteredMusicians = musicians.filter(m => assignedMusicians.includes(m.id));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        {(<div
          ref={setNodeRef}
          className={`p-3 border-2 border-dashed rounded-md text-center flex-1 ${isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'
            }`}
        >
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{instrument}</div>
          {filteredMusicians.length === 0 ? (
            <>
              <div className="text-xs text-gray-500 mt-1">{t('drop_here')}</div>
              <Dropdown
                position={instrumentIndex === 0 || instrumentIndex === 1 ? "bottom-right" : "top-right"}
                trigger={
                  <button className="text-2xl text-gray-400 hover:text-gray-600 mt-2 transition-all duration-200">
                    +
                  </button>
                }
              >
                <div id='list-option-musician' className="p-2 max-h-40 overflow-y-auto w-48">
                  {musicians.map(musician => (
                    <div
                      key={musician.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white transition-all duration-200"
                      onClick={() => onAddMusician(instrument, musician.id)}
                    >
                      {musician.name}
                    </div>
                  ))}
                </div>
              </Dropdown>
            </>
          ) : (
            <div className="mt-2 space-y-1">
              {filteredMusicians.map(musician => (
                <AssignedMusician
                  key={musician.id}
                  musician={musician}
                  scheduleIndex={scheduleIndex}
                  instrument={instrument}
                  onRemove={() => onRemoveMusician(instrument, musician.id)}
                />
              ))}
            </div>
          )}
        </div>)}
        {instrumentsLength > 1 && assignedMusicians.length === 0 && (
          <button
            type="button"
            onClick={() => onRemoveInstrument(instrument)}
            className="ml-2 text-red-500 hover:text-red-700 text-sm"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

const DroppableMusiciansArea: React.FC<{
  scheduleIndex: number;
  instrument_assignments: Record<string, number[]>;
  instruments: string[];
  onAddMusician: (instrument: string, musicianId: number) => void;
  onRemoveMusician: (instrument: string, musicianId: number) => void;
  onAddInstrument: (newInstrument: string) => void;
  onRemoveInstrument: (instrument: string) => void;
  musicians: IMusician[];
  t: any;
}> = ({ scheduleIndex, instrument_assignments, instruments, onAddMusician, onRemoveMusician, onAddInstrument, onRemoveInstrument, musicians, t }) => {

  return (
    (<div className="mt-4 space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('assign_musicians_by_instrument')}
      </label>
      <div className="grid grid-cols-2 gap-4">
        {instruments.map((instrument, instrumentIndex) => (
          <DroppableInstrument
            instrumentIndex={instrumentIndex}
            key={instrument}
            instrument={instrument}
            scheduleIndex={scheduleIndex}
            assignedMusicians={instrument_assignments[instrument] || []}
            onAddMusician={onAddMusician}
            onRemoveMusician={onRemoveMusician}
            onRemoveInstrument={onRemoveInstrument}
            instrumentsLength={instruments.length}
            musicians={musicians}
            t={t}
          />
        ))}
      </div>
    </div>)
  );
};

const DroppableScheduleArea: React.FC<{
  scheduleIndex: number;
  instruments: string[];
  onRemoveInstrument: (instrument: string) => void;
  t: any;
}> = ({ scheduleIndex, instruments, onRemoveInstrument, t }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `roles-${scheduleIndex}`,
  });

  return (
    <div id={`droppable-roles-${scheduleIndex}`} className="mt-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('add_instruments_roles_drag_here')}
      </label>
      <div
        id={`droppable-roles-${scheduleIndex}`}
        ref={setNodeRef}
        className={`p-4 border-2 border-dashed rounded-md text-center ${isOver ? 'border-green-500 bg-green-50 dark:bg-green-900' : 'border-gray-300 dark:border-gray-600'}`}
      >
        <div className="text-sm text-gray-500">{t('drop_roles_instruments_here')}</div>
        {instruments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {instruments.map(instrument => (
              <span key={instrument} className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-sm rounded">
                {instrument}
                <button
                  type="button"
                  onClick={() => onRemoveInstrument(instrument)}
                  className="text-red-500 hover:text-red-700 text-xs transition-all duration-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ScheduleForm: React.FC<ScheduleFormProps> = ({ mode, initialSchedules = [], onSubmit }) => {
  const { t } = useTranslation();

  const [schedules, setSchedules] = useState<IScheduleFormData[]>(initialSchedules.length > 0 ? initialSchedules : [
    { service_name: '', scheduled_at: '', instrument_assignments: {}, instruments: [] }
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [musicians, setMusicians] = useState<IMusician[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);

  const [scheduleDates, setScheduleDates] = useState<{ [key: number]: Date | undefined }>({});
  const [scheduleYears, setScheduleYears] = useState<{ [key: number]: number }>({});
  const [scheduleMonths, setScheduleMonths] = useState<{ [key: number]: number }>({});
  const monthRefs = useRef<{ [key: number]: { open?: () => void; close: () => void } | null }>({});
  const yearRefs = useRef<{ [key: number]: { open?: () => void; close: () => void } | null }>({});
  const scheduledRefs = useRef<{ [key: number]: { open?: () => void; close?: () => void } | null }>({});

  useEffect(() => {
    fetchMusicians();
    fetchRoles();
    if (initialSchedules.length > 0) {
      // Initialize dates for edit mode
      initialSchedules.forEach((schedule, index) => {
        if (schedule.scheduled_at) {
          const date = dayjs(schedule.scheduled_at).toDate();
          setScheduleDates(prev => ({ ...prev, [index]: date }));
          setScheduleYears(prev => ({ ...prev, [index]: date.getFullYear() }));
          setScheduleMonths(prev => ({ ...prev, [index]: date.getMonth() }));
        }
      });
    }
  }, []);

  const addSchedule = () => {
    const newIndex = schedules.length;
    setSchedules([...schedules, { service_name: '', scheduled_at: '', instrument_assignments: {}, instruments: [], }]);
    setScheduleYears(prev => ({ ...prev, [newIndex]: new Date().getFullYear() }));
    setScheduleMonths(prev => ({ ...prev, [newIndex]: new Date().getMonth() }));
  };

  const removeSchedule = (index: number) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
  };

  const updateSchedule = (index: number, field: keyof IScheduleFormData, value: any) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setSchedules(newSchedules);
  };

  const addMusicianToInstrument = (scheduleIndex: number, instrument: string, musicianId: number) => {
    const newSchedules = [...schedules];
    if (!newSchedules[scheduleIndex].instrument_assignments[instrument]) {
      newSchedules[scheduleIndex].instrument_assignments[instrument] = [];
    }

    // If musician is already assigned to another instrument in same schedule, remove from there (move to this instrument)
    const assignedEntry = Object.entries(newSchedules[scheduleIndex].instrument_assignments).find(([inst, ids]) => {
      return inst !== instrument && ids.includes(musicianId);
    });

    if (assignedEntry) {
      const [prevInstrument] = assignedEntry;
      newSchedules[scheduleIndex].instrument_assignments[prevInstrument] = newSchedules[scheduleIndex].instrument_assignments[prevInstrument].filter(id => id !== musicianId);
    }

    if (!newSchedules[scheduleIndex].instrument_assignments[instrument].includes(musicianId)) {
      newSchedules[scheduleIndex].instrument_assignments[instrument].push(musicianId);
      setSchedules(newSchedules);
    }
  };

  const removeMusicianFromInstrument = (scheduleIndex: number, instrument: string, musicianId: number) => {
    const newSchedules = [...schedules];
    if (newSchedules[scheduleIndex].instrument_assignments[instrument]) {
      newSchedules[scheduleIndex].instrument_assignments[instrument] = newSchedules[scheduleIndex].instrument_assignments[instrument].filter(id => id !== musicianId);
      setSchedules(newSchedules);
    }
  };

  const addInstrument = (scheduleIndex: number, newInstrument: string) => {
    if (!newInstrument.trim()) return;
    const newSchedules = [...schedules];
    if (!newSchedules[scheduleIndex].instruments.includes(newInstrument.trim())) {
      newSchedules[scheduleIndex].instruments = [...newSchedules[scheduleIndex].instruments, newInstrument.trim()];
      newSchedules[scheduleIndex].instrument_assignments[newInstrument.trim()] = [];
      setSchedules(newSchedules);
    }
  };

  const removeInstrument = (scheduleIndex: number, instrument: string) => {
    const newSchedules = [...schedules];
    newSchedules[scheduleIndex].instruments = newSchedules[scheduleIndex].instruments.filter(i => i !== instrument);
    delete newSchedules[scheduleIndex].instrument_assignments[instrument];
    setSchedules(newSchedules);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const musician = active.data.current?.musician as IMusician;
    const role = active.data.current?.role as IRole;
    const overId = over.id.toString();
    if (overId.startsWith('schedule-')) {
      const parts = overId.split('-');
      const scheduleIndex = parseInt(parts[1]);
      const instrumentSlug = parts.slice(2).join('-').toLowerCase();

      if (musician && !isNaN(scheduleIndex) && instrumentSlug && schedules[scheduleIndex].instruments.some(i => i.toLowerCase().replace(/\s+/g, '-') === instrumentSlug)) {
        const actualInstrument = schedules[scheduleIndex].instruments.find(i => i.toLowerCase().replace(/\s+/g, '-') === instrumentSlug);
        if (actualInstrument) {
          addMusicianToInstrument(scheduleIndex, actualInstrument, musician.id);
        }
      }
    } else if (overId === 'available-musicians') {
      // if assigned musician dragged back to available list, remove from its instrument
      const musicianObj = active.data.current?.musician as IMusician | undefined;
      const fromSchedule = active.data.current?.scheduleIndex as number | undefined;
      const fromInstrument = active.data.current?.fromInstrument as string | undefined;
      if (musicianObj && fromSchedule !== undefined && fromInstrument) {
        removeMusicianFromInstrument(fromSchedule, fromInstrument, musicianObj.id);
      }
    } else if (overId.startsWith('roles-')) {
      const scheduleIndex = parseInt(overId.split('-')[1]);
      if (role && !isNaN(scheduleIndex) && !schedules[scheduleIndex].instruments.includes(role.role_name)) {
        const newSchedules = [...schedules];
        newSchedules[scheduleIndex].instruments = [...newSchedules[scheduleIndex].instruments, role.role_name];
        newSchedules[scheduleIndex].instrument_assignments[role.role_name] = [];
        setSchedules(newSchedules);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    for (const schedule of schedules) {
      if (!schedule.service_name.trim() || !schedule.scheduled_at) {
        toast.error(t('fill_all_fields') as string);
        return;
      }
      // Check if all instruments have at least one musician
      for (const instrument of schedule.instruments) {
        const assigned = schedule.instrument_assignments[instrument];
        if (!assigned || assigned.length === 0) {
          toast.error(t('remove_unused_instruments') as string);
          return;
        }
      }

      // Ensure a musician is not assigned to more than one instrument in the same schedule
      const musicianCount: Record<number, number> = {};
      for (const ids of Object.values(schedule.instrument_assignments)) {
        for (const id of ids) {
          musicianCount[id] = (musicianCount[id] || 0) + 1;
          if (musicianCount[id] > 1) {
            toast.error(t('musician_cannot_play_multiple_instruments') as string);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(schedules, roles);
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setSubmitting(false);
    }
  };

  async function fetchMusicians() {
    try {
      const { data } = await api({ url: '/music/members', method: 'GET' });

      const response: IResponseFetchMusicians = data;
      if (response.code === 200) {
        setMusicians(response.data);
      } else {
        toast.error(getMessage(response.message) as string);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    }
  }

  async function fetchRoles() {
    try {
      const { data } = await api({ url: '/music/roles', method: 'GET' });

      const response: IResponseFetchRoles = data;
      if (response.code === 200) {
        setRoles(response.data);
      } else {
        toast.error(getMessage(response.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    }
  }

  const startTour = () => {
    // Only for create mode
    if (mode !== 'create') return;

    // Open scheduled dropdown (simulate click on trigger) so nested triggers are visible
    const scheduledTrigger = document.querySelector(`#scheduled-at-trigger-0`) as HTMLElement | null;
    scheduledTrigger?.click();

    setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        // override next/prev to ensure dropdown is open when moving to datepicker step
        onNextClick: (element: Element | null | undefined, step: any, options: any) => {
          try {
            const currentIndex = options.state.currentStep;
            const nextIndex = currentIndex + 1;
            const nextStep = options.config.steps && options.config.steps[nextIndex];

            // if next step targets the datepicker, ensure scheduled dropdown is open first
            const nextTargetsDatepicker = nextStep && (nextStep.element === '.rdp-root' || nextStep.element === '#rdp-root');
            const elementIsDatepicker = !!(element && (element as Element).matches && (element as Element).matches('.rdp-root'));

            if (nextTargetsDatepicker || elementIsDatepicker) {
              scheduledTrigger?.click();
              setTimeout(() => options.driver.moveNext(), 180);
            } else {
              options.driver.moveNext();
            }
          } catch (e) {
            options.driver.moveNext();
          }
        },
        onPrevClick: (element: Element | null | undefined, step: any, options: any) => {
          try {
            const currentIndex = options.state.currentStep;
            const prevIndex = currentIndex - 1;
            const prevStep = options.config.steps && options.config.steps[prevIndex];

            const prevTargetsDatepicker = prevStep && (prevStep.element === '.rdp-root' || prevStep.element === '#rdp-root');
            const elementIsDatepicker = !!(element && (element as Element).matches && (element as Element).matches('.rdp-root'));

            if (prevTargetsDatepicker || elementIsDatepicker) {
              scheduledTrigger?.click();
              setTimeout(() => options.driver.movePrevious(), 180);
            } else {
              options.driver.movePrevious();
            }
          } catch (e) {
            options.driver.movePrevious();
          }
        },
        steps: [
          { element: `#scheduled-at-trigger-0`, popover: { title: t('tour_scheduled_at_title'), description: t('tour_scheduled_at_desc') } },
          { element: `#month-dropdown-trigger-0`, popover: { title: t('tour_month_title'), description: t('tour_month_desc') } },
          { element: `#year-dropdown-trigger-0`, popover: { title: t('tour_year_title'), description: t('tour_year_desc') } },
          { element: `.rdp-root`, popover: { title: t('tour_datepicker_title'), description: t('tour_datepicker_desc') } },
          { element: `#droppable-roles-0`, popover: { title: t('tour_roles_title'), description: t('tour_roles_desc') } },
          { element: `#available-musicians`, popover: { title: t('tour_musicians_title'), description: t('tour_musicians_desc') } },
          { element: `#add-schedule`, popover: { title: t('tour_add_schedule_title'), description: t('tour_add_schedule_desc') } }
        ]
      });

      driverObj.drive();

    }, 250);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left side - Schedule forms */}
        <div className="lg:col-span-4">
          <Card title={mode === 'create' ? t('create_multiple_schedules') : t('edit_schedule')} id="schedule-form-card">
            {/* pembungkus luar schedule form */}
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {schedules.map((schedule, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{t('schedule')} {index + 1}</h3>
                    {schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="text-red-500 hover:text-red-700 transition-all duration-200"
                      >
                        x
                      </button>
                    )}
                  </div>

                  <div id={`schedule-${index}`} className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputText
                      label={t('service_name')}
                      value={schedule.service_name}
                      onChange={(e) => updateSchedule(index, 'service_name', e.target.value)}
                      required={true}
                    />
                    <Dropdown
                      id={`scheduled-at-dropdown-${index}`}
                      position="bottom"
                      label={t('scheduled_at')}
                      required={true}
                      ref={(el) => (scheduledRefs.current[index] = el)}

                      trigger={
                        <button id={`scheduled-at-trigger-${index}`} className="transition-all duration-200 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                          {schedule.scheduled_at ? dayjs(schedule.scheduled_at).format('DD-MM-YYYY') : t('select_scheduled_date')}
                        </button>
                      }
                    >
                      <div className="p-4 w-full">
                        <div className='flex flex-row gap-2'>
                          <Dropdown
                            id={`month-dropdown-${index}`}
                            fullWidth={true}
                            ref={(el) => (monthRefs.current[index] = el)}
                            trigger={
                              <button id={`month-dropdown-trigger-${index}`} className="transition-all duration-200  w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                                {new Date(0, scheduleMonths[index] || new Date().getMonth()).toLocaleString('default', { month: 'long' })}
                              </button>
                            }
                          >
                            <div className="max-h-40 overflow-y-auto w-full" onMouseDown={(e) => e.stopPropagation()}>
                              {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                                <div
                                  key={month}
                                  className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setScheduleMonths(prev => ({ ...prev, [index]: month }));
                                    monthRefs.current[index]?.close();
                                  }}
                                >
                                  {new Date(0, month).toLocaleString('default', { month: 'long' })}
                                </div>
                              ))}
                            </div>
                          </Dropdown>
                          <Dropdown
                            id={`year-dropdown-${index}`}
                            fullWidth={true}
                            ref={(el) => (yearRefs.current[index] = el)}
                            trigger={
                              <button id={`year-dropdown-trigger-${index}`} className="transition-all duration-200 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left">
                                {scheduleYears[index] || new Date().getFullYear()}
                              </button>
                            }
                          >
                            <div className="max-h-40 overflow-y-auto w-full" onMouseDown={(e) => e.stopPropagation()}>
                              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                <div
                                  key={year}
                                  className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setScheduleYears(prev => ({ ...prev, [index]: year }));
                                    yearRefs.current[index]?.close();
                                  }}
                                >
                                  {year}
                                </div>
                              ))}
                            </div>
                          </Dropdown>
                        </div>
                        <DayPicker
                          disabled={{ before: new Date() }}
                          animate
                          mode="single"
                          selected={scheduleDates[index]}
                          onSelect={(date) => {
                            setScheduleDates(prev => ({ ...prev, [index]: date }));
                            if (date) {
                              updateSchedule(index, 'scheduled_at', dayjs(date).format('YYYY-MM-DD'));
                            }
                          }}
                          month={new Date(scheduleYears[index] || new Date().getFullYear(), scheduleMonths[index] || new Date().getMonth())}
                        />
                      </div>
                    </Dropdown>
                  </div>

                  <DroppableScheduleArea
                    scheduleIndex={index}
                    instruments={schedule.instruments}
                    onRemoveInstrument={(inst) => removeInstrument(index, inst)}
                    t={t}
                  />

                  {schedule.instruments.length > 0 && (
                    <DroppableMusiciansArea
                      scheduleIndex={index}
                      instrument_assignments={schedule.instrument_assignments}
                      instruments={schedule.instruments}
                      onAddMusician={(inst, id) => addMusicianToInstrument(index, inst, id)}
                      onRemoveMusician={(inst, id) => removeMusicianFromInstrument(index, inst, id)}
                      onAddInstrument={(newInst) => addInstrument(index, newInst)}
                      onRemoveInstrument={(inst) => removeInstrument(index, inst)}
                      musicians={musicians}
                      t={t}
                    />
                  )}
                </div>
              ))}
              <p className='text-xs'>{t('hint_create_schedule')}</p>
              <div className="flex justify-between items-center gap-4">
                <div className="flex gap-3">
                  {mode === 'create' && (
                    <button
                      type="button"
                      id="start-tour"
                      onClick={() => startTour()}
                      className="transition-all duration-200 px-3 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
                    >
                      {t('start_tour')}
                    </button>
                  )}

                  {mode === 'create' && (
                    <button
                      type="button"
                      onClick={addSchedule}
                      id="add-schedule"
                      className="transition-all duration-200 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      {t('add_schedule')}
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  type="submit"
                  id={mode === 'create' ? "create-schedules" : "update-schedules"}
                  disabled={submitting}
                  className="transition-all duration-200 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? (mode === 'create' ? t('creating') : t('updating')) : (mode === 'create' ? t('create_schedules') : t('update_schedules'))}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right side - Musicians list */}
        <div className="lg:col-span-1 space-y-6">
          <Card title={t('available_instruments_roles')} id="available-roles-card">
            <div className="max-h-[300px] overflow-y-auto space-y-3 truncate">
              {roles.map(role => (
                <DraggableRole key={role.id} role={role} />
              ))}
            </div>
          </Card>

          <Card title={t('available_musicians')} id="available-musicians-card">
            <div id="available-musicians" className="max-h-[600px] overflow-y-auto space-y-3">
              {musicians.map(musician => (
                <DraggableMusician key={musician.id} musician={musician} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DndContext >
  );
};

export default ScheduleForm;