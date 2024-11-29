var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemUserModuleSchema = new mongoose.Schema({
    moduleName:  { type : String, required : true },
    moduleCategory: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUserModuleCategory'
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

SystemUserModuleSchema.plugin(mongoosePaginate)
const SystemUserModule = mongoose.model('SystemUserModule', SystemUserModuleSchema, 'systemUserModules')

module.exports = SystemUserModule;