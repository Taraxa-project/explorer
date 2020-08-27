import Link from 'next/link'

import config from 'config';
import mongoose from 'mongoose'
import DAGBlock from '../../models/dag_block'
import Tx from '../../models/tx'

export async function getServerSideProps(context) {
    let props = {
        data: {}
    };
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
        const block = await DAGBlock.findOne({_id: context.query.id}).populate({
            path: 'transactions',
            perDocumentLimit: 100
        }).lean();
        if (block) {
            props.data = JSON.parse(JSON.stringify(block));
        }
    } catch (e) {
        console.error('Error in Server Props: ' + e.message);
    }

    return {
      props, // will be passed to the page component as props
    }
}  

export default function DagBlockPage({data}) {
    return <>
       
            <h1>DAG Block </h1>
            <ul>
                <li>Timestamp: {new Date(data.timestamp).toUTCString()}</li>
                <li>Hash: {data._id}</li>

                <li>Level: {data.level}</li>
                <li>Period: {data.period}</li>
                <li>Pivot: {data.pivot}</li>
                <li>Sender: {data.sender}</li>
                <li>Sig: {data.sig}</li>
                <li>Tips: 
                    <ul>{data.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                    ))}
                    </ul>
                </li>
                <li>Transactions: 
                    <ul>{data.transactions.map((tx) => (
                        <li key={tx._id}>
                            <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                                <a>{`Tx ${tx._id}`}</a>
                            </Link>
                        </li>
                    ))}
                    </ul>
                </li>
                <li>VDF: {data.vdf}</li>
            </ul>
            
    </>
}
