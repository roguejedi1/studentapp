const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const TeacherSchema = User.discriminator(
    'Teacher',
    new Schema({
        classTeaching: String,
        following: [{
            type: Schema.Types.ObjectId,
            ref: 'Student'
        }],
        followers: [{
            type: Schema.Types.ObjectId,
            ref: 'Student'
        }],
        // notifications: [{
        //     type: Schema.Types.ObjectId,
        //     ref: 'Notification'
        // }]
    })
)

module.exports = TeacherSchema;