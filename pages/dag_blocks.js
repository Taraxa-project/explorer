import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Table, Col, Row, Pagination, Form } from 'react-bootstrap';
import { useApiFromClient } from '../lib/api-client';
import DAG from '../components/DAG';

export default function Index() {
  const [maxLevel, setMaxLevel] = useState(null);
  const [level, setLevel] = useState(null);
  const [limit, setLimit] = useState(15);
  const [reverse, setReverse] = useState(true);
  const [diagram, setDiagram] = useState(true);

  let url = `/api/dag_blocks?limit=${limit}&reverse=${reverse}`;

  if (level !== null && !isNaN(level) && level > 0) {
    url += `&level=${level}`;
  }
  const { data } = useApiFromClient(url);

  if (data?.topLevel && maxLevel === null) {
    setMaxLevel(data.topLevel);
  }

  function updateDiagram(e) {
    let val = true;
    if (e.target.value === 'false') {
      val = false;
    }
    setDiagram(val);
  }

  function updatePagination(action, newReverse = null) {
    const currentReverse = newReverse !== null ? newReverse : reverse;

    switch (action) {
      case 'first':
        if (currentReverse) {
          setLevel(maxLevel);
        } else {
          setLevel(1);
        }
        break;
      case 'last':
        if (currentReverse) {
          setLevel(1);
        } else {
          setLevel(maxLevel);
        }
        break;
      case 'previous':
        if (currentReverse) {
          setLevel(Math.min(maxLevel, level + limit));
        } else {
          setLevel(Math.max(1, level - limit));
        }
        break;
      case 'next':
        if (currentReverse) {
          setLevel(Math.max(1, level - limit));
        } else {
          setLevel(Math.min(maxLevel, level + limit));
        }
        break;
    }
  }

  function updateLimit(e) {
    const num = e.target.value;
    setLimit(Number(num));
    updatePagination('first');
  }

  function updateQueryReverse(e) {
    let val = true;
    if (e.target.value === 'false') {
      val = false;
    }
    setReverse(val);
    updatePagination('first', val);
  }

  const blocks = data?.result?.blocks || [];
  const pbftBlocks = data?.result?.pbftBlocks || [];

  return (
    <>
      <Row>
        <Col xs="12" md="9">
          <h1>DAG Blocks</h1>
        </Col>
        <Col>
          <Form>
            <Form.Group>
              <Form.Control
                id="sortControl"
                size="sm"
                as="select"
                onChange={updateDiagram}
                value={diagram}
              >
                <option value={'true'}>Show diagram</option>
                <option value={'false'}>Hide diagram</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
        <Col style={{ paddingRight: 0, paddingLeft: 0 }}>
          <Form>
            <Form.Group>
              <Form.Control
                id="limitControl"
                size="sm"
                as="select"
                onChange={updateLimit}
                value={limit}
              >
                <option value={1}>1 level per page</option>
                <option value={5}>5 levels per page</option>
                <option value={10}>10 levels per page</option>
                <option value={15}>15 levels per page</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
        <Col>
          <Form>
            <Form.Group>
              <Form.Control
                id="sortControl"
                size="sm"
                as="select"
                onChange={updateQueryReverse}
                value={reverse}
              >
                <option value={'true'}>Newest first</option>
                <option value={'false'}>Oldest first</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      {diagram ? (
        <Row>
          <Col
            style={{
              paddingLeft: 5,
              paddingRight: 5,
              paddingTop: 5,
              paddingBottom: 0,
              margin: 0,
              backgroundColor: '#0f1517',
            }}
          >
            <DAG dagBlocks={blocks} reverse={reverse} pbftBlocks={pbftBlocks} />
          </Col>
        </Row>
      ) : (
        ''
      )}

      {maxLevel !== null && (
        <Pagination className="justify-content-center" style={{ padding: 10 }}>
          <Pagination.First onClick={() => updatePagination('first')} />
          <Pagination.Prev onClick={() => updatePagination('previous')} />
          <Pagination.Next onClick={() => updatePagination('next')} />
          <Pagination.Last onClick={() => updatePagination('last')} />
        </Pagination>
      )}

      <Card
        style={{ margin: 5, marginTop: diagram ? 10 : 0, marginBottom: 10 }}
        bg="dark"
        text="white"
      >
        <Table responsive variant="dark">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Period</th>
              <th>Hash</th>
              <th>Transactions</th>
            </tr>
          </thead>
          <tbody>
            {data
              ? blocks.map((block) => (
                  <tr key={block._id}>
                    <td>{new Date(block.timestamp).toLocaleString()}</td>
                    <td>{block.level}</td>
                    <td>{block.period}</td>
                    <td>
                      <Link href="/dag_block/[id]" as={`/dag_block/${block._id}`}>
                        <a className="long-hash">{`${block._id}`}</a>
                      </Link>
                    </td>
                    <td>{block.transactions.length}</td>
                  </tr>
                ))
              : ''}
          </tbody>
        </Table>
        {maxLevel !== null && (
          <Pagination className="justify-content-center" style={{ padding: 10 }}>
            <Pagination.First onClick={() => updatePagination('first')} />
            <Pagination.Prev onClick={() => updatePagination('previous')} />
            <Pagination.Next onClick={() => updatePagination('next')} />
            <Pagination.Last onClick={() => updatePagination('last')} />
          </Pagination>
        )}
      </Card>
    </>
  );
}
