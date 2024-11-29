var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumUserScheduledAppNotificationSchema = new mongoose.Schema({
    consortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
    moduleCode: String,
    actionCode: String,
    consortiumChatThread: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatThread'
    },
    consortiumChatThreadMessage: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumChatThreadMessage'
    },
    createdAt: Number,
    scheduledAt: Number,
})

ConsortiumUserScheduledAppNotificationSchema.plugin(mongoosePaginate)
const ConsortiumUserScheduledAppNotification = mongoose.model('ConsortiumUserScheduledAppNotification', ConsortiumUserScheduledAppNotificationSchema, 'consortiumUserScheduledAppNotifications')

module.exports = ConsortiumUserScheduledAppNotification;