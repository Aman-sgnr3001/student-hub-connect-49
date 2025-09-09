const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    facultyname: {
        type: String,
        required: true
    },
    facultyid: {
        type: String,
        required: true
    },
    emailid: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    }
});

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;