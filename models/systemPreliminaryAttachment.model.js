var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemPreliminaryAttachmentSchema = new mongoose.Schema({
    attFilePath: String,
    attImagePathActual: String,
    attImagePathThumb: String,
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
    isAudio: {
        type: Boolean,
        default: false
    },
    attDurationInSeconds: Number,
    createdAt: Number
})

SystemPreliminaryAttachmentSchema.plugin(mongoosePaginate)

const SystemPreliminaryAttachment = mongoose.model('SystemPreliminaryAttachment', SystemPreliminaryAttachmentSchema, 'systemPreliminaryAttachments')

module.exports = SystemPreliminaryAttachment;
