import { blockActionTypes } from './action'

const blocksInitialState = {
  tip: {
    hash: '',
    number: -1,
    timestamp: new Date(0).toString()
  },
  recent: [],
}

export default function reducer(state = blocksInitialState, action) {
  switch (action.type) {
    case blockActionTypes.NEWBLOCK:
      const recent = state.recent;
      if (state.recent.length >= 20) {
        recent = state.recent.shift();
      }
      recent.push(action.data);

      return Object.assign({}, state, {
        tip: {
          hash: action.data._id,
          number: action.data.number,
          timestamp: action.data.timestamp
        },
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