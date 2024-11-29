var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SystemUserRoleRightSchema = new mongoose.Schema({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUserRole'
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUserModule'
    },
    view: {
        type: Number,
        default: 0
    },
    viewAll: {
        type: Number,
        default: 0
    },
    add: {
        type: Number,
        default: 0
    },
    edit: {
        type: Number,
        default: 0
    },
    delete: {
        type: Number,
        default: 0
    },
    print: {
        type: Number,
        default: 0
    },
    download: {
        type: Number,
        default: 0
    },
    email: {
        type: Number,
        default: 0
    },
})

SystemUserRoleRightSchema.plugin(mongoosePaginate)
const SystemUserRoleRight = mongoose.model('SystemUserRoleRight', SystemUserRoleRightSchema, 'systemUserRoleRights')

module.exports = SystemUserRoleRight;
