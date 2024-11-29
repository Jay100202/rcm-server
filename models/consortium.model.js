var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumSchema = new mongoose.Schema({
    consortiumId : Number,
    consortiumName: String,
    consortiumShortCode: String,
    description: String,
    consortiumUserCount: Number,
    consortiumLocationCount: Number,
    consortiumPatientCount: Number,
    consortiumPatientCurrentId: Number,
    consortiumPatientAppointmentCurrentId: Number,
    consortiumChatThreadCurrentId: Number,
    appLastAccessedAt: Number,
    //consortiumJobTypes : Added on 19/03/24 By AGT
    consortiumJobTypes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumJobType'
    }],
    isActive: { 
        type: Number,
        default: 1
    },
    createdAt: { 
        type: Number
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    updatedAt: { 
        type: Number
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    isDeleted: { 
        type: Number,
        default: 0
    },
})

ConsortiumSchema.plugin(mongoosePaginate)
const Consortium = mongoose.model('Consortium', ConsortiumSchema, 'consortiums')

module.exports = Consortium;
