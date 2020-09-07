import { blockActionTypes } from './action'

const blocksInitialState = {
  recent: [],
}

export default function reducer(state = blocksInitialState, action) {
  let recent = [].concat(state.recent);
  switch (action.type) {
    case blockActionTypes.NEWBLOCK:
      if (state.recent.length >= 10) {
        recent.pop();
      }
      recent.unshift(action.data);

      return Object.assign({}, state, {
        recent,
      })
    case blockActionTypes.RECENTBLOCKS:
      return Object.assign({}, state, {
        recent: action.data,
      })
    default:
      return state
  }
}