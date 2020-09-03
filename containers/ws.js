import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useEffect } from 'react';

import { addNewBlock, setRecentBlocks } from '../store/blocks/action'

import { 
  addNewDagBlock, 
  setRecentDagBlocks, 
  finalizeDagBlock 
} from '../store/dag_blocks/action';

import { addNewPbftBlock, setRecentPbftBlocks } from '../store/pbft_blocks/action'

import { setRecentTxs } from '../store/txs/action'

function WebsocketContainer({addNewBlock, addNewDagBlock, finalizeDagBlock, addNewPbftBlock}) {

  useEffect(() => {
    if (!window.ws) {
      window.ws = new WebSocket(`ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.hostname}:${Number(window.location.port)+1}`)
      window.ws.onopen = () => {
          console.log('socket connected')
      }
      window.ws.onerror = error => {
          console.error(error)
      }
      window.ws.onmessage = evt => {
          // listen to data sent from the websocket server
          const message = JSON.parse(evt.data)
          
          if (message.log === 'block') {
              addNewBlock(message.data);
          } else if (message.log === 'dag-block') {
              addNewDagBlock(message.data);
          } else if (message.log === 'dag-block-finalized') {
              finalizeDagBlock(message.data);
          } else if (message.log === 'pbft-block') {
              addNewPbftBlock(message.data);
        }
      }
  
      window.ws.onclose = () => {
          console.log('socket disconnected')
      }
    }
  })

  return (
      <>
      </>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    addNewBlock: bindActionCreators(addNewBlock, dispatch),
    addNewDagBlock: bindActionCreators(addNewDagBlock, dispatch),
    addNewPbftBlock: bindActionCreators(addNewPbftBlock, dispatch),
    finalizeDagBlock: bindActionCreators(finalizeDagBlock, dispatch),
    setRecentBlocks: bindActionCreators(setRecentBlocks, dispatch),
    setRecentDagBlocks: bindActionCreators(setRecentDagBlocks, dispatch),
    setRecentTxs: bindActionCreators(setRecentTxs, dispatch),
  }
}

export default connect(null, mapDispatchToProps)(WebsocketContainer)