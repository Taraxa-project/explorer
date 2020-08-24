import { useRouter } from 'next/router'
import useSwr from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function User() {
  const router = useRouter()
  const { data, error } = useSwr(`/api/block/${router.query.id}?fullTransactions=true`, fetcher)

  if (error) return <div>Failed to load block</div>
  if (!data) return <div>Loading...</div>

  return <div>
      <h1>Block {data._id}</h1>
      {new Date(data.timestamp).toGMTString()}
      <ul>
      {data.transactions.map((tx) => (
        <li key={tx._id}>
          <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
            <a>{`Tx ${tx._id}`}</a>
          </Link>
        </li>
      ))}
    </ul>
    </div>
}
