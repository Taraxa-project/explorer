import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useEffect } from 'react';

import { addNewBlock } from '../store/blocks/action'
import { addNewDagBlock,  finalizeDagBlock } from '../store/dag_blocks/action';
import { addNewPbftBlock } from '../store/pbft_blocks/action'
import { addNewHistory } from '../store/history/action'

function WebsocketContainer({addNewBlock, addNewDagBlock, finalizeDagBlock, addNewPbftBlock, addNewHistory}) {

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
          
          if (message.log === 'dag-block') {
              addNewDagBlock(message.data);
          } else if (message.log === 'dag-block-finalized') {
              finalizeDagBlock(message.data);
          } else if (message.log === 'pbft-block') {
              addNewPbftBlock(message.data);
          } else if (message.log === 'block') {
              addNewBlock(message.data);
          }

          addNewHistory(message);
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
    addNewHistory: bindActionCreators(addNewHistory, dispatch),
  }
}

export default connect(null, mapDispatchToProps)(WebsocketContainer)