var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var TimeZoneOptionSchema = new mongoose.Schema({
    timeZoneName: String,
    timeZoneOffset: Number,
    timeZoneOffsetStr: String,
    isActive: { 
        type: Number,
        default: 1
    }
})

TimeZoneOptionSchema.plugin(mongoosePaginate)
const TimeZoneOption = mongoose.model('TimeZoneOption', TimeZoneOptionSchema, 'timeZoneOptions')

module.exports = TimeZoneOption;