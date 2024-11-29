var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumChatStatusChangeLogSchema = new mongoose.Schema({
    consortiumConsortiumChat: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumConsortiumChat'
    },
    pastConsortiumChatStatus: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatStatus'
    },
    updConsortiumChatStatus: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatStatus'
    },
    createdAt: Number,
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    }
})

ConsortiumChatStatusChangeLogSchema.plugin(mongoosePaginate)
const ConsortiumChatStatusChangeLog = mongoose.model('ConsortiumChatStatusChangeLog', ConsortiumChatStatusChangeLogSchema, 'consortiumChatStatusChangeLogs')

module.exports = ConsortiumChatStatusChangeLog;