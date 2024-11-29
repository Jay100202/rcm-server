var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var TranscriptionStatusSchema = new mongoose.Schema({    
    statusText:  { type : String , required : true },
    roleCode : String,
    statusCode : String,
    colorCode: String,
    moduleName: String,
    moduleRight: String,
    roleCode: String,
    hasSystemUserAssignment: { 
        type: Boolean,
        default: false
    },
    isDefault: { 
        type: Boolean,
        default: false
    },
    isCompleted: { 
        type: Boolean,
        default: false
    },
    isQA: { 
        type: Boolean,
        default: false
    },
    isMT: { 
        type: Boolean,
        default: false
    },
    isSubmitted: { 
        type: Boolean,
        default: false
    },
    isActive: { 
        type: Number,
        default: 1
    },
})

TranscriptionStatusSchema.plugin(mongoosePaginate)
const TranscriptionStatus = mongoose.model('TranscriptionStatus', TranscriptionStatusSchema, 'transcriptionStatuses')

module.exports = TranscriptionStatus;