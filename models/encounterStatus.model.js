var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var encounterStatusSchema = new mongoose.Schema(
{
    description: {
        type: String,
        // required: true,
      },
      name: {
        type: String,
        // required: true,
      },
  },
  {
    timestamps: true,
  }
)

encounterStatusSchema.plugin(mongoosePaginate)

const Encounter = mongoose.model('encounterStatus', encounterStatusSchema, 'encounterStatuses')

module.exports = Encounter;
