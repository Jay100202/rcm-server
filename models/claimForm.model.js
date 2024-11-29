var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

var ClaimFormSchema = new mongoose.Schema({
  EligibilityStatus: {
    type: Object,
  },
  claimSubmissionDate: {
    type: Date,
  },
  claimPaidDate: {
    type: Date,
  },
  EligibilityVerificationNote: {
    type: String,
  },
  AuthorizationNumberandNotes: {
    type: String,
  },
  schedulingProvider: {
    type: String,
  },
  Location: {
    type: Object,
  },
  PlaceOfService: {
    type: Object,
  },
  RenderingProvider1: {
    type: Object,
  },
  RenderingProvider2: {
    type: Object,
  },
  createdAt: {
    type: Number,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  updatedAt: {
    type: Number,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SystemUser",
  },
  // Defining the new fields directly as an array of objects
  tableData: [{
      cpt: Number,
      unappliedCoPay: Number,
      unappliedCoIns: Number,
      unappliedDeductible: Number,
      appliedCoPay: Number,
      appliedCoIns: Number,
      appliedDeductible: Number,
      payment: Number,
      due: Number,
      charges: Number,
      allowed: Number,
      writeOff: Number,
      status: Number,
      code: Number,
      notes: Number,
      unit: Number,
      price: Number
  }],
  appointmentId: {
    type: String
  }
});

ClaimFormSchema.plugin(mongoosePaginate);
const ClaimForm = mongoose.model("ClaimForm", ClaimFormSchema);

module.exports = ClaimForm;
