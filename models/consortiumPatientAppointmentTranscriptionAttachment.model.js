var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumPatientAppointmentTranscriptionAttachmentSchema = new mongoose.Schema({
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
    systemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    transcriptorRole: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TranscriptorRole'
    },
    transcriptionStatus: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TranscriptionStatus'
    },
    systemUserDaywiseWorkAllocation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUserDaywiseWorkAllocation'
    },
    versionNo : Number,
    activityStartedAt : Number,
    activityEndedAt : Number,
    activityDurationInSeconds : Number,
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

ConsortiumPatientAppointmentTranscriptionAttachmentSchema.plugin(mongoosePaginate)

const ConsortiumPatientAppointmentTranscriptionAttachment = mongoose.model('ConsortiumPatientAppointmentTranscriptionAttachment', ConsortiumPatientAppointmentTranscriptionAttachmentSchema, 'consortiumPatientAppointmentTranscriptionAttachments')

module.exports = ConsortiumPatientAppointmentTranscriptionAttachment;
