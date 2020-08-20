const mongoose = require('mongoose');
const io = require('socket.io')();
const socketApi = {};
const url = require('url');

socketApi.io = io;

socketApi.sendNotification = (notification) => {
    io.sockets.emit('notification', { msg: 'notification page' });
}

module.exports = socketApi;