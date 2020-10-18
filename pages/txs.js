import Link from 'next/link'
import {useState} from 'react'

import {Card, Table, Row, Col, Form, Pagination} from 'react-bootstrap'

import { IoMdCheckmark, IoMdClose } from 'react-icons/io';

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const [limit, setLimit] = useState(20);
  const [skip, setSkip] = useState(0);
  const [reverse, setReverse] = useState(true);

  let query = `/api/txs?limit=${limit}`;
  if (reverse) {
    query += '&reverse=true'
  }
  if (skip) {
    query += `&skip=${skip}`
  }

  const { data, error } = useSwr(query, fetcher)

  function updateQueryReverse(e) {
    let val = true;
    if (e.target.value === "false") {
      val = false;
    }
    setReverse(val);
  }

  function updateQuerySkip(val) {
    setSkip(Number(val))
  }

  const total = data?.total || 0;
  const txs = data?.result?.txs || [];
  const pages = Math.ceil(total / limit);
  const page = skip / limit + 1;

  return (
      <>
        <Row>
          <Col sm="8" md="10">
            <h1>Transactions</h1>
          </Col>
          <Col>
            <Form>
              <Form.Group>
                <Form.Control id="sortControl" size="sm" as="select" onChange={updateQueryReverse}>
                  <option value="true">Newest first</option>
                  <option value="false">Oldest first</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Col>
        </Row>
        <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
          <Table responsive variant="dark">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Block</th>
                  <th>Status</th>
                  <th>Hash</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
              {data ? txs.map((tx) => (
                  <tr key={tx._id}>
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                  <td>{`${tx.blockNumber} `}</td>
                  <td>{tx.status ? <IoMdCheckmark size={20}/> : <IoMdClose  size={25} color="red"/>}{tx.status}</td>
                  <td>
                    <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                        <a className="long-hash">{`${tx._id}`}</a>
                    </Link>
                  </td>
                  <td>{(tx.value / 1e18).toFixed(6)} TARA</td>
                </tr>
              )) : ''}
              </tbody>
          </Table>
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
  )
}