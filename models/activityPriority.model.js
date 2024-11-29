var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ActivityPrioritySchema = new mongoose.Schema({    
    priorityText:  { type : String , required : true },
    priority : Number,
    colorCode: String,
    isDefault: { 
        type: Boolean,
        default: false
    },
    isActive : Number
})

ActivityPrioritySchema.plugin(mongoosePaginate)
const ActivityPriority = mongoose.model('ActivityPriority', ActivityPrioritySchema, 'activityPriorities')

module.exports = ActivityPriority;

