var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumChatStatusSchema = new mongoose.Schema({    
    statusText:  { type : String , required : true },
    statusCode : String,
    colorCode: String,
    isDefault: { 
        type: Boolean,
        default: false
    },
    isResolved: { 
        type: Boolean,
        default: false
    },
    isClosed: { 
        type: Boolean,
        default: false
    },
    isActive: { 
        type: Number,
        default: 1
    },
})

ConsortiumChatStatusSchema.plugin(mongoosePaginate)
const ConsortiumChatStatus = mongoose.model('ConsortiumChatStatus', ConsortiumChatStatusSchema, 'consortiumChatStatuses')

module.exports = ConsortiumChatStatus;

