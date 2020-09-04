import Link from 'next/link'

import config from 'config';
import mongoose from 'mongoose'
import Tx from '../../models/tx'
import DagBlock from '../../models/dag_block'

import {Container, Row, Col, Navbar, Nav, Button, Jumbotron, Card, ListGroup, ListGroupItem, Table} from 'react-bootstrap'

export async function getServerSideProps(context) {
    let props = {
        tx: {},
        dags: []
    };
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
        const tx = await Tx.findOne({_id: context.query.id}).lean();
        if (tx) {
            props.tx = JSON.parse(JSON.stringify(tx));
            const dags = await DagBlock.find({transactions: tx._id}).sort({timestamp: 1}).lean();
            props.dags = JSON.parse(JSON.stringify(dags));
        }
    } catch (e) {
        console.error('Error in Server Props: ' + e.message);
    }

    return {
      props, // will be passed to the page component as props
    }
}  

export default function TxPage({tx, dags}) {
  return <>
    <h1>Tx {tx._id}</h1>
            <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            <Card.Body>
                <ul>
                    <li>
                        Timestamp {new Date(tx.timestamp).toLocaleString()}
                    </li>
                    <li>
                        Block <Link href="/block/[id]" as={`/block/${tx.blockHash}`}>
                            <a>{`${tx.blockHash}`}</a>
                        </Link>
                    </li>
                    {tx.from ? (<li>From{' '}
                        <Link href="/address/[id]" as={`/address/${tx.to}`}>
                            <a>{`${tx.from}`}</a>
                        </Link>
                    </li>) : ''}
                    <li>To{' '}
                        <Link href="/address/[id]" as={`/address/${tx.to}`}>
                            <a>{`${tx.to}`}</a>
                        </Link>
                    </li>
                    
                    <li>
                        {`Gas ${tx.gas}`}
                    </li>
                    <li>
                        {`Gas Price ${tx.gasPrice}`}
                    </li>
                    <li>
                        {`Value ${tx.value.toLocaleString()}`}
                    </li>
                </ul>
            </Card.Body>
            <Card.Body>
            <Card.Title>DAG Blocks:</Card.Title>
            <Table responsive variant="dark">
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Hash</th>
              </tr>
              {dags.map((dagBlock) => (
                  <tr key={dagBlock._id}>
                  <td>{new Date(dagBlock.timestamp).toLocaleString()}</td>
                  <td>{`${dagBlock.level} `}</td>
                  <td>
                    <Link href="/dag_block/[id]" as={`/dag_block/${dagBlock._id}`}>
                        <a className="long-hash">{`${dagBlock._id}`}</a>
                    </Link>
                  </td>
                </tr>
              ))}
              {/* {error ? <li>Failed to load transactions</li> : ''} */}
          </Table>
          </Card.Body>
        </Card>
    </>
}
