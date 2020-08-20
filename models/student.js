const mongoose = require('mongoose');
const passportLocalMongooe = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const StudentSchema = User.discriminator(
    'Student',
    new Schema({
        course: String,
        following: [{
            type: Schema.Types.ObjectId,
            ref: 'Teacher'
        }],
        followers: [{
            type: Schema.Types.ObjectId,
            ref: 'Teacher'
        }],
        notifications: [{
            type: Schema.Types.ObjectId,
            ref: 'TNotification'
        }]
    })
)

module.exports = StudentSchema;