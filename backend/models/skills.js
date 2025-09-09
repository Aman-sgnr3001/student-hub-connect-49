const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    sid: {
        type: String,
        required: true
    },
    skillname: {
        type: String,
        required: true
    },
    url: {
        type: String,
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
    }
});

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;