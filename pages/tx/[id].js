import Link from 'next/link'

import config from 'config';
import mongoose from 'mongoose'
import Tx from '../../models/tx'

export async function getServerSideProps(context) {
    let props = {
        data: {}
    };
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
        const tx = await Tx.findOne({_id: context.query.id}).lean();
        if (tx) {
            props.data = JSON.parse(JSON.stringify(tx));
        }
    } catch (e) {
        console.error('Error in Server Props: ' + e.message);
    }

    return {
      props, // will be passed to the page component as props
    }
}  

export default function TxPage({data}) {
  return <>
   
            <h1>Tx {data._id}</h1>
            {new Date(data.timestamp).toString()}
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
    </>
}
