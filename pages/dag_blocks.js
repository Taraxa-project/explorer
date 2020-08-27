import Link from 'next/link'

import useSwr from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/dag_blocks?reverse=true', fetcher)

  return (
      <>
        <h1>Recent DAG Blocks</h1>
          <ul>
            {data ? data.map((block) => (
                <li key={block._id}>
                  {`Block ${block.number} `}
                    <Link href="/dag_block/[id]" as={`/dag_block/${block._id}`}>
                        <a className="long-hash">{`${block._id}`}</a>
                    </Link>
                </li>
            )) : ''}
            {error ? <li>Failed to load blocks</li> : ''}
        </ul>
      </>
  )
}