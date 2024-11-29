const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const ClaimDenialCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

ClaimDenialCodeSchema.plugin(mongoosePaginate);

const ClaimDenialCode = mongoose.model(
  "ClaimDenialCode",
  ClaimDenialCodeSchema,
  "claimDenialCodes"
);

module.exports = ClaimDenialCode;
