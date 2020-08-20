const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Notification = require('./tnotification');

const tFollowNotif = Notification.discriminator(
    'tFollowNotif',
    new Schema({
    })
)

module.exports = tFollowNotif;