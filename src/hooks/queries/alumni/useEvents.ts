import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../../../services/alumni/EventsServices';
import type { Events, EventsFormData } from '../../../types/alumni/Events';

export const eventsKeys = {
  all: ['events'] as const,
  detail: (id: string) => ['events', id] as const,
  list: () => ['events', 'list'] as const,
};

export const useEvents = () => {
  return useQuery({
    queryKey: eventsKeys.list(),
    queryFn: eventsService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useEvent = (id?: string) => {
  return useQuery({
    queryKey: eventsKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const allEvents = await eventsService.getAll();
      return allEvents.find(event => event.eventsId === id) || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventsFormData) => {
      return eventsService.create(data);
    },
    onMutate: async (newEventData) => {
      await queryClient.cancelQueries({ queryKey: eventsKeys.list() });
      const previousEvents = queryClient.getQueryData<Events[]>(eventsKeys.list());
      const tempId = `temp-${Date.now()}`;
      const optimisticEvent: Events = {
        eventsId: tempId,
        eventTitle: newEventData.eventTitle,
        fromDate: newEventData.fromDate,
        toDate: newEventData.toDate,
        sessionId: newEventData.sessionId,
        session: newEventData.sessionId ? {
          sessionId: newEventData.sessionId,
          sessionName: 'Loading...',
        } : undefined,
        schoolClass: newEventData.classId ? {
          id: newEventData.classId,
          className: 'Loading...',
        } : undefined,
        classSection: ''
      };

      queryClient.setQueryData<Events[]>(eventsKeys.list(), (old = []) => [
        optimisticEvent,
        ...old,
      ]);

      return { previousEvents, tempId };
    },
    onSuccess: (data, _variables, context) => {

      queryClient.setQueryData<Events[]>(eventsKeys.list(), (old = []) => {
        return old.map(event => 
          event.eventsId === context?.tempId ? data : event
        );
      });

      queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
    },
    onError: (error: any, _variables, context) => {
      console.error('Error creating event:', error);
      if (context?.previousEvents) {
        queryClient.setQueryData(eventsKeys.list(), context.previousEvents);
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to create event';
      alert(errorMessage);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventsFormData }) => {
      return eventsService.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: eventsKeys.list() });
      const previousEvents = queryClient.getQueryData<Events[]>(eventsKeys.list());
      queryClient.setQueryData<Events[]>(eventsKeys.list(), (old = []) => {
        return old.map(event => 
          event.eventsId === id 
            ? {
                ...event,
                eventTitle: data.eventTitle,
                fromDate: data.fromDate,
                toDate: data.toDate,
                sessionId: data.sessionId,
                session: data.sessionId ? {
                  sessionId: data.sessionId,
                  sessionName: 'Updating...',
                } : undefined,
                schoolClass: data.classId ? {
                  id: data.classId,
                  className: 'Updating...',
                } : undefined,
              }
            : event
        );
      });

      return { previousEvents };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Events[]>(eventsKeys.list(), (old = []) => {
        return old.map(event => 
          event.eventsId === data.eventsId ? data : event
        );
      });
      queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
    },
    onError: (error: any, _variables, context) => {
      console.error('Error updating event:', error);
      if (context?.previousEvents) {
        queryClient.setQueryData(eventsKeys.list(), context.previousEvents);
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to update event';
      alert(errorMessage);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.delete,
    onMutate: async (id: string) => {

      await queryClient.cancelQueries({ queryKey: eventsKeys.list() });
      const previousEvents = queryClient.getQueryData<Events[]>(eventsKeys.list());
      queryClient.setQueryData<Events[]>(eventsKeys.list(), (old = []) =>
        old.filter((event) => event.eventsId !== id)
      );

      return { previousEvents };
    },
    onError: (error: any, _id, context) => {
      console.error('Error deleting event:', error);
      if (context?.previousEvents) {
        queryClient.setQueryData(eventsKeys.list(), context.previousEvents);
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete event';
      alert(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
    },
    onSuccess: () => {
    },
  });
};

export const useDeleteMultipleEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.deleteMultiple,
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: eventsKeys.list() });
      const previousEvents = queryClient.getQueryData<Events[]>(eventsKeys.list());
      queryClient.setQueryData<Events[]>(eventsKeys.list(), (old = []) =>
        old.filter((event) => !ids.includes(event.eventsId))
      );

      return { previousEvents };
    },
    onError: (error: any, _ids, context) => {
      console.error('Error deleting events:', error);
      if (context?.previousEvents) {
        queryClient.setQueryData(eventsKeys.list(), context.previousEvents);
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete events';
      alert(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
    },
    onSuccess: () => {
    },
  });
};