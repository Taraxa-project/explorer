import { dagBlockActionTypes } from './action'

const blocksInitialState = {
  level: 0,
  recent: [],
}

export default function reducer(state = blocksInitialState, action) {
  let recent = [].concat(state.recent);
  let updated = [];
  switch (action.type) {
    case dagBlockActionTypes.NEWDAGBLOCK:
      updated = [action.data];
      for (let block of recent) {
        if (block.level > (state.level - 9)) {
          updated.push(block);
        }
      }
      return Object.assign({}, state, {
        recent: updated,
        level: action.data.level
      })
    case dagBlockActionTypes.RECENTDAGBLOCKS:
      let maxLevel = 0;
      for (let block of action.data) {
        if (block.level > maxLevel) {
          maxLevel = block.level;
        }
      }
      for (let block of action.data) {
        if (block.level > maxLevel - 10) {
          updated.push(block);
        }
      }
      return Object.assign({}, state, {
        recent: updated,
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