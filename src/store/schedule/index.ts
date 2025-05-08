/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Action } from 'redux-actions';

import { handleActions } from 'redux-actions';

import types from './types';

import type { ErrorBE } from '../../utils/types';
import type { ScheduleInstance } from '../../models/schedule';

export interface ScheduleState {
  errors: ErrorBE;
  loading: boolean;
  schedule: ScheduleInstance;
  updateLoading: boolean;
}

const initialState: ScheduleState = {
  loading: false,
  errors: {},
  schedule: {} as ScheduleInstance,
  updateLoading: false,
};

const scheduleReducer: any = {
  [types.FETCH_SCHEDULE_SUCCESS]: (
    state: ScheduleState,
    { payload }: Action<typeof state.schedule>
  ): ScheduleState => ({
    ...state,
    loading: false,
    errors: {},
    schedule: payload,
  }),

  [types.FETCH_SCHEDULE_FAILED]: (
    state: ScheduleState,
    { payload }: Action<typeof state.errors>
  ): ScheduleState => ({
    ...state,
    loading: false,
    errors: payload,
  }),
  
  [types.UPDATE_ASSIGNMENT]: (
    state: ScheduleState
  ): ScheduleState => ({
    ...state,
    updateLoading: true,
  }),

  [types.UPDATE_ASSIGNMENT_SUCCESS]: (
    state: ScheduleState,
    { payload }: Action<any>
  ): ScheduleState => {
    // Güncellenmiş görevlendirmeyi bul ve değiştir
    const updatedAssignments = state.schedule.assignments.map(
      assignment => (assignment.id === payload.id ? payload : assignment)
    );

    return {
      ...state,
      updateLoading: false,
      errors: {},
      schedule: {
        ...state.schedule,
        assignments: updatedAssignments
      },
    };
  },

  [types.UPDATE_ASSIGNMENT_FAILED]: (
    state: ScheduleState,
    { payload }: Action<typeof state.errors>
  ): ScheduleState => ({
    ...state,
    updateLoading: false,
    errors: payload,
  }),
};

export default handleActions(scheduleReducer, initialState) as any;
