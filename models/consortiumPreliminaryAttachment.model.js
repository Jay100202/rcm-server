var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumPreliminaryAttachmentSchema = new mongoose.Schema({
    consortium: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consortium'
    },
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
    createdAt: Number,
})

ConsortiumPreliminaryAttachmentSchema.plugin(mongoosePaginate)

const ConsortiumPreliminaryAttachment = mongoose.model('ConsortiumPreliminaryAttachment', ConsortiumPreliminaryAttachmentSchema, 'consortiumPreliminaryAttachments')

module.exports = ConsortiumPreliminaryAttachment;
