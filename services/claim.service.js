const Claim = require("../models/claim.model");
const ClaimDetail = require("../models/claimDetails.model");
const ExcelJS = require("exceljs");

exports.createClaim = async (data) => {
  console.log("ookokokooo",data)
  const claim = new Claim(data);
  return await claim.save();
};

exports.listClaimsExcel = async ({ skip, perPage, sortOn, sortDir, match }) => {
  let query = [
    { $match: {} },
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    {
      $lookup: {
        from: "encounters",
        localField: "encounterId",
        foreignField: "_id",
        as: "encounter",
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: perPage }],
      },
    },
  ];

  if (match) {
    query.unshift({
      $match: {
        $or: [
          { primaryInsurance: { $regex: match, $options: "i" } },
          { secondaryInsurance: { $regex: match, $options: "i" } },
        ],
      },
    });
  }

  if (sortOn && sortDir) {
    let sort = {};
    sort[sortOn] = sortDir === "desc" ? -1 : 1;
    query.push({ $sort: sort });
  }

  const claims = await Claim.aggregate(query);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Claims");

  worksheet.columns = [
    { header: "Patient ID", key: "patientId" },
    { header: "Encounter ID", key: "encounterId" },
    // Add other columns based on your schema
    { header: "Claim Date", key: "claimDate" },
  ];

  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      let cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  claims[0].data.forEach((claim) => {
    worksheet.addRow({
      patientId: claim.patientId,
      encounterId: claim.encounterId,
      // Add other fields
      claimDate: claim.claimDate
        ? claim.claimDate.toISOString().split("T")[0]
        : "",
    });
  });

  return { workbook };
};

exports.getAllClaims = async () => {
  return await Claim.find();
};

exports.getClaimById = async (id) => {
  return await Claim.findById(id);
};

exports.updateClaim = async (id, data) => {
  return await Claim.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteClaim = async (id) => {
  return await Claim.findByIdAndDelete(id);
};

exports.getClaimFormCMS1500Excel = async ({
  skip,
  perPage,
  sortOn,
  sortDir,
  match,
}) => {
  let query = [
    { $match: {} },
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "encounters",
        localField: "encounterId",
        foreignField: "_id",
        as: "encounter",
      },
    },
    { $unwind: { path: "$encounter", preserveNullAndEmptyArrays: true } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: perPage }],
      },
    },
  ];

  if (match) {
    query.unshift({
      $match: {
        $or: [
          { primaryInsurance: { $regex: match, $options: "i" } },
          { secondaryInsurance: { $regex: match, $options: "i" } },
        ],
      },
    });
  }

  if (sortOn && sortDir) {
    let sort = {};
    sort[sortOn] = sortDir === "desc" ? -1 : 1;
    query.push({ $sort: sort });
  }

  const claims = await Claim.aggregate(query);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("CMS-1500 Claims");

  worksheet.columns = [
    { header: "Patient ID", key: "patientId" },
    { header: "Encounter ID", key: "encounterId" },
    { header: "Claim Date", key: "claimDate" },
    // Add other columns based on the CMS-1500 format
  ];

  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      let cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  claims[0].data.forEach((claim) => {
    worksheet.addRow({
      patientId: claim.patientId,
      encounterId: claim.encounterId,
      claimDate: claim.claimDate
        ? claim.claimDate.toISOString().split("T")[0]
        : "",
      // Add other fields
    });
  });

  return { workbook };
};

exports.getAgingDataExcel = async () => {
  const claims = await Claim.find(); // Adjust this query based on how you determine aging data
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Aging Data");

  worksheet.columns = [
    { header: "Patient ID", key: "patientId" },
    { header: "Claim ID", key: "claimId" },
    // Add other columns as necessary
  ];

  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      let cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  claims.forEach((claim) => {
    worksheet.addRow({
      patientId: claim.patientId,
      claimId: claim._id,
      // Add other fields as necessary
    });
  });

  return { workbook };
};

const updateClaimAndDetails = async (
  claimId,
  updateFields,
  detailUpdateFields
) => {
  // Update the claim entry
  const updatedClaim = await Claim.findByIdAndUpdate(claimId, updateFields, {
    new: true,
  });

  if (!updatedClaim) {
    return null;
  }

  // Update the claim detail entries
  const updatedClaimDetails = await ClaimDetail.updateMany(
    { encounterId: updatedClaim.encounterId },
    detailUpdateFields,
    { new: true }
  );

  return { updatedClaim, updatedClaimDetails };
};

exports.updatePrimaryClaimDenial = async (id, data) => {
  const updateFields = {
    primaryDenialCode: data.denial_code,
    primaryDenialReason: data.denial_reason,
    primaryPaymentAmount: 0,
    updatedBy: data.updatedBy,
  };

  const detailUpdateFields = {
    primaryDenialCode: data.denial_code,
    primaryDenialReason: data.denial_reason,
    primaryPaymentAmount: 0,
  };

  return await updateClaimAndDetails(id, updateFields, detailUpdateFields);
};

exports.updateSecondaryClaimDenial = async (id, data) => {
  const updateFields = {
    secondaryDenialCode: data.denial_code,
    secondaryDenialReason: data.denial_reason,
    secondaryPaymentAmount: 0,
    updatedBy: data.updatedBy,
  };

  const detailUpdateFields = {
    secondaryDenialCode: data.denial_code,
    secondaryDenialReason: data.denial_reason,
    secondaryPaymentAmount: 0,
  };

  return await updateClaimAndDetails(id, updateFields, detailUpdateFields);
};

exports.updateTertiaryClaimDenial = async (id, data) => {
  const updateFields = {
    tertiaryDenialCode: data.denial_code,
    tertiaryDenialReason: data.denial_reason,
    tertiaryPaymentAmount: 0,
    updatedBy: data.updatedBy,
  };

  const detailUpdateFields = {
    tertiaryDenialCode: data.denial_code,
    tertiaryDenialReason: data.denial_reason,
    tertiaryPaymentAmount: 0,
  };

  return await updateClaimAndDetails(id, updateFields, detailUpdateFields);
};

exports.getClaimByEncounterId = async(id)=>{
  return await Claim.findOne({
    encounterId: id,
  });
}

exports.updateClaimById = async(id,totalChargeAmount)=>{
  return await Claim.findByIdAndUpdate(
    id,
    { chargeAmount: totalChargeAmount },
    { new: true }
  );
}

exports.createClaimTotalAmount = async(id,patientId,totalChargeAmount)=>{
  const newClaim = new Claim({
    encounterId: id,
    patientId: patientId,
    chargeAmount: totalChargeAmount,
  });
  await newClaim.save();

  return newClaim;
}

