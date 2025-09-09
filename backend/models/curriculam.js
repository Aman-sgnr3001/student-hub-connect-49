const mongoose = require('mongoose');

const activitiesSchema = new mongoose.Schema({
    sid: {
        type: String,
        required: true
    },
    activities: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: false
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

const Activities = mongoose.model('Activities', activitiesSchema);

module.exports = Activities;