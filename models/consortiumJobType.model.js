var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumJobTypeSchema = new mongoose.Schema({    
    typeText:  { type : String, required : true },
    typeCode : String,
    isActive: { 
        type: Number,
        default: 1
    }
})

ConsortiumJobTypeSchema.plugin(mongoosePaginate)
const ConsortiumJobType = mongoose.model('ConsortiumJobType', ConsortiumJobTypeSchema, 'consortiumJobTypes')

module.exports = ConsortiumJobType;

