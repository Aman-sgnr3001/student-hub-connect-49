const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    sid: {
        type: String,
        required: true
    },
    companyname: {
        type: String,
        required: true
    },
    companytype: {
        type: String,
        enum: ['government', 'private'],
        required: true
    },
    status: {
        type: String,
        enum: ['accepted', 'rejected', 'pending'],
        default: 'pending'
    },
    description: {
        type: String,
        required: function() {
            return this.status === 'rejected';
        }
    },
    url: {
        type: String,
        required: true
    }
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;