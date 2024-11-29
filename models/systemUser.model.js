var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var SystemUserSchema = new mongoose.Schema({
    userFullName: String,
    email: String,
    password: String,
    profilePhotoFilePathThumb : String,
    profilePhotoFilePathActual : String,
    profileImageActualUrl: String,
    profileImageThumbUrl: String,
    profileUrlExpiresAt : Number,
    gender:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gender'
    },
    pseudoName : String,
    birthDate : Number,
    birthDateStr : String,
    mobileNo : String,
    alternatePhoneNumber : String,
    department: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Department'
    },
    designation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Designation'
    },
    role:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUserRole'
    },
    transcriptorRole:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TranscriptorRole'
    },
    audioMinutes: Number,
    appLastAccessedAt: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Number,
        default: 1
    },
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

SystemUserSchema.plugin(mongoosePaginate)

SystemUserSchema.pre('save', function(next){
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

const SystemUser = mongoose.model('SystemUser', SystemUserSchema, 'systemUsers')

module.exports = SystemUser;
