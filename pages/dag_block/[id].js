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
       <h1>DAG Block</h1>
       <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            {/* <Card.Header>DAG Block {data._id}</Card.Header> */}
            <Card.Body>
                <ul>
                    <li>Hash: {data._id}</li>
                    <li>Level: {data.level}</li>
                    <li>Timestamp: {new Date(data.timestamp).toUTCString()}</li>
                    <li>Period Block: {data.period ? 'true' : 'false'}</li>
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
                    <li>Transactions: 
                        <ul>{data.transactions.map((tx) => (
                            <li key={tx._id}>Tx{' '}
                                <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                                    <a>{tx._id}</a>
                                </Link>
                            </li>
                        ))}
                        </ul>
                    </li>
                    <li>VDF: {data.vdf}</li>
                </ul>
            </Card.Body>
        </Card>
    </>
}
