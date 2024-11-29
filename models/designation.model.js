var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var DesignationSchema = new mongoose.Schema({
    designationName:  { type : String, required : true },
    description: String,
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

DesignationSchema.plugin(mongoosePaginate)
const Designation = mongoose.model('Designation', DesignationSchema, 'designations')

module.exports = Designation;