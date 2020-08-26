import Link from 'next/link'

import config from 'config';
import mongoose from 'mongoose'
import Block from '../../models/block'
import Tx from '../../models/tx'

export async function getServerSideProps(context) {
    let props = {
        data: {}
    };
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
        const block = await Block.findOne({_id: context.query.id}).populate({
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

export default function BlockPage({data}) {
    return <>
       
            <h1>Block {data._id}</h1>
            {new Date(data.timestamp).toString()}
            <ul>
            {data.transactions.map((tx) => (
                <li key={tx._id}>
                    <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                        <a>{`Tx ${tx._id}`}</a>
                    </Link>
                </li>
            ))}
            </ul>
            
    </>
}
