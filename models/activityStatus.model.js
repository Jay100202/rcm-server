var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ActivityStatusSchema = new mongoose.Schema({    
    statusText:  { type : String , required : true },
    statusCode : String,
    priority : String,
    colorCode: String,
    isDefault: { 
        type: Boolean,
        default: false
    },
})

ActivityStatusSchema.plugin(mongoosePaginate)
const ActivityStatus = mongoose.model('ActivityStatus', ActivityStatusSchema, 'activityStatuses')

module.exports = ActivityStatus;

