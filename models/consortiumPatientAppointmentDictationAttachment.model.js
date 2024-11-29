var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumPatientAppointmentDictationAttachmentSchema = new mongoose.Schema({
    consortium: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consortium'
    },
    consortiumPatientAppointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumPatientAppointment'
    },
    attFilePath: String,
    attFilePathActual: String,
    attFilePathThumb: String,
    attFileName: String,
    attFileSizeBytes: Number,
    attFileUrl: String,
    attImageActualUrl: String,
    attImageThumbUrl: String,
    attFileUrlExpiresAt : Number,
    isImage: {
        type: Boolean,
        default: false
    },
    hasDuration: {
        type: Boolean,
        default: false
    },
    isAudio: {
        type: Boolean,
        default: false
    },
    attDurationInSeconds: Number,
    notes: String,
    createdAt: Number,
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
    updatedBySystemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    updatedByConsortiumUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUser'
    },
    isDeleted: { 
        type: Number,
        default: 0
    },
})

ConsortiumPatientAppointmentDictationAttachmentSchema.plugin(mongoosePaginate)

const ConsortiumPatientAppointmentDictationAttachment = mongoose.model('ConsortiumPatientAppointmentDictationAttachment', ConsortiumPatientAppointmentDictationAttachmentSchema, 'consortiumPatientAppointmentDictationAttachments')

module.exports = ConsortiumPatientAppointmentDictationAttachment;
