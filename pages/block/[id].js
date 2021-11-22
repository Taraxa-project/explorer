import React from 'react';
import Link from 'next/link';
import config from 'config';
import mongoose from 'mongoose';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import { Accordion, Button, Card, Table } from 'react-bootstrap';
import Block from '../../models/block';

export async function getServerSideProps(context) {
  let props = {
    data: {},
  };
  try {
    mongoose.connection._readyState ||
      (await mongoose.connect(config.mongo.uri, config.mongo.options));
    const block = await Block.findOne({ _id: context.query.id })
      .populate({
        path: 'transactions',
        // perDocumentLimit: 100
      })
      .lean();
    if (block) {
      props.data = JSON.parse(JSON.stringify(block));
    }
  } catch (e) {
    console.error(`Error in Server Props: ${e.message}`);
  }

  return {
    props, // will be passed to the page component as props
  };
}

export default function BlockPage({ data }) {
  return (
    <>
      <h1>Block {data._id}</h1>
      <Accordion>
        <Card style={{ margin: 5, marginTop: 0, marginBottom: 10 }} bg="dark" text="white">
          <Card.Body>
            <Card.Title>{new Date(data.timestamp).toUTCString()}</Card.Title>
            <ul>
              <li>Block Number: {data.number}</li>

              <li>Gas Limit: {data.gasLimit}</li>
              <li>Gas Used: {data.gasUsed}</li>
              <li>Block Reward: {(data.reward / 1e18).toFixed(6)} TARA</li>
              <li>
                Author:{' '}
                <Link href="/address/[id]" as={`/address/${data.author}`}>
                  <a>{`${data.author}`}</a>
                </Link>
              </li>
              <li>Nonce: {data.nonce}</li>
              <li>
                Parent:{' '}
                <Link href="/block/[id]" as={`/block/${data.parentHash}`}>
                  <a>{`${data.parentHash}`}</a>
                </Link>
              </li>
              <li>Size: {data.size}</li>
              <li>
                <Accordion.Toggle as={Button} variant="light" eventKey="0">
                  Details
                </Accordion.Toggle>
              </li>
            </ul>
            <Accordion.Collapse eventKey="0">
              <ul>
                <li>Extra Data: {data.extraData}</li>
                <li>Logs Bloom: {data.logsBloom}</li>
                <li>Mix Hash: {data.mixHash}</li>
                <li>Receipts Root: {data.receiptsRoot}</li>
                <li>State Root: {data.stateRoot}</li>
                <li>Total Difficulty: {data.totalDifficulty}</li>
                <li>Transactions Root: {data.transactionsRoot}</li>
                <li>
                  Uncles:{' '}
                  {data.uncles?.length ? (
                    <ul>
                      {data.uncles.map((uncle) => (
                        <li key={uncle}>{uncle}</li>
                      ))}
                    </ul>
                  ) : (
                    '[ ]'
                  )}
                </li>
                <li>Uncles Hash: {data.sha3Uncles}</li>
              </ul>
            </Accordion.Collapse>
          </Card.Body>
          <Card.Body>
            <Card.Title>Transactions:</Card.Title>
            <Table responsive variant="dark">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Status</th>
                  <th>Hash</th>
                  <th>To</th>
                  <th>From</th>
                  <th>Value</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions?.map((tx, index) => (
                  <tr key={tx._id}>
                    <td>{index + 1}</td>
                    <td>
                      {tx.status ? (
                        <IoMdCheckmark size={20} />
                      ) : (
                        <IoMdClose size={25} color="red" />
                      )}
                      {tx.status}
                    </td>
                    <td className="table-cell-overflow2">
                      <Link href="/tx/[id]" as={`/tx/${tx._id}`}>
                        <a className="long-hash">{`${tx._id}`}</a>
                      </Link>
                    </td>
                    <td className="table-cell-overflow">
                      {tx.to ? (
                        <Link href="/address/[id]" as={`/address/${tx.to}`}>
                          <a className="long-hash">{`${tx.to}`}</a>
                        </Link>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="table-cell-overflow">
                      {tx.from ? (
                        <Link href="/address/[id]" as={`/address/${tx.from}`}>
                          <a className="long-hash">{`${tx.from}`}</a>
                        </Link>
                      ) : (
                        ''
                      )}
                    </td>
                    <td>{(tx.value / 1e18).toFixed(6)} TARA</td>
                    <td>{((tx.gasUsed * tx.gasPrice) / 1e18).toFixed(6)} TARA</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Accordion>
    </>
  );
}
