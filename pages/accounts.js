import Link from 'next/link'
import {Card, Table} from 'react-bootstrap'

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/accounts?reverse=true', fetcher)

  return (
      <>
        <h1>Top Recipients</h1>
        <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white">
          <Table responsive variant="dark">
            <tr>
              <th>Address</th>
              <th>Total Received</th>
            </tr>
            {data ? data.map((account) => (
                <tr key={account._id}>
                  <td>
                    <Link href="/address/[id]" as={`/address/${account._id}`}>
                      <a className="long-hash">{`${account._id}`}</a>
                    </Link>
                  </td>
                  <td>{account.receivedSum.toLocaleString()}</td>
                </tr>
            )) : ''}
            {/* {error ? <li>Failed to load accounts</li> : ''} */}
            </Table>
        </Card>
      </>
  )
}