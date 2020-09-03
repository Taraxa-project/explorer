import Link from 'next/link'

import config from 'config';
import mongoose from 'mongoose'
import DAGBlock from '../../models/dag_block'
import Tx from '../../models/tx'

import {Container, Row, Col, Navbar, Nav, Button, Jumbotron, Card, ListGroup, ListGroupItem, Table} from 'react-bootstrap'

export async function getServerSideProps(context) {
    let props = {
        data: {}
    };
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
        const block = await DAGBlock.findOne({_id: context.query.id}).populate({
            path: 'transactions',
            perDocumentLimit: 100
        }).lean();
        if (block) {
            props.data = JSON.parse(JSON.stringify(block));
        }
    } catch (e) {
        console.error('Error in Server Props: ' + e.message);
    }

    return {
      props, // will be passed to the page component as props
    }
}  

export default function DagBlockPage({data}) {
    console.log('dag block', data)
    return <>
       <h1>DAG Block {data._id}</h1>
       <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            {/* <Card.Header>DAG Block {data._id}</Card.Header> */}
            <Card.Body>
                <Card.Title>Level: {data.level}</Card.Title>
                <ul>
                    <li>Hash: {data._id}</li>
                    <li>Period Block: {data.period ? 'true' : 'false'}</li>
                    <li>Timestamp: {new Date(data.timestamp).toUTCString()}</li>
                    <li>Pivot: {' '}
                        <Link href="/dag_block/[id]" as={`/dag_block/${data.pivot}`}>
                            <a>{data.pivot}</a>
                        </Link></li>
                    <li>Sender: <Link href="/address/[id]" as={`/address/${data.sender}`}>
                                    <a>{data.sender}</a>
                                </Link>
                    </li>
                    <li>Sig: {data.sig}</li>
                    <li>Tips: 
                        <ul>{data.tips.map((tip) => (
                            <li key={tip}>
                                 <Link href="/dag_block/[id]" as={`/dag_block/${tip}`}>
                                    <a>{tip}</a>
                                </Link>
                            </li>
                        ))}
                        </ul>
                    </li>
                    <li>VDF: {data.vdf}</li>
                </ul>
            </Card.Body>
            <Card.Body>
            <Card.Title>Transactions:</Card.Title>
            <Table responsive variant="dark">
              <tr>
                <th>Timestamp</th>
                <th>Block</th>
                <th>Hash</th>
                <th>Value</th>
              </tr>
              {data.transactions.map((tx) => (
                  <tr key={tx._id}>
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                  <td>{`${tx.blockNumber} `}</td>
                  <td>
                    <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                        <a className="long-hash">{`${tx._id}`}</a>
                    </Link>
                  </td>
                  <td>{tx.value.toLocaleString()}</td>
                </tr>
              ))}
              {/* {error ? <li>Failed to load transactions</li> : ''} */}
          </Table>
          </Card.Body>
        </Card>
    </>
}
