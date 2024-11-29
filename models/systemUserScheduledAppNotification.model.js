var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemUserScheduledAppNotificationSchema = new mongoose.Schema({
    systemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
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

SystemUserScheduledAppNotificationSchema.plugin(mongoosePaginate)
const SystemUserScheduledAppNotification = mongoose.model('SystemUserScheduledAppNotification', SystemUserScheduledAppNotificationSchema, 'systemUserScheduledAppNotifications')

module.exports = SystemUserScheduledAppNotification;