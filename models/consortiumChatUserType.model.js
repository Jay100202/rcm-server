var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumChatUserTypeSchema = new mongoose.Schema({    
    typeText:  { type : String, required : true },
    typeCode : String,
    isSystemUser: { 
        type: Boolean,
        default: false
    },
    isConsortiumUser: { 
        type: Boolean,
        default: false
    }
})

ConsortiumChatUserTypeSchema.plugin(mongoosePaginate)
const ConsortiumChatUserType = mongoose.model('ConsortiumChatUserType', ConsortiumChatUserTypeSchema, 'consortiumChatUserTypes')

module.exports = ConsortiumChatUserType;

