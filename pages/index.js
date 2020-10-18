import { useState, useEffect } from 'react';

import { connect } from 'react-redux'
import { wrapper } from '../store/store'

import { addNewBlock } from '../store/blocks/action'
import { addNewDagBlock } from '../store/dag_blocks/action'
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

import moment from 'moment';

function Index({recentBlocks, recentDagBlocks}) {

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
    }, 1000)
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
    // console.log(new Date().toISOString(), 'updating block/tx data because recent blocks changed...')
    setTpsData(newTpsData);
  }, [recentBlocks])

  useEffect(() => {
    let dpsData = {};
    let newDps = [];
    let newDe = [];
    const reversedDagBlocks = reverse(recentDagBlocks);

    if (reversedDagBlocks.length) {
      let lastPeriod = 0;
      reversedDagBlocks.forEach((block, index) => {
        let period = block.period;
        if (!period) {
          period = lastPeriod + 1 + '*'
        } else {
          lastPeriod = period;
        }
        dpsData[period] = dpsData[period] || [];
        dpsData[period].push(block)
      })
      Object.keys(dpsData).forEach(period => {
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
          // get % of unique hashes per block
          const foundHashes = [];
          const percentages = [];
          dpsData[period].forEach((dagBlock, index) => {
            let uniqueCount = 0;
            dagBlock.transactions.forEach(tx => {
              if (!foundHashes.includes(tx)) {
                uniqueCount++;
                foundHashes.push(tx);
              }
            })
            let percentUnique = uniqueCount / dagBlock.transactions.length * 100
            percentages.push(percentUnique)
          })

          let total = 0;
          percentages.forEach(percent => {
            total += percent;
          })
          let percent = total / percentages.length
          newDe.push({
            period,
            percent
          })
      })
    }
    // console.log(new Date().toISOString(), 'updating dag chart data because recent dag blocks changed...')
    setDps(newDps)
    setDe(newDe)
  }, [recentDagBlocks]);

  // console.log(new Date().toISOString(), 'updating view')

  return (
      <>
        <Container fluid>
          <Row>
            <Col xs={12} md={6} lg={3} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 2, margin: 0, backgroundColor: '#0f1517'}}>
              <Card style={{margin: 5}} bg="dark" text="white">
              <Card.Header>Transactions Per Second</Card.Header>
              <ListGroup variant="flush">
                <ListGroupItem variant="dark" style={{padding: 0}}>
                <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={tpsData} margin={{top: 15, right: 15, left: 0, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke={'#aaa'}/>
                      <XAxis dataKey="block" fontSize={'12'} height={25}/>
                      <YAxis fontSize={'12'} tickFormatter={function (d) {return `${d.toLocaleString()}/s`}} width={50}/>
                      {/* <Tooltip /> */}
                      {/* <Legend /> */}
                      <Bar dataKey="tps" fill="#82ca9d" animationDuration={0} opacity={0.7}/>
                      {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                    </BarChart>
                  </ResponsiveContainer>
                </ListGroupItem>
              </ListGroup>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={3} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 2, margin: 0, backgroundColor: '#0f1517'}}>
              <Card style={{margin: 5}} bg="dark" text="white">
                <Card.Header>Block Time</Card.Header>
                <ListGroup variant="flush">
                  <ListGroupItem variant="dark" style={{padding: 0}}>
                  <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={tpsData} margin={{top: 15, right: 15, left: 0, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke={'#aaa'}/>
                        <XAxis dataKey="block" fontSize={'12'} height={25}/>
                        <YAxis fontSize={'12'} tickFormatter={function (d) {return `${d.toLocaleString()}s`}} width={50}/>
                        {/* <Tooltip /> */}
                        {/* <Legend /> */}
                        <Bar dataKey="elapsedSeconds" fill="#82ca9d" animationDuration={0} opacity={0.7}/>
                        {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                      </BarChart>
                    </ResponsiveContainer>
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={3} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 2, margin: 0, backgroundColor: '#0f1517'}}>
              <Card style={{margin: 5}} bg="dark" text="white">
              <Card.Header>DAG Block Per Second</Card.Header>
                <ListGroup variant="flush">
                  <ListGroupItem variant="dark" style={{padding: 0}}>
                  <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={dps} margin={{top: 15, right: 15, left: 0, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke={'#aaa'}/>
                        <XAxis dataKey="period" fontSize={'12'} height={25}/>
                        <YAxis fontSize={'12'} tickFormatter={function (d) {return `${d.toLocaleString()}/s`}} width={50}/>
                        {/* <Tooltip /> */}
                        {/* <Legend /> */}
                        <Bar dataKey="blocksPerSecond" fill="#82ca9d" animationDuration={0} opacity={0.7}/>
                        {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                      </BarChart>
                    </ResponsiveContainer>
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={3} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 2, margin: 0, backgroundColor: '#0f1517'}}>
              <Card style={{margin: 5}} bg="dark" text="white">
                <Card.Header>DAG Efficiency</Card.Header>
                <ListGroup variant="flush">
                  <ListGroupItem variant="dark" style={{padding: 0}}>
                  <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={de} margin={{top: 15, right: 15, left: 0, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke={'#aaa'}/>
                        <XAxis dataKey="period" fontSize={'12'} height={25}/>
                        <YAxis fontSize={'12'} tickFormatter={function (d) {return `${d}%`}} width={50}/>
                        {/* <Tooltip /> */}
                        {/* <Legend /> */}
                        <Bar dataKey="percent" fill="#82ca9d" animationDuration={0} opacity={0.7}/>
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
              <Card.Header>DAG Blocks</Card.Header>
              <ListGroup className="list-group-recent-blocks" variant="flush">
                {recentDagBlocks && recentDagBlocks.slice(0, 10).map((block) => (
                  <ListGroupItem key={block._id} variant="dark">
                    <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      Level: {block.level} <Link href="/dag_block/[id]" as={`/dag_block/${block._id}`}>
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
            <Card style={{margin: 5, marginTop: 5, marginBottom: 10}} bg="dark" text="white">
              <Card.Header>PBFT Blocks</Card.Header>
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
        DagBlock.find().limit(10).sort({timestamp: -1}).lean(),
      ])

      blocks = JSON.parse(JSON.stringify(blocks));
      dagBlocks = JSON.parse(JSON.stringify(dagBlocks));

      if (blocks.length) {
        blocks.reverse();
        blocks.forEach(block => {
          store.dispatch(addNewBlock(block))
        })
        
      }

      if (dagBlocks.length) {
        dagBlocks.reverse()
        dagBlocks.forEach(block => {
          store.dispatch(addNewDagBlock(block))
        })
      }



  } catch (e) {
      console.error('Error fetching data for index page: ' + e.message);
  }
})

const mapStateToProps = (state) => {
  return {
    recentBlocks: state.blocks.recent,
    recentDagBlocks: state.dagBlocks.recent,
  }
}

export default connect(mapStateToProps)(Index)