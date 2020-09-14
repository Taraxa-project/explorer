import { wrapper } from '../store/store'
import {useState} from 'react'
import { useRouter } from 'next/router'

import Head from 'next/head'
import Link from 'next/link'

import utils from 'web3-utils'

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';

import {Navbar, Nav, Form, Button, InputGroup, FormControl} from 'react-bootstrap'

import WebsocketContainer from '../containers/ws'

function ReduxApp({Component, pageProps}) {
    const [search, setSearch] = useState("");
    const router = useRouter()

    function updateSearch (e) {
        setSearch(e.target.value);
    }

    function doSearch() {
        if (search) {
            if (utils.isAddress(search)) {
                router.push(`/address/${search}`)
            } else {
                router.push(`/search?query=${search}`)
            }
        }
    }
    return <>
        <Head>
            <title>Taraxa Explorer</title>
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
        </Head>

        <WebsocketContainer/>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Link href="/" as={`/`}>
                    <Navbar.Brand href="/">
                        <img
                        alt=""
                        src="/explorer.png"
                        width="180"
                        height="36"
                        className="d-inline-block align-top"
                        style={{marginBottom: '11px'}}
                        />{' '}
                    </Navbar.Brand>
                </Link>

                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <InputGroup className="mr-auto" style={{padding: 10}}>
                        <FormControl
                            placeholder="Address, Hash, or Number"
                            aria-label="Recipient's username"
                            aria-describedby="basic-addon2"
                            onChange={updateSearch}
                        />
                        <InputGroup.Append>
                            <Button variant="outline-light" onClick={doSearch}>Search</Button>
                        </InputGroup.Append>
                    </InputGroup>
                    
                    <Nav style={{padding: 10}}>

                    <Link href="/dag_blocks" as={`/dag_blocks`}>
                        <Nav.Link href="/dag_blocks">DAG</Nav.Link>
                    </Link>

                    <Link href="/blocks" as={`/blocks`}>
                        <Nav.Link href="/blocks">Blocks</Nav.Link>
                    </Link>
                    
                    <Link href="/txs" as={`/txs`}>
                        <Nav.Link href="/txs">Transactions</Nav.Link>
                    </Link>

                    <Link href="/accounts" as={`/accounts`}>
                        <Nav.Link href="/accounts">Accounts</Nav.Link>
                    </Link>

                    <Link href="/faucet" as={`/faucet`}>
                        <Nav.Link href="/faucet">Faucet</Nav.Link>
                    </Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
    
            <div className="site-layout-content">
                    <Component {...pageProps} />
            </div>
        
            <div className="site-layout-footer">
                <p><Link href="/dag_blocks" as={`/dag_blocks`}>
                        <a href="/dag_blocks">DAG</a>
                    </Link>
                    {' / '}
                    <Link href="/blocks" as={`/blocks`}>
                        <a href="/blocks">Blocks</a>
                    </Link>
                    {' / '}
                    <Link href="/txs" as={`/txs`}>
                        <a href="/txs">Transactions</a>
                    </Link>
                    {' / '}
                    <Link href="/accounts" as={`/accounts`}>
                        <a href="/accounts">Accounts</a>
                    </Link>
                    {' / '}
                    <Link href="/faucet" as={`/faucet`}>
                        <a href="/faucet">Faucet</a>
                    </Link></p>
                <p>© 2020 Taraxa.io</p>
            </div>
    </>
}

export default wrapper.withRedux(ReduxApp);
