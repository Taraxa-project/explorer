import Link from 'next/link'

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/accounts?reverse=true', fetcher)

  return (
      <>
        <h1>Accounts</h1>
          <ul>
            {data ? data.map((account) => (
                <li key={account._id}>
                    <Link href="/address/[id]" as={`/address/${account._id}`}>
                        <a className="long-hash">{`${account._id}`}</a>
                    </Link>
                </li>
            )) : ''}
            {error ? <li>Failed to load accounts</li> : ''}
        </ul>
      </>
  )
}