import Link from 'next/link'

import {Container, Row, Col, Navbar, Nav, Button, Jumbotron, Card, ListGroup, ListGroupItem} from 'react-bootstrap'

// import styles from '../styles/Home.module.css'

import config from 'config';
import mongoose from 'mongoose'
import Block from '../models/block'
import Tx from '../models/tx'

import moment from 'moment';

export default function Index({blocks, txs}) {

  return (
      <>
        <Container fluid>
          <Row>
            <Col style={{paddingLeft: 5, paddingRight: 5, paddingTop: 5, paddingBottom: 0, margin: 0}}>
              <Jumbotron style={{
                marginHorizontal: 0, 
                marginBottom: 10,
                backgroundColor: "#f7f7f7"
                }}>
                <h1>DAG Viz here</h1>
              </Jumbotron>
            </Col>
          </Row>
        
          <Row>
            <Col style={{padding: 0}} xs={12} sm={6}>
            <Card style={{margin: 5, marginTop: 0, marginBottom: 10}}>
              <Card.Header>Latest Blocks</Card.Header>
              <ListGroup className="list-group-recent-blocks" variant="flush">
                {blocks && blocks.map((block) => (
                  <ListGroupItem key={block._id}>
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
            <Card style={{margin: 5, marginTop: 0, marginBottom: 0}}>
              <Card.Header>Latest Transactions</Card.Header>
              <ListGroup className="list-group-recent-tx" variant="flush">
                {txs && txs.map((tx) => (
                  <ListGroupItem key={tx._id}>
                    <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                        <a>{`${tx._id}`}</a>
                    </Link>
                    </div> 
                    Value: {tx.value} - {moment(new Date(tx.timestamp)).fromNow()}
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

export async function getServerSideProps(context) {
  let props = {
      blocks: [],
      txs: []
  };
  try {
      mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
      const blocks = await Block.find().limit(10).sort({timestamp: -1}).lean();
      props.blocks = JSON.parse(JSON.stringify(blocks));
      const txs = await Tx.find().limit(10).sort({timestamp: -1}).lean();
      props.txs = JSON.parse(JSON.stringify(txs));
  } catch (e) {
      console.error('Error fetching data for index page: ' + e.message);
  }

  return {
    props, // will be passed to the page component as props
  }
}  