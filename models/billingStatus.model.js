const mongoose = require("mongoose");
const billingStatusSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      // required: true,
    },
    name: {
      type: String,
      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'systemUser'
  },
  updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'systemUser'
  },
  isDeleted: {
    type: Number,
    default: 0
}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("billingStatus", billingStatusSchema, "billingStatuses");
