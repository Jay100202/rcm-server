const Encounter = require("../models/encounter.model");
const ExcelJS = require("exceljs");

exports.createEncounter = async (req,system) => {
      const {
        patientId,
        eNo,
        eDate,
        eStatus,
        dateOfService,
        physician,
        typeOfVisit,
        adminDate,
        medicalAssitant,
        billingPhysician,
        billingStatus,
        copayCollected,
        facilityId,
        isActive
      } = req.body;
  
      const encounter_data = new Encounter({
        patientId,
        eNo,
        eDate,
        eStatus,
        dateOfService,
        physician,
        typeOfVisit,
        adminDate,
        medicalAssitant,
        billingPhysician,
        billingStatus,
        copayCollected,
        facilityId,
        isActive,
        createdBy: system
      });
      return await encounter_data.save();
  };

exports.getEncounterList = async(req) => {
  let { length, page, sortBy, sortOrder, searchStr } = req.body;
    
        let query = [
          {
            $lookup: {
              from: "patients",
              localField: "patientId",
              foreignField: "_id",
              as: "patientDetail",
            },
          },
          {
            $unwind: {
              path: "$patientDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "physician",
              foreignField: "_id",
              as: "physicianDetail",
            },
          },
          {
            $unwind: {
              path: "$physicianDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "billingPhysician",
              foreignField: "_id",
              as: "billingPhysicianDetail",
            },
          },
          {
            $unwind: {
              path: "$billingPhysicianDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "medicalAssitant",
              foreignField: "_id",
              as: "medicalAssitantDetail",
            },
          },
          {
            $unwind: {
              path: "$medicalAssitantDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "typeOfVisits",
              localField: "typeOfVisit",
              foreignField: "_id",
              as: "typeOfVisitDetail",
            },
          },
          {
            $unwind: {
              path: "$typeOfVisitDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "billingStatuses",
              localField: "billingStatus",
              foreignField: "_id",
              as: "billingStatusDetail",
            },
          },
          {
            $unwind: {
              path: "$billingStatusDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "encounterStatuses",
              localField: "eStatus",
              foreignField: "_id",
              as: "encounterStatusDetail",
            },
          },
          {
            $unwind: {
              path: "$encounterStatusDetail",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $facet: {
              metadata: [{ $count: "total" }],
              data: [{ $skip: 0 }, { $limit: length }],
            },
          },
          {
            $project: {
              total: { $arrayElemAt: ["$metadata.total", 0] },
              data: 1,
            },
          },
        ];
    
        if (searchStr) {
          query.unshift({
            $match: {
              $or: [
                { patientDetail: { $regex: searchStr, $options: "i" } },
                { physicianDetail: { $regex: searchStr, $options: "i" } },
                { billingPhysicianDetail: { $regex: searchStr, $options: "i" } },
                { medicalAssitantDetail: { $regex: searchStr, $options: "i" } },
                { typeOfVisitDetail: { $regex: searchStr, $options: "i" } },
                { billingStatusDetail: { $regex: searchStr, $options: "i" } },
                { encounterStatusDetail: { $regex: searchStr, $options: "i" } },
              ],
            },
          });
        }
    
        if (sortBy && sortOrder) {
          let sort = {};
          sort[sortBy] = sortOrder === "desc" ? -1 : 1;
          query.push({
            $sort: sort,
          });
        } else {
          query.push({
            $sort: {
              createdAt: -1,
            },
          });
        }
    
        return await Encounter.aggregate(query);
}

exports.getEncounterByStatus = async(req)=>{
  let { length, page, sortBy, sortOrder, searchStr } = req.body;
  let status = req.params.status;
    console.log("status",status)
  let query = [
    {
      $match: {
        eStatus: status,
      },
    },
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patientDetail",
      },
    },
    {
      $unwind: {
        path: "$patientDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "physician",
        foreignField: "_id",
        as: "physicianDetail",
      },
    },
    {
      $unwind: {
        path: "$physicianDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "billingPhysician",
        foreignField: "_id",
        as: "billingPhysicianDetail",
      },
    },
    {
      $unwind: {
        path: "$billingPhysicianDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "medicalAssitant",
        foreignField: "_id",
        as: "medicalAssitantDetail",
      },
    },
    {
      $unwind: {
        path: "$medicalAssitantDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "typeofvisits",
        localField: "typeOfVisit",
        foreignField: "_id",
        as: "typeOfVisitDetail",
      },
    },
    {
      $unwind: {
        path: "$typeOfVisitDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "billingStatuses",
        localField: "billingStatus",
        foreignField: "_id",
        as: "billingStatusDetail",
      },
    },
    {
      $unwind: {
        path: "$billingStatusDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "encounterStatuses",
        localField: "eStatus",
        foreignField: "_id",
        as: "encounterStatusDetail",
      },
    },
    {
      $unwind: {
        path: "$encounterStatusDetail",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: 0 }, { $limit: length }],
      },
    },
    {
      $project: {
        total: { $arrayElemAt: ["$metadata.total", 0] },
        data: 1,
      },
    },
  ];

  if (sortBy && sortOrder) {
    let sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    query.push({
      $sort: sort,
    });
  } else {
    query.push({
      $sort: {
        createdAt: -1,
      },
    });
  }

  return await Encounter.aggregate(query);
}

exports.updateEncounter = async(req)=>{
  const id = req.params.id;
  const {
    patientid,
    eno,
    edate,
    estatus,
    date_of_service,
    physician,
    type_of_visit,
    admin_date,
    medical_assistant,
    billing_physician,
    billing_status,
    copay_collected,
  } = req.body;

  // Update encounter data
  const encounterData = await Encounter.findByIdAndUpdate(
    id,
    {
      patientid,
      eno,
      edate,
      estatus,
      date_of_service,
      physician,
      type_of_visit,
      admin_date,
      medical_assistant,
      billing_physician,
      billing_status,
      copay_collected,
    },
    { new: true }
  );

  return encounterData;
}

exports.removeEncounter = async(id,systemUser)=>{
  const encounterData = await Encounter.findByIdAndUpdate(
    id,
    {
      isDeleted: 1,
      updatedBy: systemUser
    },
    { new: true }
  );

  return encounterData;
}