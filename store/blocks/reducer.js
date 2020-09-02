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
  let recent = [].concat(state.recent);
  switch (action.type) {
    case blockActionTypes.NEWBLOCK:
      if (state.recent.length >= 10) {
        recent.pop();
      }
      recent.unshift(action.data);

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