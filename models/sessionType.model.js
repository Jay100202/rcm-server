var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SessionTypeSchema = new mongoose.Schema({
    sessionTypeName:  { type : String },
    sessionTypeId: { type : Number }
});

SessionTypeSchema.plugin(mongoosePaginate)
const SessionType = mongoose.model('SessionType', SessionTypeSchema, 'sessionTypes')

module.exports = SessionType;
