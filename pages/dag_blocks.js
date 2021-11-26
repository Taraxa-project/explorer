import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Table, Col, Row, Pagination } from 'react-bootstrap';
import { useApiFromClient } from '../lib/api-client';
import DAG from '../components/DAG';

const limit = 15;

export default function Index() {
  const [maxLevel, setMaxLevel] = useState(null);
  const [level, setLevel] = useState(null);
  let data;
  if (maxLevel === null && level === null) {
    const { data: topLevelData } = useApiFromClient('/api/dag_blocks?calculateLevel=true');
    if (topLevelData) {
      setMaxLevel(topLevelData.topLevel);
      setLevel(topLevelData.level);
    }
  } else {
    let url = `/api/dag_blocks?limit=${limit}`;

    if (level !== null && !isNaN(level) && level > 0) {
      url += `&level=${level}`;
    }
    const result = useApiFromClient(url);
    data = result.data;
  }

  function updatePagination(action) {
    switch (action) {
      case 'first':
        setLevel(maxLevel);
        break;
      case 'last':
        setLevel(limit);
        break;
      case 'previous':
        setLevel((currLevel) => Math.min(maxLevel, currLevel + limit));
        break;
      case 'next':
        setLevel((currLevel) => Math.max(limit, currLevel - limit));
        break;
    }
  }

  const blocks = data?.result?.blocks || [];
  const pbftBlocks = data?.result?.pbftBlocks || [];

  return (
    <>
      <Row>
        <Col xs="12" md="9">
          <h1>DAG Blocks</h1>
        </Col>
      </Row>
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
          <DAG dagBlocks={blocks} reverse={true} pbftBlocks={pbftBlocks} />
        </Col>
      </Row>
      {maxLevel !== null && (
        <Pagination className="justify-content-center" style={{ padding: 10 }}>
          <Pagination.First onClick={() => updatePagination('first')} />
          <Pagination.Prev onClick={() => updatePagination('previous')} />
          <Pagination.Next onClick={() => updatePagination('next')} />
          <Pagination.Last onClick={() => updatePagination('last')} />
        </Pagination>
      )}
      <Card style={{ margin: 5, marginTop: 10, marginBottom: 10 }} bg="dark" text="white">
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
            {data &&
              blocks.map((block) => (
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
              ))}
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
