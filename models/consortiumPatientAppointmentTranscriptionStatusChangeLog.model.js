var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumPatientAppointmentTranscriptionStatusChangeLogSchema = new mongoose.Schema({
    consortiumPatientAppointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumPatientAppointment'
    },
    pastTranscriptionStatus: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TranscriptionStatus'
    },
    pastTranscriptionStatusNotes : String,
    updTranscriptionStatus: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TranscriptionStatus'
    },
    updTranscriptionStatusNotes : String,
    systemUserDaywiseWorkAllocation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUserDaywiseWorkAllocation'
    },
    createdAt: Number,
    createdBySystemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    createdByConsortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
})

ConsortiumPatientAppointmentTranscriptionStatusChangeLogSchema.plugin(mongoosePaginate)
const ConsortiumPatientAppointmentTranscriptionStatusChangeLog = mongoose.model('ConsortiumPatientAppointmentTranscriptionStatusChangeLog', ConsortiumPatientAppointmentTranscriptionStatusChangeLogSchema, 'consortiumPatientAppointmentTranscriptionStatusChangeLogs')

module.exports = ConsortiumPatientAppointmentTranscriptionStatusChangeLog;