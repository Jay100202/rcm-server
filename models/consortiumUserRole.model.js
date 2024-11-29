var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumUserRoleSchema = new mongoose.Schema({
    roleName:  { type : String, required : true },
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

ConsortiumUserRoleSchema.plugin(mongoosePaginate)
const ConsortiumUserRole = mongoose.model('ConsortiumUserRole', ConsortiumUserRoleSchema, 'consortiumUserRoles')

module.exports = ConsortiumUserRole;