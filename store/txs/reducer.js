import { txActionTypes } from './action'

const txsInitialState = {
  recent: [],
}

export default function reducer(state = txsInitialState, action) {
  switch (action.type) {
    case txActionTypes.RECENTTXS:
      return Object.assign({}, state, {
        recent: action.data,
      })
    default:
      return state
  }
}