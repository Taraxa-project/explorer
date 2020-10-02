import { dagBlockActionTypes } from './action'
import { blockActionTypes } from '../pbft_blocks/action'

const blocksInitialState = {
  level: 0,
  period: 0,
  recent: [],
}

export default function reducer(state = blocksInitialState, action) {
  let recent = [].concat(state.recent);
  let updated = [];
  let period = state.period;
  switch (action.type) {
    case dagBlockActionTypes.NEWDAGBLOCK:
      updated = [action.data];
      for (let block of recent) {
        if (!block.period || block.period > (state.period - 9)) {
          updated.push(block);
        }
        if (block.period && block.period > state.period) {
          period = block.period
        }
      }
      return Object.assign({}, state, {
        recent: updated,
        period,
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
        if (block.level > maxLevel - 15) {
          updated.push(block);
        }
      }
      return Object.assign({}, state, {
        recent: updated,
      })
    case blockActionTypes.NEWPBFTBLOCK:
      const sched = action.data.schedule;
      for (let block of recent) {
        if (sched[block._id] || sched[block._id.replace(/^0x/, '')]) {
          block.period = action.data.period
        }
        updated.push(block);
      }
      return Object.assign({}, state, {
        recent: updated,
        period: action.data.period
      })
    default:
      return state
  }
}