var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var AppModuleIdLogSchema = new mongoose.Schema({
    moduleCode:  { type : String , required : true },
    currentId: Number,
    isActive: Number
})

AppModuleIdLogSchema.plugin(mongoosePaginate)
const AppModuleIdLog = mongoose.model('AppModuleIdLog', AppModuleIdLogSchema, 'appModuleIdLog')

module.exports = AppModuleIdLog;
