import Link from 'next/link'

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/txs?reverse=true', fetcher)

  return (
      <>
        <h1>Recent Transactions</h1>
        <ul>
            {data ? data.map((tx) => (
                <li key={tx._id}>
                <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                    <a>{`Tx ${tx._id}`}</a>
                </Link>
                </li>
            )) : ''}
            {error ? <li>Failed to load transactions</li> : ''}
        </ul>
      </>
  )
}