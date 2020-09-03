import Link from 'next/link'

import config from 'config';
import mongoose from 'mongoose'
import Tx from '../../models/tx'

import {Container, Row, Col, Navbar, Nav, Button, Jumbotron, Card, ListGroup, ListGroupItem, Table} from 'react-bootstrap'

export async function getServerSideProps(context) {
    let props = {
        data: {}
    };
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
        const tx = await Tx.findOne({_id: context.query.id}).lean();
        if (tx) {
            props.data = JSON.parse(JSON.stringify(tx));
        }
    } catch (e) {
        console.error('Error in Server Props: ' + e.message);
    }

    return {
      props, // will be passed to the page component as props
    }
}  

export default function TxPage({data}) {
  return <>
    <h1>Tx {data._id}</h1>
            <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            {/* <Card.Header>Tx {data._id}</Card.Header> */}
            <Card.Body>
                

                <ul>
                    <li>
                        Timestamp {new Date(data.timestamp).toLocaleString()}
                    </li>
                    <li>
                        Block <Link href="/block/[id]" as={`/block/${data.blockHash}`}>
                            <a>{`${data.blockHash}`}</a>
                        </Link>
                    </li>
                    {data.from ? (<li>From{' '}
                        <Link href="/address/[id]" as={`/address/${data.to}`}>
                            <a>{`${data.from}`}</a>
                        </Link>
                    </li>) : ''}
                    <li>To{' '}
                        <Link href="/address/[id]" as={`/address/${data.to}`}>
                            <a>{`${data.to}`}</a>
                        </Link>
                    </li>
                    
                    <li>
                        {`Gas ${data.gas}`}
                    </li>
                    <li>
                        {`Gas Price ${data.gasPrice}`}
                    </li>
                    <li>
                        {`Value ${data.value.toLocaleString()}`}
                    </li>
                </ul>
            </Card.Body>
        </Card>
    </>
}
