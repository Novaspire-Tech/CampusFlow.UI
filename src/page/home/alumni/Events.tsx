import React, { useState, useEffect } from 'react';
import ControlledTable from '../../../components/uncontrolled/ControlledTable';
import TextField from '../../../components/controlled/TextField';
import DateField from '../../../components/controlled/DateField';
import Button from '../../../components/controlled/Button';
import { useForm, type SubmitHandler, type FieldValues } from 'react-hook-form';
import { IconField } from '../../../components';
import { getPagesDataText } from '../../../helpers/useTranslations';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '../../../components/controlled';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useDeleteMultipleEvents
} from '../../../hooks/queries/alumni/useEvents';
import { useSchoolClasses } from '../../../hooks/queries/academics/useClasses';
import type { EventsFormData } from '../../../types/alumni/Events';
import { useSessions } from '../../../hooks/queries/systemSettinds/useSessionSetting';
import { toast } from 'react-toastify';
import { confirmToast } from '../../../helpers/confirmToast';
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown';


interface EventItem {
  id: string;
  title: string;
  class?: string;
  session?: string;
  from: string;
  to: string;
}

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: number, events: EventItem[] } | null>(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      class: '',
      session: '',
      from: '',
      to: '',
    }
  });

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const [currentDate, setCurrentDate] = useState<Date>(startOfYear);

  const { data: eventsData = [], isLoading } = useEvents();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const deleteMultipleMutation = useDeleteMultipleEvents();
  const { data: sessionsData } = useSessions();
  const { data: schoolClassesData } = useSchoolClasses();

  const { t } = useTranslation();
  const text = getPagesDataText(t);
  const watchedClass = watch('class');
  const watchedSession = watch('session');

  useEffect(() => {}, [watchedClass, watchedSession]);

  const events: EventItem[] = eventsData.map((event) => {
    const sessionName = event.session?.sessionName || '';
    const className = event.schoolClass?.className || '';
    return {
      id: event.eventsId || '',
      title: event.eventTitle || '',
      class: className,
      session: sessionName,
      from: event.fromDate || "",
      to: event.toDate || "",
    };
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const handleEdit = (id: string | number) => {
    const eventId = String(id);
    const eventToEdit = eventsData.find((event) => event.eventsId === eventId);
    if (eventToEdit) {
      setEditId(eventId);
      setShowForm(true);

      const parseDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      };

      setValue('title', eventToEdit.eventTitle);
      setValue('class', eventToEdit.schoolClass?.id || '');
      setValue('session', eventToEdit.sessionId || '');
      setValue('from', parseDate(eventToEdit.fromDate));
      setValue('to', parseDate(eventToEdit.toDate));

      const parsedDate = parseDate(eventToEdit.fromDate);
      if (parsedDate) {
        setCurrentDate(new Date(parsedDate));
      }
    }
  };

  const handleDelete = async (id: string | number) => {
    const eventId = String(id);

    const confirmDelete = await confirmToast(
      text.Do_you_want_to_delete_this_entry,
    );

    if (confirmDelete) {
      try {
        await deleteMutation.mutateAsync(eventId);
        toast.success("Event deleted successfully!");
      } catch (error: any) {
        console.error("Delete failed:", error);
        toast.error(
          error?.message || "Failed to delete event. Please try again."
        );
      }
    }
  };


  const handlaMultipleDelete = async () => {
    const confirmDelete = await confirmToast(text.Delete_A);

    if (confirmDelete) {
      try {
        const allIds = eventsData.map((event) => event.eventsId);
        await deleteMultipleMutation.mutateAsync(allIds);
        toast.success("Selected events deleted successfully!");
      } catch (error: any) {
        console.error("Multiple delete failed:", error);
        toast.error(
          error?.message || "Failed to delete selected events."
        );
      }
    }
  };


  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {

      if (!data.title || data.title.trim() === '') {
        toast.error('Please enter an event title');
        return;
      }

      if (!data.from || !data.to) {
        toast.error('Please select both from and to dates');
        return;
      }

      const formData: EventsFormData = {
        eventTitle: data.title.trim(),
        fromDate: data.from,
        toDate: data.to,
        sessionId: data.session ? String(data.session) : undefined,
        classId: data.class ? String(data.class) : undefined,
      };


      if (editId !== null) {
        await updateMutation.mutateAsync({ id: editId, data: formData });
        toast.success("Event updated successfully!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Event created successfully!");
      }

      reset({
        title: '',
        class: '',
        session: '',
        from: '',
        to: '',
      });

      setEditId(null);
      setShowForm(false);

    } catch (error: any) {
      console.error("Submit failed:", error);
      toast.error(
        error?.message || "Operation failed. Please try again."
      );
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    reset({
      title: '',
      class: '',
      session: '',
      from: '',
      to: '',
    });
    setEditId(null);
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const weeks: (number | null)[][] = [];
  let day = 1 - startDay;

  while (day <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day > 0 && day <= daysInMonth ? day : null);
      day++;
    }
    weeks.push(week);
  }

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const columns = [
    { key: 'title', label: text.Event_Title },
    { key: 'class', label: text.Class },
    { key: 'session', label: text.Pass_Out_Session },
    { key: 'from', label: text.From_Date },
    { key: 'to', label: text.To_Date },
  ];

  const parseEventDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const getEventsForDate = (date: number): EventItem[] => {
    const current = new Date(year, month, date, 0, 0, 0, 0);
    return events.filter((event) => {
      const from = parseEventDate(event.from);
      const to = parseEventDate(event.to);
      if (!from || !to) return false;
      const fromMidnight = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
      );
      const toMidnight = new Date(
        to.getFullYear(),
        to.getMonth(),
        to.getDate(),
      );
      const currentMidnight = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
      );
      return currentMidnight >= fromMidnight && currentMidnight <= toMidnight;
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow p-2 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <button onClick={goToPrevMonth} className="text-xl px-2">
            {"<"}
          </button>
          <h2 className="text-xl font-semibold">{`${monthName} ${year}`}</h2>
          <button onClick={goToNextMonth} className="text-xl px-2">
            {">"}
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-100">
            <div className="grid grid-cols-7 text-sm font-semibold text-center mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {weeks.map((week, i) => (
              <div key={i} className="grid grid-cols-7 gap-1 text-xs">
                {week.map((date, j) => {
                  const dateEvents = date ? getEventsForDate(date) : [];
                  const visibleEvents = dateEvents.slice(0, 2);
                  const moreCount = dateEvents.length - 2;

                  return (
                    <div
                      key={j}
                      className="h-20 sm:h-24 border p-1 relative overflow-hidden"
                    >
                      {date && (
                        <>
                          <div className="absolute top-1 left-1 font-bold text-xs">
                            {date}
                          </div>
                          <div className="mt-5 space-y-0.5 overflow-hidden">
                            {visibleEvents.map((event) => (
                              <div
                                key={event.id}
                                className="bg-green-600 text-white px-1 py-0.5 text-[10px] rounded truncate w-full"
                              >
                                {event.title}
                              </div>
                            ))}
                            {moreCount > 0 && (
                              <div
                                onClick={() =>
                                  setSelectedDayEvents({
                                    date,
                                    events: dateEvents,
                                  })
                                }
                                className="text-blue-600 font-bold text-[10px] px-1 cursor-pointer hover:underline"
                              >
                                +{moreCount} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-[80vh] overflow-y-auto">
        <ControlledTable
          columns={columns}
          data={filteredEvents}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handlaMultipleDelete}
          title={text.Event_List}
          btn
          btnName={text.Add_New_Event}
          showForm={() => {
            setShowForm(true);
            reset({
              title: '',
              class: '',
              session: '',
              from: '',
              to: '',
            });
            setEditId(null);
          }}
          enablePermissions={true}
          permissionScope="ALUMNI"
        />

        {showForm && (
          <div className="fixed inset-0 bg-blend-color-burn bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4 text-center">
                {editId ? text.Edit_Event : text.Add_New_Event}
              </h2>

              <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}
              queryKeys={['events','schoolClasses','sessions']}>
                <TextField
                  name="title"
                  label={text.Event_Title}
                  control={control}
                  required={true}
                  placeholder='Enter Event Title'
                  rules={{ required: 'Event title is required' }}
                />

                <Dropdown
                  name="class"
                  label={`${text.Class} (Optional)`}
                  control={control}
                  options={
                    schoolClassesData?.map((c: any) => ({
                      value: String(c.id || c.schoolClassId),
                      label: c.name || c.className,
                    })) || []
                  }
                />

                <Dropdown
                  name="session"
                  label={`${text.Pass_Out_Session} (Optional)`}
                  control={control}
                  options={
                    sessionsData?.map((s: any) => ({
                      value: String(s.sessionId || s.id),
                      label: s.session || s.sessionName,
                    })) || []
                  }
                />

                <DateField
                  name="from"
                  label={text.From_Date}
                  control={control}
                  required={true}
                  rules={{ required: 'From date is required' }}
                />

                <DateField
                  name="to"
                  label={text.To_Date}
                  control={control}
                  required={true}
                  rules={{ required: 'To date is required' }}
                />

                <div className="flex justify-between mt-4 gap-2">
                  <Button
                    name={editId ? text.Update : text.Submit}
                    loading={createMutation.isPending || updateMutation.isPending}
                    icon={<IconField name="FaSave" />}
                  />
                  <Button
                    name={text.Cancel}
                    icon={<IconField name="FaTimesCircle" />}
                    onClick={handleFormCancel}
                    loading={false}
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        )}

        {selectedDayEvents && (
          <div className="fixed inset-0 bg-blend-color-burn bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-sm">
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h3 className="font-bold text-lg">
                  Events for {selectedDayEvents.date} {monthName}
                </h3>
                <button
                  onClick={() => setSelectedDayEvents(null)}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedDayEvents.events.map(event => (
                  <div key={event.id} className="p-2 bg-green-50 border-l-4 border-green-600 rounded">
                    <p className="font-semibold text-sm text-green-800">{event.title}</p>
                    {event.class && (
                      <p className="text-xs text-gray-600">
                        {event.class} {event.session ? `| ${event.session}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;