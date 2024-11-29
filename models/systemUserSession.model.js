var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
require('./sessionType.model');

var SystemUserSessionSchema = new mongoose.Schema({
    sessionToken: { type : String , required : true },
    systemUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    sessionType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionType'
    },
    messagingToken: { type : String },
    lastSyncTs: { type : Number },
});

SystemUserSessionSchema.plugin(mongoosePaginate)
const SystemUserSession = mongoose.model('SystemUserSession', SystemUserSessionSchema, 'systemUserSessions')

module.exports = SystemUserSession;
