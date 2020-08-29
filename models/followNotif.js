const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Notification = require('./notification');

const FollowNotification = Notification.discriminator(
    'FollowNotification',
    new Schema({
    })
)

module.exports = FollowNotification;