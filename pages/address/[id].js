import Link from 'next/link'

import config from 'config';
import mongoose from 'mongoose'
import DAGBlock from '../../models/dag_block'
import Tx from '../../models/tx'

export async function getServerSideProps(context) {
    const id = context.query.id;
    let props = {
        data: {
            address: '',
            balance: 0,
            transactions: []
        }
    };
    try {
        mongoose.connection._readyState || await mongoose.connect(config.mongo.uri, config.mongo.options);
        const activity = await Promise.all([
            Tx.aggregate([
                {$match: {to: id}},
                {$group: {_id: id, value: {$sum: '$value'}}}
            ]),
            Tx.aggregate([
                {$match: {from: id}},
                {$group: {_id: id, value: {$sum: '$value'}}}
            ]),
            Tx.find({
                $or: [{from: id}, {to: id}]
            })
                .sort({timestamp: -1})
                .limit(20)
        ]);
    
        const received = activity[0][0];
        const sent = activity[1][0];
        const transactions = activity[2];
        let balance = 0;
        let totalSent = 0;
        let totalRecieved = 0;
        if (received) {
            totalRecieved = received.value;
        }
        if (sent) {
            totalSent = totalSent + sent.value;
        }
        props.data = JSON.parse(JSON.stringify({
            address: context.query.id,
            sent: sent.value,
            received: received.value,
            balance: totalRecieved - totalSent,
            transactions
        }));

    } catch (e) {
        console.error('Error in Server Props: ' + e.message);
    }

    return {
      props, // will be passed to the page component as props
    }
}  

export default function AddressPage({data}) {
    return <>
       
            <h1>Address {data.address}</h1>
            <ul>
                <li>Balance: {data.balance.toLocaleString()}</li>
                <li>Recent Transactions: 
                    <ul>{data.transactions.map((tx) => (
                        <li key={tx._id}>
                            <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                                <a>{`Tx ${tx._id}`}</a>
                            </Link>
                        </li>
                    ))}
                    </ul>
                </li>
            </ul>
            
    </>
}
