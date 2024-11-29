var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumUserModuleCategorySchema = new mongoose.Schema({    
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

ConsortiumUserModuleCategorySchema.plugin(mongoosePaginate)
const ConsortiumUserModuleCategory = mongoose.model('ConsortiumUserModuleCategory', ConsortiumUserModuleCategorySchema, 'consortiumUserModuleCategories')

module.exports = ConsortiumUserModuleCategory;