const mongoose = require('mongoose');

const internedSchema = new mongoose.Schema({
    sid: {
        type: String,
        required: true
    },
    companyname: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    companytype: {
        type: String,
        enum: ['government', 'private'],
        required: true
    },status: {
        type: String,
        enum: ['accepted', 'rejected', 'pending'],
        default: 'pending'
    },
    description: {
        type: String,
        required: function() {
            return this.status === 'rejected';
        }
    }
});

const Interned = mongoose.model('Interned', internedSchema);

module.exports = Interned;