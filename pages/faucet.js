import {useState, useEffect} from 'react'

import {Card, Button, Row, Col, Form} from 'react-bootstrap'

import utils from 'web3-utils'

export default function Faucet() {

    const [url, setUrl] = useState('http://localhost:3000')
    const [validAddress, setValidAddress] = useState(false)
    const [response, setResponse] = useState('')

    useEffect(() => {
        setUrl(`${window.location.protocol}://${window.location.hostname}:${Number(window.location.port)}`)
    })

    function validateAddress(e) {
        const address = e.target.value;
        if (utils.isAddress(address)) {
            setValidAddress(address);
        }
    }

    function submitForm(e) {
        e.preventDefault();
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        const path = `/api/faucet/${validAddress}`
        console.log(`Calling`, path);
        fetch(path, requestOptions)
            .then((res) => {
                setResponse(`Address ${validAddress} has been added to our queue.`)
            })
            .catch((e) => {
                setResponse(`There was an issue adding address ${validAddress} to our queue. Please try again later.`)
            })
    }

    return (
        <>
            <Row>
                <Col sm="8" md="10">
                    <h1>Faucet</h1>
                </Col>
            </Row>
            <Card style={{margin: 5, marginTop: 0, marginBottom: 10}} bg="dark" text="white" className="text-center">
                <Card.Body>
                   
                    <div style={{maxWidth: 500, marginLeft: 'auto', marginRight: 'auto'}}>
                        {!response ? (<Form>
                            <Form.Group>
                                <Form.Label>Provide your Taraxa wallet address</Form.Label>
                                <Form.Control id="receiveAddress" size="sm" isInvalid={!validAddress} onChange={validateAddress}/>
                            </Form.Group>
                            <Button variant="light" type="submit" disabled={!validAddress} onClick={submitForm}>
                                Submit
                            </Button>
                        </Form>) : response}
                    </div>
                    
                </Card.Body>
                <Card.Body>
                    This faucet drips once every 5 seconds. You can register your account in our queue.<br/>

                    API Example: curl {url}/faucet/[your wallet address]
                </Card.Body>
            </Card>
        </>
    )
}