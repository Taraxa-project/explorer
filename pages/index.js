import useSwr from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/blocks?reverse=true', fetcher)

  if (error) return <div>Failed to load blocks</div>
  if (!data) return <div>Loading...</div>

  return (
      <div>
          <h1>Recent Blocks</h1>
        <ul>
        {data.map((block) => (
            <li key={block._id}>
            <Link href="/block/[id]" as={`/block/${block._id}`}>
                <a>{`Block ${block.number} ${block._id}`}</a>
            </Link>
            </li>
        ))}
        </ul>
      </div>
    
  )
}
