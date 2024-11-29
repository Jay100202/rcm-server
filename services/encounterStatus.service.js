const EncounterStatus = require("../models/encounterStatus.model");
const ExcelJS = require("exceljs");


exports.getEncounterStatus = async(status) => {
    const statusData = await EncounterStatus.findOne({ name: status });

    return statusData;
}