var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsortiumSystemUserTeamSchema = new mongoose.Schema({
    consortium: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consortium'
    },
    systemUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    createdAt: { 
        type: Number
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    updatedAt: { 
        type: Number
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SystemUser'
    },
    isDeleted: {
        type: Number,
        default: 0
    }
})

ConsortiumSystemUserTeamSchema.plugin(mongoosePaginate)
const ConsortiumSystemUserTeam = mongoose.model('ConsortiumSystemUserTeam', ConsortiumSystemUserTeamSchema, 'consortiumSystemUserTeams')

module.exports = ConsortiumSystemUserTeam;
