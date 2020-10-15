import Link from 'next/link'
import {useState} from 'react'

import {getAddress} from '../../lib/db'

import {Form, Row, Col, Pagination, Card, Table} from 'react-bootstrap'

import { IoMdCheckmark, IoMdClose } from 'react-icons/io';

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export async function getServerSideProps(context) {
    const id = context.query.id;
    let skip = Number(context.query.skip) || 0;
    let limit = Number(context.query.limit) || 20;
    let sortOrder = context.query.reverse ? 1 : -1;

    let query = {id, skip, limit, sortOrder}

    let props = {
        data: {
            address: '',
            sent: 0,
            received: 0,
            mined: 0,
            fees: 0,
            balance: 0,
            transactions: [],
            count: 0
        }
    };
    try {
        const address = await getAddress(query)
        props.data = JSON.parse(JSON.stringify(address));

    } catch (e) {
        console.error('Error in Server Props: ' + e.message);
    }

    return {
      props, // will be passed to the page component as props
    }
}  

export default function AddressPage({data}) {
    const [limit, setLimit] = useState(20);
    const [skip, setSkip] = useState(0);
    const [reverse, setReverse] = useState(false);

    let query = `/api/address/${data.address}?limit=${limit}`;
    if (reverse) {
        query += '&reverse=true'
    }
    if (skip) {
        query += `&skip=${skip}`
    }

    const { data: newData, error } = useSwr(query, fetcher)
    if (newData) {
        data = newData;
    }

    if (error) {
        console.error(error)
    }

    const total = data?.count || 0;
    const transactions = data?.transactions || [];
    const pages = Math.ceil(total / limit);
    const page = skip / limit + 1;

    function updateQueryReverse(e) {
        let val = true;
        if (e.target.value === "false") {
        val = false;
        }
        setReverse(val);
    }

    function updateQuerySkip(e) {
        setSkip(Number(e))
    }
  
    return <>
    <Row>
          <Col sm="8" md="10">
          <h1>Address {data.address}</h1>
          </Col>
          <Col>
            <Form>
              <Form.Group>
                <Form.Control id="sortControl" size="sm" as="select" onChange={updateQueryReverse}>
                  <option value="false">Newest</option>
                  <option value="true">Oldest</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Col>
        </Row>
       
        <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
            <Card.Body>
                <Card.Title>
                    Balance: {(data.balance / 1e18).toFixed(6)} TARA
                </Card.Title>
                <ul>
                    <li>Received: {(data.received / 1e18).toFixed(6)} TARA</li>
                    <li>Sent: {(data.sent / 1e18).toFixed(6)} TARA</li>
                    <li>Mined: {(data.mined / 1e18).toFixed(6)} TARA</li>
                    <li>Fees: {(data.fees / 1e18).toFixed(6)} TARA</li>
                </ul>
            </Card.Body>
            <Card.Body>
            <Card.Title>Transactions:</Card.Title>
            <Table responsive variant="dark">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Block</th>
                        <th>Action</th>
                        <th>Status</th>
                        <th>Hash</th>
                        <th>Value</th>
                        <th>Fee</th>
                    </tr>
                </thead>
                <tbody>
                    {data.transactions.map((tx) => (
                    
                    <tr key={tx._id}>
                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    <td>{`${tx.blockNumber} `}</td>
                    <td>{data.address === tx.to ? 'Receive' : 'Send'}</td>
                    <td>{tx.status ? <IoMdCheckmark size={20}/> : <IoMdClose  size={25} color="red"/>}{tx.status}</td>
                    <td className="table-cell-overflow2">
                        <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                            <a className="long-hash">{`${tx._id}`}</a>
                        </Link>
                    </td>
                    <td>{(tx.value / 1e18).toFixed(6)} TARA</td>
                    <td>{(tx.gasUsed * tx.gasPrice / 1e18).toFixed(6)} TARA</td>
                    </tr>
                ))}
                </tbody>
          </Table>
          </Card.Body>
        </Card>

        {total > limit ?  (
            
            <Pagination className="justify-content-center" style={{padding: 10}}>
              {page < 2 ? '' : (
                <>
                <Pagination.First onClick={() => updateQuerySkip(0)}/>
                <Pagination.Prev onClick={() => updateQuerySkip((page - 2) * limit)}/>
                </>
              )}
              
              {page !== 1 ? (
                <Pagination.Item onClick={() => updateQuerySkip(0)}>{1}</Pagination.Item>
              ) : ''}

              {page > 4 ? (
                <>
                <Pagination.Ellipsis />
                </>
              ) : ''}
              

              {page - 2 > 1 ? (
                <Pagination.Item onClick={() => updateQuerySkip((page - 3) * limit)}>{page - 2}</Pagination.Item>
              ) : ''}
              {page - 1 > 1 ? (
                <Pagination.Item onClick={() => updateQuerySkip((page - 2) * limit)}>{page - 1}</Pagination.Item>
              ) : ''}
              <Pagination.Item active>{page}</Pagination.Item>
              {page + 1 < pages ? (
                <Pagination.Item onClick={() => updateQuerySkip(page * limit)}>{page + 1}</Pagination.Item>
              ) : ''}
              {page + 2 < pages ? (
                <Pagination.Item onClick={() => updateQuerySkip((page +1) * limit)}>{page + 2}</Pagination.Item>
              ) : ''}

              {pages > page + 2  ? (
                <>
                <Pagination.Ellipsis />
                </>
              ) : ''}

              {page !== pages ? (
                <Pagination.Item onClick={() => updateQuerySkip((pages - 1) * limit)}>{pages}</Pagination.Item>
              ) : ''}
              
              {page < pages ? (
                <>
                <Pagination.Next onClick={() => updateQuerySkip(page * limit)}/>
                <Pagination.Last onClick={() => updateQuerySkip((pages - 1) * limit)}/>
                </>
              ) : ''}
            </Pagination>
        ) : ''}  
    </>
}
