var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var AppointmentStatusChangeLogSchema = new mongoose.Schema({
    consortiumPatientAppointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumPatientAppointment'
    },
    pastAppointmentStatus: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AppointmentStatus'
    },
    pastAppointmentStatusNotes : String,
    updAppointmentStatus: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AppointmentStatus'
    },
    updAppointmentStatusNotes : String,
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

AppointmentStatusChangeLogSchema.plugin(mongoosePaginate)
const AppointmentStatusChangeLog = mongoose.model('AppointmentStatusChangeLog', AppointmentStatusChangeLogSchema, 'appointmentStatusChangeLogs')

module.exports = AppointmentStatusChangeLog;