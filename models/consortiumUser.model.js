var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
 
var ConsortiumUserSchema = new mongoose.Schema({
    consortium:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consortium'
    },
    userFullName: String,
    emailOfficial: { type : String , required : true },
    password: { type : String, required : true },
    emailPersonal : String,
    mobileNoOfficial : String,
    mobileNoPersonal : String,
    consortiumUserRole:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsortiumUserRole'
    },
    consortiumUserType:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsortiumUserType'
    },
    speciality:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Speciality'
    },
    consortiumLocations:  [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsortiumLocation'
    }],
    defaultConsortiumLocation:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsortiumLocation'
    },
    templateAttachments : [{
        attFilePath: String,
        attFilePathActual : String,
        attFilePathThumb : String,
        isImage :  {
            type: Boolean,
            default: false
        },
        attFileName: String,
        attFileSizeBytes: Number,
        attFileUrl: String,
        attImageActualUrl: String,
        attImageThumbUrl: String,
        attFileUrlExpiresAt : Number,
    }],
    sampleAttachments : [{
        attFilePath: String,
        attFilePathActual : String,
        attFilePathThumb : String,
        isImage :  {
            type: Boolean,
            default: false
        },
        attFileName: String,
        attFileSizeBytes: Number,
        attFileUrl: String,
        attImageActualUrl: String,
        attImageThumbUrl: String,
        attFileUrlExpiresAt : Number,
    }],
    isActive: {
        type: Number,
        default: 1
    },
    appLastAccessedAt : Number,
    createdAt: Number,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    updatedAt: Number,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    },
    isDeleted: {
        type: Number,
        default: 0
    }
})

ConsortiumUserSchema.plugin(mongoosePaginate)

ConsortiumUserSchema.pre('save', function(next){
    var user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);

            user.password = hash;
            next();
        });
    });
});

const ConsortiumUser = mongoose.model('ConsortiumUser', ConsortiumUserSchema, 'consortiumUsers')

module.exports = ConsortiumUser;
