var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemUserRoleSchema = new mongoose.Schema({
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

SystemUserRoleSchema.plugin(mongoosePaginate)
const SystemUserRole = mongoose.model('SystemUserRole', SystemUserRoleSchema, 'systemUserRoles')

module.exports = SystemUserRole;