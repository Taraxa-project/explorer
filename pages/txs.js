import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Table, Row, Col, Form, Pagination } from 'react-bootstrap';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import { fetchApi } from '../lib/api-client';
import { useClientQuery } from '../lib/query';

export default function Index() {
  const limit = 100;
  const [cursor, setCursor] = useState(null);
  const [reverse, setReverse] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const address = useClientQuery().get('address');

  let url = `/api/txs?limit=${limit}&reverse=${String(reverse)}`;
  if (address) {
    url += `&address=${address.toLowerCase()}`;
  }
  if (cursor) {
    url += `&cursorId=${cursor.id}&cursorTimestamp=${cursor.timestamp}`;
  }

  const fetchTxs = useCallback(async () => {
    if (hasMore) {
      const { data } = await fetchApi(url);
      const incomingTransactions = data?.result?.txs || [];
      setTransactions((prevTransactions) => {
        if (incomingTransactions.length === 0) {
          setHasMore(false);
          return prevTransactions;
        }
        return prevTransactions.concat(incomingTransactions);
      });
    }
  }, [url, hasMore]);

  useEffect(() => fetchTxs(), [fetchTxs]);

  function updateCursor(e) {
    e.preventDefault();
    if (hasMore && transactions.length > 0) {
      const { _id: id, timestamp } = transactions[transactions.length - 1];
      setCursor({ id, timestamp });
    }
  }

  function updateQueryReverse(e) {
    let val = true;
    if (e.target.value === 'false') {
      val = false;
    }
    setReverse((prevVal) => {
      if (prevVal !== val) {
        setTransactions([]);
        setCursor(null);
        setHasMore(true);
      }
      return val;
    });
  }

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
      <Card style={{ margin: 5, marginTop: 0, marginBottom: 10 }} bg="dark" text="white">
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
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{new Date(tx.timestamp).toLocaleString()}</td>
                <td>{`${tx.blockNumber} `}</td>
                <td>
                  {tx.status ? <IoMdCheckmark size={20} /> : <IoMdClose size={25} color="red" />}
                  {tx.status}
                </td>
                <td>
                  <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                    <a className="long-hash">{`${tx._id}`}</a>
                  </Link>
                </td>
                <td>{(tx.value / 1e18).toFixed(6)} TARA</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      {hasMore && (
        <Pagination className="justify-content-center" style={{ padding: 10 }}>
          <Pagination.Item onClick={updateCursor}>show more...</Pagination.Item>
        </Pagination>
      )}
    </>
  );
}
