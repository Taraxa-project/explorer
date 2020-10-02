import { useState, useEffect } from 'react';

import { connect } from 'react-redux'
import { wrapper } from '../store/store'

import { addNewBlock } from '../store/blocks/action'
import { addNewDagBlock } from '../store/dag_blocks/action'
import { setRecentHistory } from '../store/history/action'
import { setRecentTxs } from '../store/txs/action'

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

import Link from 'next/link'

import {Container, Row, Col, Card, ListGroup, ListGroupItem} from 'react-bootstrap'

import config from 'config';
import mongoose from 'mongoose'
import Block from '../models/block'
import DagBlock from '../models/dag_block'
import Tx from '../models/tx'
import LogNetworkEvent from '../models/log_network_event'

import moment from 'moment';

function Index({recentBlocks, recentDagBlocks, recentTxs}) {

  moment.relativeTimeThreshold('s', 60);
  moment.relativeTimeThreshold('ss', 1);

  function reverse(array){
    return array.map((item,idx) => array[array.length-1-idx])
  }
  const [tick, newTick] = useState(new Date().valueOf())
  const [tpsData, setTpsData] = useState([]);
  const [dps, setDps] = useState([]);
  const [de, setDe] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      newTick(new Date().valueOf())
    })
    return function cleanup() {
      clearInterval(timer);
    }
  })

  useEffect(() => {
    let newTpsData = [];
    const reversedRecentBlocks = reverse(recentBlocks);

    reversedRecentBlocks.forEach((block, index) => {
      if (index !== 0) {
        let previousBlockTimestamp = reversedRecentBlocks[index - 1].timestamp;
        const elapsedSeconds = Math.round(new Date(block.timestamp).valueOf() / 1000) - Math.round(new Date(previousBlockTimestamp).valueOf() / 1000)
        const tps = block.transactions.length / elapsedSeconds;
        newTpsData.push({
          block: block.number,
          tps,
          elapsedSeconds
        })
      }
    })
    setTpsData(newTpsData);
  }, [recentBlocks])

  useEffect(() => {
    let dpsData = {};
    let newDps = [];
    let newDe = [];
    const reversedDagBlocks = reverse(recentDagBlocks);

    if (reversedDagBlocks.length) {
      reversedDagBlocks.forEach((block, index) => {
        const period = block.period || 'pending';
        dpsData[period] = dpsData[period] || [];
        dpsData[period].push(block)
      })
      Object.keys(dpsData).forEach(period => {
        if (period !== 'pending') {
          newDe = [];

          const dagBlocks = dpsData[period];
          const dagStart = new Date(dagBlocks[0].timestamp).valueOf();
          const dagEnd = new Date(dagBlocks[dagBlocks.length - 1].timestamp).valueOf();
          const durationSeconds = Math.round(dagEnd / 1000) - Math.round(dagStart / 1000)
          if (durationSeconds) {
            newDps.push({
              period: period.toString(),
              blocksPerSecond: Number(dagBlocks.length / durationSeconds).toFixed(1)
            })
          }
          // get all unique tx hashes for period
          let allHashes = [];
          dpsData[period].forEach(dagBlock => {
            allHashes = allHashes.concat(dagBlock.transactions)
          })
          const uniqueHashes = allHashes.filter((v, i, a) => a.indexOf(v) === i);
          const foundHashes = [];
          // then get % of unique hashes per block
          dpsData[period].forEach((dagBlock, index) => {
            let uniqueCount = 0;
            dagBlock.transactions.forEach(tx => {
              if (!foundHashes.includes(tx)) {
                uniqueCount++;
                foundHashes.push(tx);
              }
            })
            let percentUnique = uniqueCount / uniqueHashes.length * 100
            console.log('percent unique, period', period, `${dagBlock.level}_${index}`, uniqueHashes.length, uniqueCount, percentUnique)
            newDe.push({
              name: `${dagBlock.level}_${index}`,
              percentUnique
            })
          })
        }
      })
    }
    setDps(newDps)
    setDe(newDe)
  }, [recentDagBlocks]);

  return (
      <>
        <Container fluid>
          <Row>
            <Col xs={12} md={6} lg={3} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 5, paddingBottom: 5, margin: 0, backgroundColor: '#0f1517'}}>
              <Card style={{margin: 5}} bg="dark" text="white">
              <Card.Header>Transactions Per Second</Card.Header>
              <ListGroup variant="flush">
                <ListGroupItem variant="dark">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={tpsData} margin={{top: 20, right: 20}}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="block" />
                      <YAxis />
                      {/* <Tooltip /> */}
                      {/* <Legend /> */}
                      <Bar dataKey="tps" fill="#82ca9d" animationDuration={0} />
                      {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                    </BarChart>
                  </ResponsiveContainer>
                </ListGroupItem>
              </ListGroup>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={3} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 5, paddingBottom: 5, margin: 0, backgroundColor: '#0f1517'}}>
              <Card style={{margin: 5}} bg="dark" text="white">
                <Card.Header>Block Time (Seconds)</Card.Header>
                <ListGroup variant="flush">
                  <ListGroupItem variant="dark">
                  <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={tpsData} margin={{top: 20, right: 20}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="block" />
                        <YAxis />
                        {/* <Tooltip /> */}
                        {/* <Legend /> */}
                        <Bar dataKey="elapsedSeconds" fill="#82ca9d" animationDuration={0}/>
                        {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                      </BarChart>
                    </ResponsiveContainer>
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={3} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 5, paddingBottom: 5, margin: 0, backgroundColor: '#0f1517'}}>
              <Card style={{margin: 5}} bg="dark" text="white">
              <Card.Header>DAG Block Per Second</Card.Header>
                <ListGroup variant="flush">
                  <ListGroupItem variant="dark">
                  <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dps} margin={{top: 20, right: 20}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        {/* <Tooltip /> */}
                        {/* <Legend /> */}
                        <Bar dataKey="blocksPerSecond" fill="#82ca9d" animationDuration={0}/>
                        {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                      </BarChart>
                    </ResponsiveContainer>
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={3} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 5, paddingBottom: 5, margin: 0, backgroundColor: '#0f1517'}}>
              <Card style={{margin: 5}} bg="dark" text="white">
                <Card.Header>DAG Efficiency</Card.Header>
                <ListGroup variant="flush">
                  <ListGroupItem variant="dark">
                  <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={de} margin={{top: 20, right: 20}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        {/* <Tooltip /> */}
                        {/* <Legend /> */}
                        <Bar dataKey="percent" fill="#82ca9d" animationDuration={0}/>
                        {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                      </BarChart>
                    </ResponsiveContainer>
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col>
          </Row>
        
          <Row>
            <Col style={{padding: 0}} xs={12} sm={6}>
            <Card style={{margin: 5, marginTop: 5, marginBottom: 10}} bg="dark" text="white">
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
            <Card style={{margin: 5, marginTop: 5, marginBottom: 0}} bg="dark" text="white">
              <Card.Header>Recent Transactions</Card.Header>
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

      let [blocks, dagBlocks, txs] = await Promise.all([
        Block.find().limit(10).sort({timestamp: -1}).lean(),
        DagBlock.find().limit(50).sort({timestamp: -1}).lean(),
        Tx.find().limit(10).sort({timestamp: -1}).lean()
      ])

      blocks = JSON.parse(JSON.stringify(blocks));
      dagBlocks = JSON.parse(JSON.stringify(dagBlocks));
      txs = JSON.parse(JSON.stringify(txs));

      if (blocks.length) {
        blocks.forEach(block => {
          store.dispatch(addNewBlock(blocks))
        })
        
      }

      if (dagBlocks.length) {
        dagBlocks.forEach(block => {
          store.dispatch(addNewDagBlock(blocks))
        })
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
    recentDagBlocks: state.dagBlocks.recent,
    recentTxs: state.txs.recent,
  }
}

export default connect(mapStateToProps)(Index)