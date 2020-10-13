import Link from 'next/link'
import useSwr from 'swr'

import utils from 'web3-utils';

import {Card, Table, Col, Row, Pagination, Form} from 'react-bootstrap'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Search() {
    let search = "";
    if (typeof window !== "undefined") {
        search = window?.location?.search;
    }
    const params = new URLSearchParams(search);
    let queryString = params.get('query') || '';
    queryString = queryString.toLowerCase();

    let query = `/api/search?query=${queryString}`;

    const { data, error } = useSwr(query, fetcher)

    return (
        <>
        <h1>Search: {queryString}</h1>
        
        {data?.blocks?.length ? (
            <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            <Table responsive variant="dark">
                <thead>
                <tr>
                    <th>Block</th>
                    <th>Number</th>
                    <th>Hash</th>
                    <th>Transactions</th>
                </tr>
                </thead>
                <tbody>
                    {data?.blocks?.map((block) => (
                        <tr key={block._id}>
                        <td>{new Date(block.timestamp).toLocaleString()}</td>
                        <td>{`${block.number} `}</td>
                        <td>
                        <Link href="/block/[id]" as={`/block/${block._id}`}>
                            <a className="long-hash">{`${block._id}`}</a>
                        </Link>
                        </td>
                        <td>{block.transactions.length}</td>
                    </tr>
                    ))}
                </tbody>
            </Table>
            </Card>
        ) : ''}
        {data?.dagBlocks?.length ? (
            <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            <Table responsive variant="dark">
                <thead>
                <tr>
                    <th>DAG Block</th>
                    <th>Level</th>
                    <th>Hash</th>
                    <th>Transactions</th>
                </tr>
                </thead>
                <tbody>
                    {data?.dagBlocks?.map((block) => (
                        <tr key={block._id}>
                        <td>{new Date(block.timestamp).toLocaleString()}</td>
                        <td>{`${block.level} `}</td>
                        <td>
                        <Link href="/dag_block/[id]" as={`/dag_block/${block._id}`}>
                            <a className="long-hash">{`${block._id}`}</a>
                        </Link>
                        </td>
                        <td>{block.transactions.length}</td>
                    </tr>
                    ))}
                </tbody>
            </Table>
            </Card>
        ) : ''}
        {data?.txs?.length ? (
            <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            <Table responsive variant="dark">
                <thead>
                <tr>
                    <th>Transaction</th>
                    <th>Block Number</th>
                    <th>Hash</th>
                    <th>Value</th>
                </tr>
                </thead>
                <tbody>
                    {data?.txs?.map((tx) => (
                        <tr key={tx._id}>
                        <td>{new Date(tx.timestamp).toLocaleString()}</td>
                        <td>{`${tx.blockNumber} `}</td>
                        <td>
                        <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                            <a className="long-hash">{`${tx._id}`}</a>
                        </Link>
                        </td>
                        <td>{utils.fromWei(tx.value, 'ether')} TARA</td>
                    </tr>
                    ))}
                </tbody>
            </Table>
            </Card>
        ) : ''}
        </>
    )
}