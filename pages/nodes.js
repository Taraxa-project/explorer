import Link from "next/link";
import { useState } from "react";
import moment from "moment";
import { Card, Table, Container, Row, Col, Pagination } from "react-bootstrap";
import useSwr from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Nodes() {
  const limit = 20;
  const [skip, setSkip] = useState(0);
  const [week, setWeek] = useState(moment().isoWeek());
  const [year, setYear] = useState(moment().isoWeekYear());

  let query = `/api/nodes?limit=${limit}`;
  if (skip) {
    query += `&skip=${skip}`;
  }

  query += `&week=${week}`;
  query += `&year=${year}`;

  const { data } = useSwr(query, fetcher);

  function updateQuerySkip(val) {
    setSkip(Number(val));
  }

  const total = data?.total || 0;
  const nodes = data?.result?.nodes || [];
  const pages = Math.ceil(total / limit);
  const page = skip / limit + 1;

  const isThisWeek = moment().isoWeek() === week;
  const now = moment().isoWeekYear(year).isoWeek(week);
  const startOfWeek = now.startOf("week").format("MMMM Do");
  const endOfWeek = now.endOf("week").format("MMMM Do");

  return (
    <>
      <Container fluid={true}>
        <Row>
          <Col sm="8" md="10">
            <h1>
              Top nodes for Week {week} {year} ({startOfWeek} - {endOfWeek})
            </h1>
          </Col>
          <Col>
            <Pagination className="justify-content-end">
              <Pagination.Prev
                onClick={() => {
                  if (week === 1) {
                    setWeek(moment().isoWeeksInYear(year - 1));
                    setYear((year) => year - 1);
                    return;
                  }

                  setWeek((week) => week - 1);
                }}
              />
              <Pagination.Item disabled={true}>
                W{week} {year}
              </Pagination.Item>
              {!isThisWeek && (
                <Pagination.Next
                  onClick={() => {
                    if (week === moment().isoWeeksInYear(year)) {
                      setWeek(1);
                      setYear((year) => year + 1);
                      return;
                    }
                    setWeek((week) => week + 1);
                  }}
                />
              )}
            </Pagination>
          </Col>
        </Row>
      </Container>
      <Card
        style={{ margin: 5, marginTop: 0, marginBottom: 10 }}
        bg="dark"
        text="white"
      >
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
                    <td>{i + 1}</td>
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
          <p style={{ margin: 0, padding: "20px" }}>
            <strong>No data found for selected week.</strong>
          </p>
        )}
      </Card>

      {total > limit && (
        <Pagination className="justify-content-center" style={{ padding: 10 }}>
          {page >= 2 && (
            <>
              <Pagination.First onClick={() => updateQuerySkip(0)} />
              <Pagination.Prev
                onClick={() => updateQuerySkip((page - 2) * limit)}
              />
            </>
          )}

          {page !== 1 && (
            <Pagination.Item onClick={() => updateQuerySkip(0)}>
              {1}
            </Pagination.Item>
          )}

          {page > 4 && (
            <>
              <Pagination.Ellipsis />
            </>
          )}

          {page - 2 > 1 && (
            <Pagination.Item
              onClick={() => updateQuerySkip((page - 3) * limit)}
            >
              {page - 2}
            </Pagination.Item>
          )}
          {page - 1 > 1 && (
            <Pagination.Item
              onClick={() => updateQuerySkip((page - 2) * limit)}
            >
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
            <Pagination.Item
              onClick={() => updateQuerySkip((page + 1) * limit)}
            >
              {page + 2}
            </Pagination.Item>
          )}

          {pages > page + 2 && (
            <>
              <Pagination.Ellipsis />
            </>
          )}

          {page !== pages && (
            <Pagination.Item
              onClick={() => updateQuerySkip((pages - 1) * limit)}
            >
              {pages}
            </Pagination.Item>
          )}

          {page < pages && (
            <>
              <Pagination.Next onClick={() => updateQuerySkip(page * limit)} />
              <Pagination.Last
                onClick={() => updateQuerySkip((pages - 1) * limit)}
              />
            </>
          )}
        </Pagination>
      )}
    </>
  );
}
