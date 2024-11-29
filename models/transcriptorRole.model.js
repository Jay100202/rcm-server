var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var TranscriptorRoleSchema = new mongoose.Schema({
    roleName:  { type : String, required : true },
    roleCode : String,
    isQA: { 
        type: Boolean,
        default: false
    },
    isMT: { 
        type: Boolean,
        default: false
    },
    level: { 
        type: Number,
        default: 1
    },
    isActive: { 
        type: Number,
        default: 1
    },
})

TranscriptorRoleSchema.plugin(mongoosePaginate)
const TranscriptorRole = mongoose.model('TranscriptorRole', TranscriptorRoleSchema, 'transcriptorRoles')

module.exports = TranscriptorRole;