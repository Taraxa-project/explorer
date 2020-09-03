import Link from 'next/link'

import config from 'config';
import mongoose from 'mongoose'
import Block from '../../models/block'
import Tx from '../../models/tx'

import {Container, Row, Col, Navbar, Nav, Button, Jumbotron, Card, ListGroup, ListGroupItem, Table} from 'react-bootstrap'

export async function getServerSideProps(context) {
    let props = {
        data: {}
    };
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
        const block = await Block.findOne({_id: context.query.id}).populate({
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

export default function BlockPage({data}) {
    return <>
        <h1>Block {data.number}</h1>
        <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            <Card.Body>
            <ul>
                <li>Timestamp: {new Date(data.timestamp).toUTCString()}</li>
                <li>Hash: {data._id}</li>

                <li>Author: {data.author}</li>
                <li>Extra Data: {data.extraData}</li>
                <li>Gas Limit: {data.gasLimit}</li>
                <li>Gas Used: {data.gasUsed}</li>
                <li>Logs Bloom: {data.logsBloom}</li>
                <li>Miner: <Link href="/address/[id]" as={`/address/${data.miner}`}>
                                <a>{`${data.miner}`}</a>
                            </Link></li>
                <li>Mix Hash: {data.mixHash}</li>
                <li>Nonce: {data.nonce}</li>
                <li>Parent Hash: <Link href="/block/[id]" as={`/block/${data.parentHash}`}>
                                <a>{`${data.parentHash}`}</a>
                            </Link></li>
                <li>Receipts Root: {data.receiptsRoot}</li>
                <li>SHA3 of Uncles: {data.sha3Uncles}</li>
                <li>Size: {data.size}</li>
                <li>State Root: {data.stateRoot}</li>
                <li>Total Difficulty: {data.totalDifficulty}</li>
                <li>Transactions: {data.transactions.length ? (
                    <ul>{data.transactions.map((tx) => (
                        <li key={tx._id}>
                            Tx <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                                <a>{`${tx._id}`}</a>
                            </Link>
                        </li>
                    ))}
                    </ul>
                ) : '[ ]'}
                </li>
                <li>Transactions Root: {data.transactionsRoot}</li>
                <li>Uncles: {data.uncles.length ? (
                    <ul>{data.uncles.map((uncle) => (
                        <li key={uncle}>{uncle}</li>
                    ))}
                    </ul>) : '[ ]'}
                </li>
            </ul>
            </Card.Body>
        </Card>    
    </>
}
