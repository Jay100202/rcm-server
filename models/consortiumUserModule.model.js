var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumUserModuleSchema = new mongoose.Schema({
    moduleName:  { type : String, required : true },
    moduleCategory: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ConsortiumUserModuleCategory'
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

ConsortiumUserModuleSchema.plugin(mongoosePaginate)
const ConsortiumUserModule = mongoose.model('ConsortiumUserModule', ConsortiumUserModuleSchema, 'consortiumUserModules')

module.exports = ConsortiumUserModule;