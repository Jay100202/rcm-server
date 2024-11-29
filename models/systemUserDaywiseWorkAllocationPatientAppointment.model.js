var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemUserDaywiseWorkAllocationPatientAppointmentSchema = new mongoose.Schema({
    systemUserDaywiseWorkAllocation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUserDaywiseWorkAllocation'
    },
    consortiumPatientAppointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumPatientAppointment'
    },
    transcriptorRole: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TranscriptorRole'
    },
    activityReceivedAt : Number,
    activityReceivedFrom : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    activityStartedAt : Number,
    activityEndedAt : Number,
    activityDurationInSeconds : Number,
    activityPriority : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ActivityPriority'
    },
    activityStatus : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ActivityStatus'
    },
    activityAction : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ActivityAction'
    },
    activityFileStatus : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ActivityFileStatus'
    },
    createdAt: { 
        type: Number
    },
    updatedAt: { 
        type: Number
    },
})

SystemUserDaywiseWorkAllocationPatientAppointmentSchema.plugin(mongoosePaginate)
const SystemUserDaywiseWorkAllocationPatientAppointment = mongoose.model('SystemUserDaywiseWorkAllocationPatientAppointment', SystemUserDaywiseWorkAllocationPatientAppointmentSchema, 'systemUserDaywiseWorkAllocationPatientAppointments')

module.exports = SystemUserDaywiseWorkAllocationPatientAppointment;