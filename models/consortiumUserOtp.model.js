var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var ConsortiumUserOtpSchema = new mongoose.Schema({
    otp: { type : String , required : true },
    consortium: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consortium'
    },
    consortiumUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConsortiumUser'
    },
    otpForAction: {
        type: Boolean,
        default: false
    },
    otpForEmail: {
        type: Boolean,
        default: false
    },
});

ConsortiumUserOtpSchema.plugin(mongoosePaginate)

ConsortiumUserOtpSchema.pre('save', function(next){
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

const ConsortiumUserOtp = mongoose.model('ConsortiumUserOtp', ConsortiumUserOtpSchema, 'consortiumUserOtps')

module.exports = ConsortiumUserOtp;
