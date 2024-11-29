var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemUserDaywiseWorkAllocationSchema = new mongoose.Schema({
    systemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    consDate : Number,
    assignedActivityCount : Number,
    assignedActivityDurationInSeconds : Number,
    completedActivityCount : Number,
    completedActivityDurationInSeconds : Number,
    pendingActivityCount : Number,
    pendingActivityDurationInSeconds : Number,
    createdAt: { 
        type: Number
    },
    updatedAt: { 
        type: Number
    },
})

SystemUserDaywiseWorkAllocationSchema.plugin(mongoosePaginate)
const SystemUserDaywiseWorkAllocation = mongoose.model('SystemUserDaywiseWorkAllocation', SystemUserDaywiseWorkAllocationSchema, 'systemUserDaywiseWorkAllocations')

module.exports = SystemUserDaywiseWorkAllocation;