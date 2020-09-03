import Link from 'next/link'
import {Card, Table} from 'react-bootstrap'

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/txs?reverse=true', fetcher)

  return (
      <>
        <h1>Recent Transactions</h1>
        <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
          <Table responsive variant="dark">
              <tr>
                <th>Timestamp</th>
                <th>Block</th>
                <th>Hash</th>
                <th>Value</th>
              </tr>
              {data ? data.map((tx) => (
                  <tr key={tx._id}>
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                  <td>{`${tx.blockNumber} `}</td>
                  <td>
                    <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                        <a className="long-hash">{`${tx._id}`}</a>
                    </Link>
                  </td>
                  <td>{tx.value.toLocaleString()}</td>
                </tr>
              )) : ''}
              {/* {error ? <li>Failed to load transactions</li> : ''} */}
          </Table>
        </Card>
      </>
  )
}