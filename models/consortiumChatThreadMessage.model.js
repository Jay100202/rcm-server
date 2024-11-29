var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumChatThreadMessageSchema = new mongoose.Schema({
    consortiumChatThread: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatThread'
    },
    messageText: String,
    userType: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatUserType'
    },
    consortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
    systemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    createdAt: { 
        type: Number
    },
})

ConsortiumChatThreadMessageSchema.plugin(mongoosePaginate)
const ConsortiumChatThreadMessage = mongoose.model('ConsortiumChatThreadMessage', ConsortiumChatThreadMessageSchema, 'consortiumChatThreadMessages')

module.exports = ConsortiumChatThreadMessage;