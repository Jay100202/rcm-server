var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var GenderSchema = new mongoose.Schema({
    genderName:  { type : String },
    isSystemDefault: { 
        type: Number,
        default: 0
    }
})

GenderSchema.plugin(mongoosePaginate)
const Gender = mongoose.model('Gender', GenderSchema, 'genders')

module.exports = Gender;
