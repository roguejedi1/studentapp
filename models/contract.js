const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContractSchema = new Schema({
    course: String,
    courseDuration: String,
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }
});

module.exports = mongoose.model('Contract', ContractSchema);