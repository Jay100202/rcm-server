var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumChatThreadSchema = new mongoose.Schema({
    consortiumThreadId : Number,
    consortium: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consortium'
    },
    topic: String,
    latestMsgExcerpt : String,
    latestMsgReceivedAt : { 
        type: Number
    },
    consortiumChatStatus: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatStatus'
    },
    isResolved: { 
        type: Boolean,
        default: false
    },
    createdAt: { 
        type: Number
    },
    createdByUserType: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatUserType'
    },
    createdBySystemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    createdByConsortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
    updatedAt: { 
        type: Number
    },
    updatedByUserType: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatUserType'
    },
    updatedBySystemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    updatedByConsortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
    isClosed: { 
        type: Boolean,
        default: false
    },
    closedAt: { 
        type: Number
    },
    closedByUserType: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatUserType'
    },
    closedBySystemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    closedByConsortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
    isDeleted: { 
        type: Number,
        default: 0
    },
})

ConsortiumChatThreadSchema.plugin(mongoosePaginate)
const ConsortiumChatThread = mongoose.model('ConsortiumChatThread', ConsortiumChatThreadSchema, 'consortiumChatThreads')

module.exports = ConsortiumChatThread;