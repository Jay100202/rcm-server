var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumChatThreadUserMetricSchema = new mongoose.Schema({
    consortiumChatThread: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatThread'
    },
    unreadCount: Number,
    lastReadMessage: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatThreadMessage'
    },
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
})

ConsortiumChatThreadUserMetricSchema.plugin(mongoosePaginate)
const ConsortiumChatThreadUserMetric = mongoose.model('ConsortiumChatThreadUserMetric', ConsortiumChatThreadUserMetricSchema, 'consortiumChatThreadUserMetrics')

module.exports = ConsortiumChatThreadUserMetric;