var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var StateSchema = new mongoose.Schema({
    stateName:  { type : String, required : true },
    description: String,
    country: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Country'
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

StateSchema.plugin(mongoosePaginate)
const State = mongoose.model('State', StateSchema, 'states')

module.exports = State;