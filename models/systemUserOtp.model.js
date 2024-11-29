var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var SystemUserOtpSchema = new mongoose.Schema({
    otp: { type : String , required : true },
    systemUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemUser'
    }
});

SystemUserOtpSchema.plugin(mongoosePaginate)

SystemUserOtpSchema.pre('save', function(next){
    var userOtp = this;
    if (!userOtp.isModified('otp')) return next();

    if((userOtp.otp).length === 4) {
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
          if(err) return next(err);

          bcrypt.hash(userOtp.otp, salt, function(err, hash){
              if(err) return next(err);

              userOtp.otp = hash;
              next();
          });
      });
    }
});

const SystemUserOtp = mongoose.model('SystemUserOtp', SystemUserOtpSchema, 'systemUserOtps')

module.exports = SystemUserOtp;
