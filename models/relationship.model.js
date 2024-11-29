var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var RelationshipSchema = new mongoose.Schema({
    relationshipName:  { type : String, required : true },
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

RelationshipSchema.plugin(mongoosePaginate)
const Relationship = mongoose.model('Relationship', RelationshipSchema, 'relationships')

module.exports = Relationship;