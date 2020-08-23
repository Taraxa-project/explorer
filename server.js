#!/usr/bin/env node

const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');

const pkg = require('./package.json');

const options = {
    definition: {
        openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
        info: {
            title: pkg.name, // Title (required)
            version: pkg.version, // Version (required)
        },
    },
    // Path to the API docs
    apis: ['./routes/blocks', './routes/txs'],
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/api', require('./routes'));

app.listen(config.port, () => {
    console.log(`Server listening at 0.0.0.0:${config.port}`);
});