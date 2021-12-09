import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Pagination, Table, Row, Col, Form } from 'react-bootstrap';
import { fetchApi } from '../lib/api-client';
import { useClientQuery } from '../lib/query';

export default function Index() {
  const limit = 100;
  const [cursor, setCursor] = useState(null);
  const [reverse, setReverse] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [blocks, setBlocks] = useState([]);

  const author = useClientQuery().get('author');

  let url = `/api/blocks?limit=${limit}&reverse=${String(reverse)}`;

  if (cursor) {
    url += `&cursorId=${cursor.id}&cursorTimestamp=${cursor.timestamp}`;
  }
  if (author) {
    url += `&author=${author.toLowerCase()}`;
  }

  const fetchBlocks = useCallback(async () => {
    if (hasMore) {
      const { data } = await fetchApi(url);
      const incomingBlocks = data?.result?.blocks || [];
      setBlocks((prevBlocks) => {
        if (incomingBlocks.length === 0) {
          setHasMore(false);
          return prevBlocks;
        }
        return prevBlocks.concat(incomingBlocks);
      });
    }
  }, [url, hasMore]);

  useEffect(() => fetchBlocks(), [fetchBlocks]);

  function updateCursor(e) {
    e.preventDefault();
    if (hasMore && blocks.length > 0) {
      const { _id: id, timestamp } = blocks[blocks.length - 1];
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
        setBlocks([]);
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
          <h1>Blocks</h1>
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
              <th>Number</th>
              <th>Hash</th>
              <th>Transactions</th>
            </tr>
          </thead>
          <tbody>
            {blocks
              ? blocks.map((block) => (
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
                ))
              : ''}
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
