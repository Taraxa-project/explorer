import React, { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Card, Table, Container, Row, Col, Pagination } from 'react-bootstrap';
import { useApiFromClient } from '../lib/api-client';

export default function Nodes() {
  const nowUTC = moment().utc();
  const limit = 20;
  const [skip, setSkip] = useState(0);
  const [[week, year], setWeekYear] = useState(() => [
    moment(nowUTC).utc().isoWeek(),
    moment(nowUTC).utc().isoWeekYear(),
  ]);
  const [displayLocal, setDisplayLocal] = useState(true);

  let url = `/api/nodes?limit=${limit}`;
  if (skip) {
    url += `&skip=${skip}`;
  }

  url += `&week=${week}`;
  url += `&year=${year}`;

  const { data } = useApiFromClient(url);

  function updateQuerySkip(val) {
    setSkip(Number(val));
  }

  const total = data?.total || 0;
  const nodes = data?.result?.nodes || [];
  const pages = Math.ceil(total / limit);
  const page = skip / limit + 1;

  const isThisWeek = moment(nowUTC).utc().isoWeek() === week;
  const currentWeekYear = moment(nowUTC).utc().isoWeekYear(year).isoWeek(week);
  const startOfWeek = moment(currentWeekYear).utc().startOf('week');
  const endOfWeek = moment(currentWeekYear).utc().endOf('week');

  let startOfWeekDisplay;
  let endOfWeekDisplay;
  let weekDisplay;
  let yearDisplay;
  let tzOffset;
  let tzHours;
  let tzMinutes;
  let tzString;

  if (displayLocal) {
    startOfWeekDisplay = moment(startOfWeek).local().format('MMMM Do YYYY, h:mm:ss');
    endOfWeekDisplay = moment(endOfWeek).local().format('MMMM Do YYYY, h:mm:ss');
    weekDisplay = moment(endOfWeek).local().week();
    yearDisplay = moment(endOfWeek).local().weekYear();
    tzOffset = moment(endOfWeek).local().utcOffset();
    tzHours = String(Math.abs(Math.floor(tzOffset / 60))).padStart(2, '0');
    tzMinutes = String(Math.abs(tzOffset % 60)).padStart(2, '0');
    tzString = `UTC ${tzOffset >= 0 ? '+' : '-'}${tzHours}:${tzMinutes}`;
  } else {
    startOfWeekDisplay = moment(startOfWeek).utc().format('MMMM Do');
    endOfWeekDisplay = moment(endOfWeek).utc().format('MMMM Do');
    weekDisplay = moment(endOfWeek).utc().isoWeek();
    yearDisplay = moment(endOfWeek).utc().isoWeekYear();
  }

  return (
    <>
      <Container fluid={true}>
        <Row>
          <Col sm="8" md="10">
            <h1>
              Top nodes for Week {weekDisplay} {yearDisplay} ({startOfWeekDisplay} -{' '}
              {endOfWeekDisplay})
            </h1>
            <p>
              All times in {displayLocal ? `local time (${tzString})` : 'UTC'}.{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setDisplayLocal((prev) => !prev);
                }}
              >
                Switch to {displayLocal ? 'UTC' : 'local time'}
              </a>
            </p>
          </Col>
          <Col>
            <Pagination className="justify-content-end">
              <Pagination.Prev
                onClick={() => {
                  setWeekYear(([currWeek, currYear]) =>
                    currWeek === 1
                      ? [moment().isoWeeksInYear(currYear - 1), currYear - 1]
                      : [currWeek - 1, currYear],
                  );
                }}
              />
              <Pagination.Item disabled={true}>
                W{weekDisplay} {yearDisplay}
              </Pagination.Item>
              {!isThisWeek && (
                <Pagination.Next
                  onClick={() => {
                    setWeekYear(([currWeek, currYear]) =>
                      currWeek === moment().isoWeeksInYear(currYear)
                        ? [1, currYear + 1]
                        : [currWeek + 1, currYear],
                    );
                  }}
                />
              )}
            </Pagination>
          </Col>
        </Row>
      </Container>
      <Card style={{ margin: 5, marginTop: 0, marginBottom: 10 }} bg="dark" text="white">
        {total > 0 && (
          <Table responsive variant="dark">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Node Address</th>
                <th># blocks produced</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                nodes.map((node, i) => (
                  <tr key={node._id}>
                    <td>{skip + i + 1}</td>
                    <td>
                      <Link href="/address/[id]" as={`/address/${node._id}`}>
                        <a className="long-hash">{`${node._id}`}</a>
                      </Link>
                    </td>
                    <td>{node.count}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
        {total === 0 && (
          <p style={{ margin: 0, padding: '20px' }}>
            <strong>No data found for selected week.</strong>
          </p>
        )}
      </Card>

      {total > limit && (
        <Pagination className="justify-content-center" style={{ padding: 10 }}>
          {page >= 2 && (
            <>
              <Pagination.First onClick={() => updateQuerySkip(0)} />
              <Pagination.Prev onClick={() => updateQuerySkip((page - 2) * limit)} />
            </>
          )}

          {page !== 1 && <Pagination.Item onClick={() => updateQuerySkip(0)}>{1}</Pagination.Item>}

          {page > 4 && (
            <>
              <Pagination.Ellipsis />
            </>
          )}

          {page - 2 > 1 && (
            <Pagination.Item onClick={() => updateQuerySkip((page - 3) * limit)}>
              {page - 2}
            </Pagination.Item>
          )}
          {page - 1 > 1 && (
            <Pagination.Item onClick={() => updateQuerySkip((page - 2) * limit)}>
              {page - 1}
            </Pagination.Item>
          )}
          <Pagination.Item active>{page}</Pagination.Item>
          {page + 1 < pages && (
            <Pagination.Item onClick={() => updateQuerySkip(page * limit)}>
              {page + 1}
            </Pagination.Item>
          )}
          {page + 2 < pages && (
            <Pagination.Item onClick={() => updateQuerySkip((page + 1) * limit)}>
              {page + 2}
            </Pagination.Item>
          )}

          {pages > page + 2 && (
            <>
              <Pagination.Ellipsis />
            </>
          )}

          {page !== pages && (
            <Pagination.Item onClick={() => updateQuerySkip((pages - 1) * limit)}>
              {pages}
            </Pagination.Item>
          )}

          {page < pages && (
            <>
              <Pagination.Next onClick={() => updateQuerySkip(page * limit)} />
              <Pagination.Last onClick={() => updateQuerySkip((pages - 1) * limit)} />
            </>
          )}
        </Pagination>
      )}
    </>
  );
}
