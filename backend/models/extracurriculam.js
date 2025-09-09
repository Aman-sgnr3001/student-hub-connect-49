const mongoose = require('mongoose');

const extracurriculamSchema = new mongoose.Schema({
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
    }
});

const Extracurriculam = mongoose.model('Extracurriculam', extracurriculamSchema);

module.exports = Extracurriculam;