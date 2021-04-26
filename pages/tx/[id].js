import Link from "next/link";

import config from "config";
import mongoose from "mongoose";
import Tx from "../../models/tx";
import DagBlock from "../../models/dag_block";

import { Card, Table } from "react-bootstrap";

import abiDecoder from "abi-decoder";

import RepresentationABI from "../../contracts/Representation.abi.json";
import RecordsRepositoryABI from "../../contracts/RecordsRepository.abi.json";

abiDecoder.addABI(RecordsRepositoryABI);
abiDecoder.addABI(RepresentationABI);

export async function getServerSideProps(context) {
  let props = {
    tx: {},
    dags: [],
  };
  try {
    mongoose.connection._readyState ||
      (await mongoose.connect(config.mongo.uri, config.mongo.options));
    const tx = await Tx.findOne({ _id: context.query.id }).lean();
    if (tx) {
      props.tx = JSON.parse(JSON.stringify(tx));
      const dags = await DagBlock.find({ transactions: tx._id })
        .sort({ timestamp: 1 })
        .lean();
      props.dags = JSON.parse(JSON.stringify(dags));
    }
  } catch (e) {
    console.error("Error in Server Props: " + e.message);
  }

  return {
    props, // will be passed to the page component as props
  };
}

export default function TxPage({ tx, dags }) {
  let decodedData = {};
  if (tx.input) {
    try {
      decodedData = abiDecoder.decodeMethod(tx.input);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <h1>Tx {tx._id}</h1>
      <Card
        style={{ margin: 5, marginTop: 0, marginBottom: 10 }}
        bg="dark"
        text="white"
      >
        <Card.Body>
          <Card.Title>{new Date(tx.timestamp).toLocaleString()}</Card.Title>
          <ul>
            {tx.from ? (
              <li>
                From{" "}
                <Link href="/address/[id]" as={`/address/${tx.from}`}>
                  <a>{`${tx.from}`}</a>
                </Link>
              </li>
            ) : (
              ""
            )}
            <li>
              {tx.input ? "Contract " : "To "}
              <Link href="/address/[id]" as={`/address/${tx.to}`}>
                <a>{`${tx.to}`}</a>
              </Link>
            </li>
            <li>
              Block{" "}
              <Link href="/block/[id]" as={`/block/${tx.blockHash}`}>
                <a>{`${tx.blockHash}`}</a>
              </Link>
            </li>
            <li>Block Number {`${tx.blockNumber}`}</li>

            <li>{`Status ${tx.status === true ? "Success" : "Failed"}`}</li>

            <li>{`Gas Limit ${tx.gas}`}</li>

            <li>{`Gas Used ${tx.gasUsed}`}</li>

            <li>Gas Price {(tx.gasPrice / 1e18).toFixed(6)} TARA</li>

            <li>{`Nonce ${tx.nonce}`}</li>

            <li>Value {(tx.value / 1e18).toFixed(6)} TARA</li>

            {tx.contractAddress ? (
              <li>{`Deployed Contract ${tx.contractAddress}`}</li>
            ) : (
              ""
            )}

            {tx.input ? <li>{`Contract Input: ${tx.input}`}</li> : ""}
            {decodedData?.name ? (
              <>
                <li>
                  Contract Function: {decodedData.name}
                  <ul>
                    {decodedData.params.map((p) => (
                      <li>
                        {p.name}: {p.value} ({p.type})
                      </li>
                    ))}
                  </ul>
                </li>
              </>
            ) : (
              ""
            )}
          </ul>
        </Card.Body>
        <Card.Body>
          <Card.Title>DAG Blocks:</Card.Title>
          <Table responsive variant="dark">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Hash</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {dags.map((dagBlock) => (
                <tr key={dagBlock._id}>
                  <td>{new Date(dagBlock.timestamp).toLocaleString()}</td>
                  <td>{`${dagBlock.level} `}</td>
                  <td>
                    <Link
                      href="/dag_block/[id]"
                      as={`/dag_block/${dagBlock._id}`}
                    >
                      <a className="long-hash">{`${dagBlock._id}`}</a>
                    </Link>
                  </td>
                  <td>{`${dagBlock.transactions.length} `}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}
