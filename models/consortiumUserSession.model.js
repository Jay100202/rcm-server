var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
require('./sessionType.model');

var ConsortiumUserSessionSchema = new mongoose.Schema({
    sessionToken: { type : String , required : true },
    consortium: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consortium'
    },
    consortiumUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsortiumUser'
    },
    sessionType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionType'
    },
    messagingToken: { type : String },
    lastSyncTs: { type : Number },
});

ConsortiumUserSessionSchema.plugin(mongoosePaginate)
const ConsortiumUserSession = mongoose.model('ConsortiumUserSession', ConsortiumUserSessionSchema, 'consortiumUserSessions')

module.exports = ConsortiumUserSession;
