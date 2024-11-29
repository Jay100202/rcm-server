var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemUserDaywiseWorkAllocationLogSchema = new mongoose.Schema({
    consortiumPatientAppointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumPatientAppointment'
    },
    actionCode : String,
    pastTranscriptorRole: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TranscriptorRole'
    },
    updTranscriptorRole: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TranscriptorRole'
    },
    pastTranscriptionAllocationDate : Number,
    updTranscriptionAllocationDate : Number,
    systemUserDaywiseWorkAllocationPatientAppointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUserDaywiseWorkAllocationPatientAppointment'
    },
    createdAt: Number,
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
})

SystemUserDaywiseWorkAllocationLogSchema.plugin(mongoosePaginate)
const SystemUserDaywiseWorkAllocationLog = mongoose.model('SystemUserDaywiseWorkAllocationLog', SystemUserDaywiseWorkAllocationLogSchema, 'systemUserDaywiseWorkAllocationLogs')

module.exports = SystemUserDaywiseWorkAllocationLog;