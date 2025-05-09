/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { Action } from 'redux-actions';

import { put, takeEvery } from 'redux-saga/effects';

import types from './types';
import Logger from '../../utils/logger';
import * as actions from './actions';
import { updateProgress } from '../ui/actions';

import type { Callbacks } from '../../utils/types';
import { scheduleReponse } from '../../constants/api';

function* asyncFetchSchedule({
  payload: { onSuccess, onError } = {},
}: Action<
  Callbacks
>) {
  yield put(updateProgress());
  try {
    const response = scheduleReponse;
    yield put(actions.fetchScheduleSuccess(response.data));

    onSuccess && onSuccess(response);
  } catch (err) {
    Logger.error(err);
    onError && onError(err);

    yield put(actions.fetchScheduleFailed());
  } finally {
    yield put(updateProgress(false));
  }
}

function* asyncUpdateAssignment({
  payload,
}: Action<{
  assignment: any;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}>) {
  yield put(updateProgress());
  try {
   
    
    const { assignment, onSuccess, onError } = payload || { assignment: null };
    
    if (!assignment) {
      throw new Error('Assignment is required');
    }
    
    // API çağrısı yapmadan başarılı varsayıyoruz
    yield put(actions.updateAssignmentSuccess(assignment));

    onSuccess && onSuccess(assignment);
  } catch (err) {
    Logger.error(err);
    const { onError } = payload || {};
    onError && onError(err);

    yield put(actions.updateAssignmentFailed());
  } finally {
    yield put(updateProgress(false));
  }
}

const scheduleSagas = [
  takeEvery(types.FETCH_SCHEDULE, asyncFetchSchedule),
  takeEvery(types.UPDATE_ASSIGNMENT, asyncUpdateAssignment),
];

export default scheduleSagas;
