var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumUserRoleRightSchema = new mongoose.Schema({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsortiumUserRole'
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsortiumUserModule'
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

ConsortiumUserRoleRightSchema.plugin(mongoosePaginate)
const ConsortiumUserRoleRight = mongoose.model('ConsortiumUserRoleRight', ConsortiumUserRoleRightSchema, 'consortiumUserRoleRights')

module.exports = ConsortiumUserRoleRight;
