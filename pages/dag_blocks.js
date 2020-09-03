import Link from 'next/link'
import {Card, Table} from 'react-bootstrap'

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/dag_blocks?reverse=true', fetcher)

  return (
      <>
      <h1>Recent DAG Blocks</h1>
        <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
              <Table responsive variant="dark">
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Period</th>
                  <th>Hash</th>
                  <th>Transactions</th>
                </tr>
                {data ? data.map((block) => (
                    <tr key={block._id}>
                      <td>{new Date(block.timestamp).toLocaleString()}</td>
                      <td>{`${block.level} `}</td>
                      <td>{`${block.period ? 'true' : ''} `}</td>
                      <td>
                        <Link href="/dag_block/[id]" as={`/dag_block/${block._id}`}>
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