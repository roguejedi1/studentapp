const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Notification = require('./sNotification');

const sFollowNotif = Notification.discriminator(
    'sFollowNotif',
    new Schema({
    })
)

module.exports = sFollowNotif;