const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    sid: {
        type: String,
        required: true
    },
    sname: {
        type: String,
        required: true
    },
    emailid: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;