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
    case blockActionTypes.FINALIZEDDAGBLOCK:
      console.log('Finalize dag block reducer', action.data)
      for (let block of recent) {
        if (!block.period && block._id === action.data.block) {
          block.period = action.data.period
        }
        updated.push(block);
      }
      return Object.assign({}, state, {
        recent: updated,
        period: action.data.period,
      })
    case blockActionTypes.NEWPBFTBLOCK:
      const sched = action.data.schedule.dag_blocks_order;
      for (let block of recent) {
        if (sched.includes(block._id) || sched.includes(block._id.replace(/^0x/, ''))) {
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