import Link from 'next/link'

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/blocks?reverse=true', fetcher)

  return (
      <>
        <h1>Recent Blocks</h1>
          <ul>
            {data ? data.map((block) => (
                <li key={block._id}>
                  {`Block ${block.number} `}
                    <Link href="/block/[id]" as={`/block/${block._id}`}>
                        <a className="long-hash">{`${block._id}`}</a>
                    </Link>
                </li>
            )) : ''}
            {error ? <li>Failed to load blocks</li> : ''}
        </ul>
      </>
  )
}