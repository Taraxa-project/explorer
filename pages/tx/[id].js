import { useRouter } from 'next/router'
import useSwr from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function User() {
  const router = useRouter()
  const { data, error } = useSwr(`/api/tx/${router.query.id}`, fetcher)

  if (error) return <div>Failed to load tx</div>
  if (!data) return <div>Loading...</div>

  return <div>
       <h1>Tx {data._id}</h1>
       {new Date(data.timestamp).toGMTString()}
       <ul>
           <li>
           <Link href="/block/[id]" as={`/block/${data.blockHash}`}>
            <a>{`Block ${data.blockHash}`}</a>
          </Link>
           </li>
           <li>
            {`From ${data.from}`}
           </li>
           <li>
            {`To ${data.to}`}
           </li>
          
           <li>
            {`Gas ${data.gas}`}
           </li>
           <li>
            {`Gas Price ${data.gasPrice}`}
           </li>
           <li>
            {`Value ${data.value}`}
           </li>
       </ul>
  </div>
}
