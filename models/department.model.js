var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var DepartmentSchema = new mongoose.Schema({
    departmentName:  { type : String, required : true },
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

DepartmentSchema.plugin(mongoosePaginate)
const Department = mongoose.model('Department', DepartmentSchema, 'departments')

module.exports = Department;