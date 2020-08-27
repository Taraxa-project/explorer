import { dagBlockActionTypes } from './action'

const blocksInitialState = {
  recent: [],
}

export default function reducer(state = blocksInitialState, action) {
  let recent = state.recent;
  switch (action.type) {
    case dagBlockActionTypes.NEWBLOCK:
      if (state.recent.length >= 20) {
        recent = state.recent.pop();
      }
      recent.unshift(action.data);

      return Object.assign({}, state, {
        recent,
      })
    case dagBlockActionTypes.RECENTBLOCKS:
      return Object.assign({}, state, {
        recent: action.data,
      })
    case dagBlockActionTypes.FINALIZEDBLOCK:
      const index = state.recent.findIndex(doc => doc.hash === action.data.hash);
      if (index > -1) {
        recent[index] = action.data
      }
      return Object.assign({}, state, {
        recent
      })
    default:
      return state
  }
}