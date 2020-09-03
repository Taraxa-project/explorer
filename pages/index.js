import { connect } from 'react-redux'
import { wrapper } from '../store/store'

import { addNewBlock, setRecentBlocks } from '../store/blocks/action'
import { addNewDagBlock, setRecentDagBlocks, finalizeDagBlock } from '../store/dag_blocks/action'
import { setRecentTxs } from '../store/txs/action'

import Link from 'next/link'

import {Container, Row, Col, Jumbotron, Card, ListGroup, ListGroupItem} from 'react-bootstrap'

import DAG from '../components/DAG'

import config from 'config';
import mongoose from 'mongoose'
import Block from '../models/block'
import DagBlock from '../models/dag_block'
import Tx from '../models/tx'

import moment from 'moment';

function Index({recentBlocks, recentTxs}) {
  return (
      <>
        <Container fluid>
          <Row>
            <Col style={{paddingLeft: 5, paddingRight: 5, paddingTop: 5, paddingBottom: 0, margin: 0, backgroundColor: '#0f1517'}}>
                <DAG/>
            </Col>
          </Row>
        
          <Row>
            <Col style={{padding: 0}} xs={12} sm={6}>
            <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
              <Card.Header>Latest Blocks</Card.Header>
              <ListGroup className="list-group-recent-blocks" variant="flush">
                {recentBlocks && recentBlocks.map((block) => (
                  <ListGroupItem key={block._id} variant="dark">
                    <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      #{block.number} <Link href="/block/[id]" as={`/block/${block._id}`}>
                        <a>{`${block._id}`}</a>
                    </Link>
                    </div>  
                    {block.transactions.length} transaction{block.transactions.length === 1 ? '' : 's'} - {moment(new Date(block.timestamp)).fromNow()}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Card>
            </Col>
            <Col style={{padding: 0}} xs={12} sm={6}>
            <Card style={{margin: 5, marginTop: 0, marginBottom: 0}} bg="dark" text="white">
              <Card.Header>Latest Transactions</Card.Header>
              <ListGroup className="list-group-recent-tx" variant="flush">
                {recentTxs && recentTxs.map((tx) => (
                  <ListGroupItem key={tx._id} variant="dark">
                    <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                        <a>{`${tx._id}`}</a>
                    </Link>
                    </div> 
                    Value: {tx.value.toLocaleString()} - {moment(new Date(tx.timestamp)).fromNow()}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Card>
            </Col>
          </Row>
        </Container>
      </>
  )
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ store }) => {
  try {
      mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
      
      let blocks = await Block.find().limit(10).sort({timestamp: -1}).lean();
      blocks = JSON.parse(JSON.stringify(blocks));

      let dagBlocks = await DagBlock.find().limit(50).sort({timestamp: -1}).lean();
      dagBlocks = JSON.parse(JSON.stringify(dagBlocks));

      let txs = await Tx.find().limit(10).sort({timestamp: -1}).lean();
      txs = JSON.parse(JSON.stringify(txs));

      if (blocks.length) {
        store.dispatch(addNewBlock(blocks[0]))
        store.dispatch(setRecentBlocks(blocks))
      }

      if (dagBlocks.length) {
        store.dispatch(setRecentDagBlocks(dagBlocks))
      }

      if (txs.length) {
        store.dispatch(setRecentTxs(txs))
      }
  } catch (e) {
      console.error('Error fetching data for index page: ' + e.message);
  }
})

const mapStateToProps = (state) => {
  return {
    recentBlocks: state.blocks.recent,
    recentPbftBlocks: state.pbftBlocks.recent,
    recentDagBlocks: state.dagBlocks.recent,
    recentTxs: state.txs.recent,
    tip: state.blocks.tip
  }
}

export default connect(mapStateToProps)(Index)