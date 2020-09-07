import { txActionTypes } from './action'

const txInitialState = {
  recent: [],
}

export default function reducer(state = txInitialState, action) {
  switch (action.type) {
    case txActionTypes.RECENTTXS:
      return Object.assign({}, state, {
        recent: action.data,
      })
    default:
      return state
  }
}