import { dagBlockActionTypes } from './action'

const blocksInitialState = {
  recent: [],
}

export default function reducer(state = blocksInitialState, action) {
  let recent = [].concat(state.recent);
  switch (action.type) {
    case dagBlockActionTypes.NEWDAGBLOCK:
      if (state.recent.length >= 50) {
        recent.pop();
      }
      recent.unshift(action.data);

      return Object.assign({}, state, {
        recent,
      })
    case dagBlockActionTypes.RECENTDAGBLOCKS:
      return Object.assign({}, state, {
        recent: action.data,
      })
    case dagBlockActionTypes.FINALIZEDDAGBLOCK:
      const index = state.recent.findIndex(doc => doc.hash === action.data.block);
      if (index > -1) {
        recent[index].period = action.data.period
      }
      return Object.assign({}, state, {
        recent
      })
    default:
      return state
  }
}