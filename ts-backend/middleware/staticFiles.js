// staticFiles.js
const express = require('express');
const path = require('path');

module.exports = function(app) {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
};