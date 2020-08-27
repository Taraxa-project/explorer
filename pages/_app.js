import Head from 'next/head'
import Link from 'next/link'

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';

import {Container, Row, Col, Navbar, Nav, Form, FormControl, Button} from 'react-bootstrap'

function MyApp({Component, pageProps}) {
    return <>
        <Head>
            <title>Taraxa Explorer</title>
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
        </Head>

        <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
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
                <Nav className="mr-auto"></Nav>
                <Nav>

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
                </Nav>
            </Navbar.Collapse>
        </Navbar>
 
        <div className="site-layout-content">
            <Component {...pageProps} />
        </div>
    
        <div className="site-layout-footer">
            © 2020 Taraxa.io
        </div>
        
    </>
}

export default MyApp;
