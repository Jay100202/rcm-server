var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ActivityFileStatusSchema = new mongoose.Schema({    
    statusText:  { type : String , required : true },
    statusCode : String,
    priority : String,
    colorCode: String,
    isCompleted: { 
        type: Boolean,
        default: false
    },
    isActive: { 
        type: Number,
        default: 1
    },
})

ActivityFileStatusSchema.plugin(mongoosePaginate)
const ActivityFileStatus = mongoose.model('ActivityFileStatus', ActivityFileStatusSchema, 'activityFileStatuses')

module.exports = ActivityFileStatus;

