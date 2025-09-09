const mongoose = require('mongoose');

const gpaSchema = new mongoose.Schema({
    sid: {
        type: String,
        required: true
    },
    gpa: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    sem: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    }
});

const GPA = mongoose.model('GPA', gpaSchema);

module.exports = GPA;