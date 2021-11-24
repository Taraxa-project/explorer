import React from 'react';
import Link from 'next/link';
import { Card, Table } from 'react-bootstrap';
import { useApiFromServer } from '../lib/api-client';

export async function getServerSideProps(context) {
  const apiGet = useApiFromServer(context);
  const { query } = context.query;
  if (!query) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const searchQuery = query.toLowerCase();
  const { data, error, status } = await apiGet(`/api/search?query=${searchQuery}`);
  return {
    props: { data, error, status, searchQuery },
  };
}

export default function Search({ data, error, status, searchQuery }) {
  if (error) {
    if (status === 400) {
      return <h1>Invalid search parameters. Please enter a number, an address, or a hash.</h1>;
    } else {
      return <h1>An error occured while fetching your search results. Please try again.</h1>;
    }
  }

  if (!data?.blocks?.length && !data?.dagBlocks?.length && !data?.txs?.length) {
    return <h1>No results found for: {searchQuery}</h1>;
  }

  return (
    <>
      <h1>Search: {searchQuery}</h1>
      {data?.blocks?.length ? (
        <Card style={{ margin: 5, marginTop: 0, marginBottom: 10 }} bg="dark" text="white">
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
      ) : (
        ''
      )}
      {data?.dagBlocks?.length ? (
        <Card style={{ margin: 5, marginTop: 0, marginBottom: 10 }} bg="dark" text="white">
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
      ) : (
        ''
      )}
      {data?.txs?.length ? (
        <Card style={{ margin: 5, marginTop: 0, marginBottom: 10 }} bg="dark" text="white">
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
                  <td>{(tx.value / 1e18).toFixed(6)} TARA</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        ''
      )}
    </>
  );
}
