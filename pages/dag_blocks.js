import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Table, Col, Row, Pagination, Form } from 'react-bootstrap';
import useSwr from 'swr';
import DAG from '../components/DAG';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Index() {
  const [limit, setLimit] = useState(20);
  const [skip, setSkip] = useState(0);
  const [reverse, setReverse] = useState(true);
  const [diagram, setDiagram] = useState(true);

  let query = `/api/dag_blocks?limit=${limit}`;
  if (reverse) {
    query += '&reverse=true';
  }
  if (skip) {
    query += `&skip=${skip}`;
  }

  const { data } = useSwr(query, fetcher);

  function updateQueryReverse(e) {
    let val = true;
    if (e.target.value === 'false') {
      val = false;
    }
    setReverse(val);
  }

  function updateDiagram(e) {
    let val = true;
    if (e.target.value === 'false') {
      val = false;
    }
    setDiagram(val);
  }

  function updateQuerySkip(num) {
    setSkip(Number(num));
  }

  function updateLimit(e) {
    const num = e.target.value;
    setLimit(Number(num));
  }

  const total = data?.total || 0;
  const blocks = data?.result?.blocks || [];
  const pbftBlocks = data?.result?.pbftBlocks || [];
  const pages = Math.ceil(total / limit);
  const page = skip / limit + 1;

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
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={150}>150 per page</option>
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

      {total > limit ? (
        <Pagination className="justify-content-center" style={{ padding: 10 }}>
          {page < 2 ? (
            ''
          ) : (
            <>
              <Pagination.First onClick={() => updateQuerySkip(0)} />
              <Pagination.Prev onClick={() => updateQuerySkip((page - 2) * limit)} />
            </>
          )}

          {page !== 1 ? (
            <Pagination.Item onClick={() => updateQuerySkip(0)}>{1}</Pagination.Item>
          ) : (
            ''
          )}

          {page > 4 ? (
            <>
              <Pagination.Ellipsis />
            </>
          ) : (
            ''
          )}

          {page - 2 > 1 ? (
            <Pagination.Item onClick={() => updateQuerySkip((page - 3) * limit)}>
              {page - 2}
            </Pagination.Item>
          ) : (
            ''
          )}
          {page - 1 > 1 ? (
            <Pagination.Item onClick={() => updateQuerySkip((page - 2) * limit)}>
              {page - 1}
            </Pagination.Item>
          ) : (
            ''
          )}
          <Pagination.Item active>{page}</Pagination.Item>
          {page + 1 < pages ? (
            <Pagination.Item onClick={() => updateQuerySkip(page * limit)}>
              {page + 1}
            </Pagination.Item>
          ) : (
            ''
          )}
          {page + 2 < pages ? (
            <Pagination.Item onClick={() => updateQuerySkip((page + 1) * limit)}>
              {page + 2}
            </Pagination.Item>
          ) : (
            ''
          )}

          {pages > page + 2 ? (
            <>
              <Pagination.Ellipsis />
            </>
          ) : (
            ''
          )}

          {page !== pages ? (
            <Pagination.Item onClick={() => updateQuerySkip((pages - 1) * limit)}>
              {pages}
            </Pagination.Item>
          ) : (
            ''
          )}

          {page < pages ? (
            <>
              <Pagination.Next onClick={() => updateQuerySkip(page * limit)} />
              <Pagination.Last onClick={() => updateQuerySkip((pages - 1) * limit)} />
            </>
          ) : (
            ''
          )}
        </Pagination>
      ) : (
        ''
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
      </Card>

      {total > limit ? (
        <Pagination className="justify-content-center" style={{ padding: 10 }}>
          {page < 2 ? (
            ''
          ) : (
            <>
              <Pagination.First onClick={() => updateQuerySkip(0)} />
              <Pagination.Prev onClick={() => updateQuerySkip((page - 2) * limit)} />
            </>
          )}

          {page !== 1 ? (
            <Pagination.Item onClick={() => updateQuerySkip(0)}>{1}</Pagination.Item>
          ) : (
            ''
          )}

          {page > 4 ? (
            <>
              <Pagination.Ellipsis />
            </>
          ) : (
            ''
          )}

          {page - 2 > 1 ? (
            <Pagination.Item onClick={() => updateQuerySkip((page - 3) * limit)}>
              {page - 2}
            </Pagination.Item>
          ) : (
            ''
          )}
          {page - 1 > 1 ? (
            <Pagination.Item onClick={() => updateQuerySkip((page - 2) * limit)}>
              {page - 1}
            </Pagination.Item>
          ) : (
            ''
          )}
          <Pagination.Item active>{page}</Pagination.Item>
          {page + 1 < pages ? (
            <Pagination.Item onClick={() => updateQuerySkip(page * limit)}>
              {page + 1}
            </Pagination.Item>
          ) : (
            ''
          )}
          {page + 2 < pages ? (
            <Pagination.Item onClick={() => updateQuerySkip((page + 1) * limit)}>
              {page + 2}
            </Pagination.Item>
          ) : (
            ''
          )}

          {pages > page + 2 ? (
            <>
              <Pagination.Ellipsis />
            </>
          ) : (
            ''
          )}

          {page !== pages ? (
            <Pagination.Item onClick={() => updateQuerySkip((pages - 1) * limit)}>
              {pages}
            </Pagination.Item>
          ) : (
            ''
          )}

          {page < pages ? (
            <>
              <Pagination.Next onClick={() => updateQuerySkip(page * limit)} />
              <Pagination.Last onClick={() => updateQuerySkip((pages - 1) * limit)} />
            </>
          ) : (
            ''
          )}
        </Pagination>
      ) : (
        ''
      )}
    </>
  );
}
