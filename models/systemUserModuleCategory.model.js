var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemUserModuleCategorySchema = new mongoose.Schema({    
    categoryName :  { type : String , required : true },
    isActive: { 
        type: Number,
        default: 1
    },
    createdAt: Number,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    updatedAt: Number,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    isDeleted: {
        type: Number,
        default: 0
    }
})

SystemUserModuleCategorySchema.plugin(mongoosePaginate)
const SystemUserModuleCategory = mongoose.model('SystemUserModuleCategory', SystemUserModuleCategorySchema, 'systemUserModuleCategories')

module.exports = SystemUserModuleCategory;