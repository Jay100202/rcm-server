var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SalutationSchema = new mongoose.Schema({
    salutationText:  { type : String, required : true },
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

SalutationSchema.plugin(mongoosePaginate)
const Salutation = mongoose.model('Salutation', SalutationSchema, 'salutations')

module.exports = Salutation;