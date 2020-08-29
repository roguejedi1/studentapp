const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Notification = require('./sNotification');

const RecievedSchema = Notification.discriminator(
    'Recieved',
    new Schema({
        contractId: {
            type: Schema.Types.ObjectId,
            ref: 'Contract'
        }
    })
)

module.exports = RecievedSchema;