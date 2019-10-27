'use strict';

const uploads = require('express').Router();
const db = require('../core/db');
const logger = require('../core/logger');
const fileUploader = require('../core/files/fileUploader');
const urlShortner = require('../core/urls/urlShortner');
const getFile = require('../core/files/getFile');

uploads.post('/', (req, res) => {
    const requestBody = req.body;
    if (!requestBody.url) {
        logger.info('Uploading file');
        fileUploader(req, res);
    } else {
        logger.info('Shortening URL');
        urlShortner(req, res);
    }
});

uploads.get('/:link', async (req, res) => {
    // console.log(req.headers['user-agent']);
    const request = req.params.link;
    logger.info('Serving file ' + request);
    const record = await db.hgetall(`short:${request}`);
    console.log(record);
    logger.info('Found record' + JSON.stringify(record));
    if (record && record.type === 'file') {
        const fileName = record.path;
        getFile(fileName, req, res);
    } else if (record && record.type === 'url') {
        res.redirect(record.originalURL);
    } else {
        res.end('Cannot find the specified record');
    }
});

module.exports = uploads;
