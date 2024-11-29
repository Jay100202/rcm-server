var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumUserTypeSchema = new mongoose.Schema({
    typeText:  { type : String, required : true },
    description: String,
    isAppointmentEnabled: { 
        type: Boolean,
        default: false
    },
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

ConsortiumUserTypeSchema.plugin(mongoosePaginate)
const ConsortiumUserType = mongoose.model('ConsortiumUserType', ConsortiumUserTypeSchema, 'consortiumUserTypes')

module.exports = ConsortiumUserType;
