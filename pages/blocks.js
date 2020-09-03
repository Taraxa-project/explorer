import Link from 'next/link'
import {Card, Table} from 'react-bootstrap'

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/blocks?reverse=true', fetcher)

  return (
      <>
        <h1>Recent Blocks</h1>
        <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
          <Table responsive variant="dark">
              <tr>
                <th>Timestamp</th>
                <th>Number</th>
                <th>Hash</th>
                <th>Transactions</th>
              </tr>
              {data ? data.map((block) => (
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
              )) : ''}
              {/* {error ? <li>Failed to load blocks</li> : ''} */}
            </Table>
          </Card>
      </>
  )
}