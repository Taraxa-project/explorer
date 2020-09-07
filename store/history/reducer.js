import { historyActionTypes } from './action'

const historyInitialState = {
  recent: [],
}

export default function reducer(state = historyInitialState, action) {
  let recent = [].concat(state.recent);
  switch (action.type) {
    case historyActionTypes.ADDHISTORY:
      if (state.recent.length >= 100) {
        recent.pop();
      }
      recent.unshift(action.data);

      return Object.assign({}, state, {
        recent,
      })
    case historyActionTypes.RECENTHISTORY:
      return Object.assign({}, state, {
        recent: action.data,
      })
    default:
      return state
  }
}