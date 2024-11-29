var ConsortiumPatient = require('../models/consortiumPatient.model');
var ConsortiumService = require('./consortium.service');
var AppConfig = require('../appconfig');
var AppUploadService = require('./appUpload.service');
var AppCommonService = require('./appcommon.service');
var AppConfigConst = require('../appconfig-const');
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var moment = require('moment');
var momentTZ = require('moment-timezone');
 
// Saving the context of this module inside the _the variable
_this = this

// Async function to add ConsortiumPatient
exports.saveConsortiumPatient = async function(req,consortiumPatient)
{
    const currTs = await AppCommonService.getCurrentTimestamp();

    let modConsortiumPatient = null;
    if(mongodb.ObjectId.isValid(consortiumPatient.id))
    {
        try
        {
            modConsortiumPatient = await ConsortiumPatient.findById(consortiumPatient.id);
        }
        catch(e){
            throw Error("Error occured while Finding the ConsortiumPatient")
        }
    }

    let isAdd = false;
    if(!modConsortiumPatient){
        modConsortiumPatient = new ConsortiumPatient();
        modConsortiumPatient.createdAt = currTs;
       
        if(consortiumPatient.createdBySystemUser !== undefined)
        modConsortiumPatient.createdBySystemUser = consortiumPatient.createdBySystemUser

        if(consortiumPatient.createdByConsortiumUser !== undefined)
        modConsortiumPatient.createdByConsortiumUser = consortiumPatient.createdByConsortiumUser

     
        let genConsortiumPatientId;
        if(consortiumPatient.patientId !== undefined)
        {
            genConsortiumPatientId = consortiumPatient.patientId;
        }
        else
        {
            genConsortiumPatientId = await AppCommonService.generateConsortiumPatientId(consortiumPatient.consortium);
        }

        modConsortiumPatient.patientId = genConsortiumPatientId;
        
        modConsortiumPatient.patientIdStr = AppCommonService.getConsortiumPatientIdWithPrefix(genConsortiumPatientId);

        isAdd = true;
    }


    modConsortiumPatient.updatedAt = currTs;
   
    if(consortiumPatient.updatedBySystemUser !== undefined)
    modConsortiumPatient.updatedBySystemUser = consortiumPatient.updatedBySystemUser

    if(consortiumPatient.updatedByConsortiumUser !== undefined)
    modConsortiumPatient.updatedByConsortiumUser = consortiumPatient.updatedByConsortiumUser

    if(consortiumPatient.consortium !== undefined)
    modConsortiumPatient.consortium = consortiumPatient.consortium

    if(consortiumPatient.salutation !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatient.salutation))
        {
            modConsortiumPatient.salutation = consortiumPatient.salutation;
        }
        else
        {
            modConsortiumPatient.salutation = null;
        }
    }

    if(consortiumPatient.fullName !== undefined)
    modConsortiumPatient.fullName = consortiumPatient.fullName

    if(consortiumPatient.firstName !== undefined)
    modConsortiumPatient.firstName = consortiumPatient.firstName

    if(consortiumPatient.middleName !== undefined)
    modConsortiumPatient.middleName = consortiumPatient.middleName

    if(consortiumPatient.lastName !== undefined)
    modConsortiumPatient.lastName = consortiumPatient.lastName

    if(consortiumPatient.birthDate !== undefined)
    {
        modConsortiumPatient.birthDate = consortiumPatient.birthDate;

        let birthDateStr = '';
        if(modConsortiumPatient.birthDate && modConsortiumPatient.birthDate !== '')
        {
            var tzStr = await AppCommonService.getTimezoneStrFromRequest(req);
            const birthDateObj = momentTZ.unix(modConsortiumPatient.birthDate).tz(tzStr);
            birthDateStr = birthDateObj.format('YYYYMMDD');
        }
        modConsortiumPatient.birthDateStr = birthDateStr;
    }


    if(consortiumPatient.householdHeadName !== undefined)
    modConsortiumPatient.householdHeadName = consortiumPatient.householdHeadName

    if(consortiumPatient.mrNumber !== undefined)
    modConsortiumPatient.mrNumber = consortiumPatient.mrNumber

    if(consortiumPatient.physicianName !== undefined)
    modConsortiumPatient.physicianName = consortiumPatient.physicianName

    if(consortiumPatient.primaryCarePhysicianName !== undefined)
    modConsortiumPatient.primaryCarePhysicianName = consortiumPatient.primaryCarePhysicianName

    if(consortiumPatient.refferingPhysicianName !== undefined)
    modConsortiumPatient.refferingPhysicianName = consortiumPatient.refferingPhysicianName

    if(consortiumPatient.address !== undefined)
    modConsortiumPatient.address = consortiumPatient.address

    if(consortiumPatient.email !== undefined)
    modConsortiumPatient.email = consortiumPatient.email

    if(consortiumPatient.emergencyContactPersonName !== undefined)
    modConsortiumPatient.emergencyContactPersonName = consortiumPatient.emergencyContactPersonName

    if(consortiumPatient.emergencyContactPersonRelationship !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatient.emergencyContactPersonRelationship))
        {
            modConsortiumPatient.emergencyContactPersonRelationship = consortiumPatient.emergencyContactPersonRelationship;
        }
        else
        {
            modConsortiumPatient.emergencyContactPersonRelationship = null;
        }
    }
   

    if(consortiumPatient.emergencyContactPersonNumber !== undefined)
    modConsortiumPatient.emergencyContactPersonNumber = consortiumPatient.emergencyContactPersonNumber


    if(consortiumPatient.gender !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatient.gender))
        {
            modConsortiumPatient.gender = consortiumPatient.gender;
        }
        else
        {
            modConsortiumPatient.gender = null;
        }
    }

    if(consortiumPatient.description !== undefined)
    modConsortiumPatient.description = consortiumPatient.description

    if(consortiumPatient.primaryInsurancePlanName !== undefined)
    modConsortiumPatient.primaryInsurancePlanName = consortiumPatient.primaryInsurancePlanName

    if(consortiumPatient.primaryInsuranceGroupNumber !== undefined)
    modConsortiumPatient.primaryInsuranceGroupNumber = consortiumPatient.primaryInsuranceGroupNumber

    if(consortiumPatient.primaryInsuranceSubscriberID !== undefined)
    modConsortiumPatient.primaryInsuranceSubscriberID = consortiumPatient.primaryInsuranceSubscriberID

    if(consortiumPatient.primaryInsuranceCarrier !== undefined)
    modConsortiumPatient.primaryInsuranceCarrier = consortiumPatient.primaryInsuranceCarrier

    if(consortiumPatient.primaryInsurancePolicyNumber !== undefined)
        modConsortiumPatient.primaryInsurancePolicyNumber = consortiumPatient.primaryInsurancePolicyNumber

    if(consortiumPatient.primaryInsurancePerson !== undefined)
    modConsortiumPatient.primaryInsurancePerson = consortiumPatient.primaryInsurancePerson


    if(consortiumPatient.primaryInsuranceRelationshipToInsured !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatient.primaryInsuranceRelationshipToInsured))
        {
            modConsortiumPatient.primaryInsuranceRelationshipToInsured = consortiumPatient.primaryInsuranceRelationshipToInsured;
        }
        else
        {
            modConsortiumPatient.primaryInsuranceRelationshipToInsured = null;
        }
    }

    if(consortiumPatient.primaryInsuranceSpecialProgramCode !== undefined)
    modConsortiumPatient.primaryInsuranceSpecialProgramCode = consortiumPatient.primaryInsuranceSpecialProgramCode

    if(consortiumPatient.primaryIssueDate !== undefined)
    modConsortiumPatient.primaryIssueDate = consortiumPatient.primaryIssueDate

    if(consortiumPatient.primaryExpirationDate !== undefined)
    modConsortiumPatient.primaryExpirationDate = consortiumPatient.primaryExpirationDate

    if(consortiumPatient.copayAmount !== undefined)
    modConsortiumPatient.copayAmount = consortiumPatient.copayAmount

    if(consortiumPatient.primaryBenefitSandNotes !== undefined)
    modConsortiumPatient.primaryBenefitSandNotes = consortiumPatient.primaryBenefitSandNotes

    if(consortiumPatient.secondaryInsurancePlanName !== undefined)
    modConsortiumPatient.secondaryInsurancePlanName = consortiumPatient.secondaryInsurancePlanName

    if(consortiumPatient.secondaryGroupNumber !== undefined)
    modConsortiumPatient.secondaryGroupNumber = consortiumPatient.secondaryGroupNumber

    if(consortiumPatient.secondarySubscriberID !== undefined)
    modConsortiumPatient.secondarySubscriberID = consortiumPatient.secondarySubscriberID

    if(consortiumPatient.secondaryInsuranceCarrier !== undefined)
    modConsortiumPatient.secondaryInsuranceCarrier = consortiumPatient.secondaryInsuranceCarrier

    if(consortiumPatient.secondaryInsurancePolicyNumber !== undefined)
        modConsortiumPatient.secondaryInsurancePolicyNumber = consortiumPatient.secondaryInsurancePolicyNumber

    if(consortiumPatient.secondaryInsuredPerson !== undefined)
    modConsortiumPatient.secondaryInsuredPerson = consortiumPatient.secondaryInsuredPerson

    if(consortiumPatient.secondaryRelationshipToInsured !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatient.secondaryRelationshipToInsured))
        {
            modConsortiumPatient.secondaryRelationshipToInsured = consortiumPatient.secondaryRelationshipToInsured;
        }
        else
        {
            modConsortiumPatient.secondaryRelationshipToInsured = null;
        }
    }

    if(consortiumPatient.secondaryIssueDate !== undefined)
    modConsortiumPatient.secondaryIssueDate = consortiumPatient.secondaryIssueDate

    if(consortiumPatient.secondaryExpirationDate !== undefined)
    modConsortiumPatient.secondaryExpirationDate = consortiumPatient.secondaryExpirationDate

    if(consortiumPatient.crossoverClaim !== undefined)
    modConsortiumPatient.crossoverClaim = consortiumPatient.crossoverClaim

    if(consortiumPatient.secondaryBenefitSandNotes !== undefined)
    modConsortiumPatient.secondaryBenefitSandNotes = consortiumPatient.secondaryBenefitSandNotes

    if(consortiumPatient.tertiaryPlanName !== undefined)
    modConsortiumPatient.tertiaryPlanName = consortiumPatient.tertiaryPlanName

    if(consortiumPatient.tertiaryGroupNumber !== undefined)
    modConsortiumPatient.tertiaryGroupNumber = consortiumPatient.tertiaryGroupNumber

    if(consortiumPatient.tertiarySubscriberID !== undefined)
    modConsortiumPatient.tertiarySubscriberID = consortiumPatient.tertiarySubscriberID

    if(consortiumPatient.tertiaryInsuranceCarrier !== undefined)
    modConsortiumPatient.tertiaryInsuranceCarrier = consortiumPatient.tertiaryInsuranceCarrier

    if(consortiumPatient.tertiaryInsurancePolicyNumber !== undefined)
        modConsortiumPatient.tertiaryInsurancePolicyNumber = consortiumPatient.tertiaryInsurancePolicyNumber

    if(consortiumPatient.tertiaryInsuredPerson !== undefined)
    modConsortiumPatient.tertiaryInsuredPerson = consortiumPatient.tertiaryInsuredPerson

    if(consortiumPatient.tertiaryRelationshipToInsured !== undefined)
    {
        if(mongodb.ObjectId.isValid(consortiumPatient.tertiaryRelationshipToInsured))
        {
            modConsortiumPatient.tertiaryRelationshipToInsured = consortiumPatient.tertiaryRelationshipToInsured;
        }
        else
        {
            modConsortiumPatient.tertiaryRelationshipToInsured = null;
        }
    }

    if(consortiumPatient.tertiaryIssueDate !== undefined)
    modConsortiumPatient.tertiaryIssueDate = consortiumPatient.tertiaryIssueDate

    if(consortiumPatient.tertiaryExpirationDate !== undefined)
    modConsortiumPatient.tertiaryExpirationDate = consortiumPatient.tertiaryExpirationDate

    if(consortiumPatient.tertiaryBenefitSandNotes !== undefined)
    modConsortiumPatient.tertiaryBenefitSandNotes = consortiumPatient.tertiaryBenefitSandNotes

    if(consortiumPatient.consulatation !== undefined)
    modConsortiumPatient.consulatation = consortiumPatient.consulatation

    if(consortiumPatient.followUp !== undefined)
    modConsortiumPatient.followUp = consortiumPatient.followUp

    if(consortiumPatient.proceduresNotes !== undefined)
    modConsortiumPatient.proceduresNotes = consortiumPatient.proceduresNotes

    if(consortiumPatient.labRecords !== undefined)
    modConsortiumPatient.labRecords = consortiumPatient.labRecords

    if(consortiumPatient.immunizationAndVaccineRecords !== undefined)
    modConsortiumPatient.immunizationAndVaccineRecords = consortiumPatient.immunizationAndVaccineRecords

    if(consortiumPatient.specialProgramCode !== undefined)
    modConsortiumPatient.specialProgramCode = consortiumPatient.specialProgramCode

    if(consortiumPatient.hasPolicyIsCapitated !== undefined)
    modConsortiumPatient.hasPolicyIsCapitated = consortiumPatient.hasPolicyIsCapitated

    if(consortiumPatient.hasCollectCoinsurance !== undefined)
    modConsortiumPatient.hasCollectCoinsurance = consortiumPatient.hasCollectCoinsurance

    if(consortiumPatient.attachments !== undefined)
    modConsortiumPatient.attachments = consortiumPatient.attachments

    if(consortiumPatient.isActive !== undefined)
    modConsortiumPatient.isActive = consortiumPatient.isActive

    if(consortiumPatient.isDeleted !== undefined)
    modConsortiumPatient.isDeleted = consortiumPatient.isDeleted


    try{
        var savedConsortiumPatient = await modConsortiumPatient.save();
        if(savedConsortiumPatient)
        {
            await ConsortiumService.recalculateConsortiumCount(savedConsortiumPatient.consortium);
        }
        return savedConsortiumPatient;
    }catch(e){
        throw Error("And Error occured while updating the ConsortiumPatient "+ e);
    }
}

// Async function to get the ConsortiumPatients List
exports.getConsortiumPatients = async function(req)
{
    var filKeyword =  req.body.filKeyword;
    var filCreatedBy = req.body.filCreatedBy;
    var filUpdatedBy = req.body.filUpdatedBy;
    var filConsortium =  req.body.filConsortium;
   
    var forExport = req.body.forExport && typeof req.body.forExport === 'boolean' ? req.body.forExport : false;

    var status = req.body.isActive ? req.body.isActive*1 : -1;
    var page = req.body.page ? req.body.page*1 : 1;
    var limit = req.body.length ? req.body.length*1 : 10;
    var searchStr = req.body.searchStr ? req.body.searchStr : '';
    var sortByCol = req.body.sortBy ? req.body.sortBy : 'col1';
    var sortOrder = req.body.sortOrder ? req.body.sortOrder : 'asc';

    var skipVal = req.body.start ? req.body.start*1 : 0;

    if(page && page > 0)
    {
      skipVal = (page - 1) * limit;
    }

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'consortium',
            select : 'consortiumName consortiumId'
        },
        {
            path : 'salutation',
            select : 'salutationText'
        },
        {
            path : 'emergencyContactPersonRelationship',
            select : 'relationshipName'
        },
        {
            path : 'gender',
            select : 'genderName'
        },
        {
            path : 'primaryInsuranceRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'secondaryRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'tertiaryRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'createdBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'createdByConsortiumUser',
            select : 'userFullName'
        },
        {
            path : 'updatedBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'updatedByConsortiumUser',
            select : 'userFullName'
        },
    ];
    
    const consortiumPatientPrefix = AppCommonService.getConsortiumPatientPrefixText(req);

    const projectObj = {
        '_id': '$_id',
        'patientIdInt': '$patientId',
        'patientId': { '$concat': [ consortiumPatientPrefix, { $substr: ["$patientId", 0, -1 ] } ] },
        'consortium': '$consortium',
        'salutation': '$salutation',
        'fullName': '$fullName',
        'firstName': '$firstName',
        'middleName': '$middleName',
        'lastName': '$lastName',
        'birthDate': '$birthDate',
        'birthDateStr': '$birthDateStr',
        'householdHeadName': '$householdHeadName',
        'mrNumber': '$mrNumber',
        'physicianName': '$physicianName',
        'primaryCarePhysicianName': '$primaryCarePhysicianName',
        'refferingPhysicianName': '$refferingPhysicianName',
        'address': '$address',
        'email': '$email',
        'emergencyContactPersonName': '$emergencyContactPersonName',
        'emergencyContactPersonRelationship': '$emergencyContactPersonRelationship',
        'emergencyContactPersonNumber': '$emergencyContactPersonNumber',
        'gender': '$gender',
        'description': '$description',
        'isActive': '$isActive',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'createdBySystemUser': '$createdBySystemUser',
        'updatedBySystemUser': '$updatedBySystemUser'
    };

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
 
    if(isConsortiumUserRequest === true)
    {
        if(consortiumUser)
        {
            let consortiumId = consortiumUser.consortium;
            if(mongodb.ObjectId.isValid(consortiumId)) {
                fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumId);
            }
        }
    }

    if(mongodb.ObjectId.isValid(filConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
    }


    if(mongodb.ObjectId.isValid(filCreatedBy)) {
        fetchOptions['createdBySystemUser'] = new mongoose.Types.ObjectId(filCreatedBy);
    }

    if(filUpdatedBy != undefined && filUpdatedBy != null)
    {
        if(mongodb.ObjectId.isValid(filUpdatedBy)) {
            fetchOptions.updatedBySystemUser = new mongoose.Types.ObjectId(filUpdatedBy);
        }
    }
    
    if(filKeyword && filKeyword !== undefined && filKeyword !== '')
    {
        searchStr = filKeyword;
    }

    if(searchStr && searchStr !== "")
    {
        var regex = new RegExp(searchStr, "i");

        let searchKeywordOptions = [];
        searchKeywordOptions.push({ 'fullName' : regex });
        searchKeywordOptions.push({ 'firstName' : regex });
        searchKeywordOptions.push({ 'middleName' : regex });
        searchKeywordOptions.push({ 'lastName' : regex });
        searchKeywordOptions.push({ 'householdHeadName' : regex });
        searchKeywordOptions.push({ 'mrNumber' : regex });
        searchKeywordOptions.push({ 'physicianName' : regex });
        searchKeywordOptions.push({ 'email' : regex });


        let allOtherFetchOptions = [];
        Object.keys(fetchOptions).forEach(function(k){
            allOtherFetchOptions.push({ [k] :fetchOptions[k] });
        });
        allOtherFetchOptions.push({ '$or' : searchKeywordOptions });

        let complexFetchOptions = {
          '$and' : allOtherFetchOptions
        };

        fetchOptions = complexFetchOptions;
    }

    let sortOrderInt = 1;
    if(sortOrder && sortOrder === "asc") {
      sortOrderInt = 1;
    } else if(sortOrder && sortOrder === "desc") {
      sortOrderInt = -1;
    }

    let sortOptions;
    if(sortByCol && typeof sortByCol === 'string') {

        if(isConsortiumUserRequest === true)
        {
            if(sortByCol == 'col1') {
                sortOptions = {
                    patientIdInt: sortOrderInt
                };
            }
            else if(sortByCol == 'col2') {
                sortOptions = {
                    fullName: sortOrderInt
                };
            }
            else if(sortByCol == 'col3') {
                sortOptions = {
                    birthDate: sortOrderInt
                };
            }
            else if(sortByCol == 'col4') {
                sortOptions = {
                    createdAt: sortOrderInt
                };
            }
            else if(sortByCol == AppConfigConst.MAT_COLUMN_NAME_STATUS) {
                sortOptions = {
                    isActive: sortOrderInt
                };
            }
        }
        else
        {
            if(sortByCol == 'col1') {
                sortOptions = {
                    patientIdInt: sortOrderInt
                };
            }
            else if(sortByCol == 'col2') {
                sortOptions = {
                    fullName: sortOrderInt
                };
            }
            else if(sortByCol == 'col3') {
                sortOptions = {
                    birthDate: sortOrderInt
                };
            }
            else if(sortByCol == 'col4') {
                sortOptions = {
                    createdAt: sortOrderInt
                };
            }
            else if(sortByCol == AppConfigConst.MAT_COLUMN_NAME_STATUS) {
                sortOptions = {
                    isActive: sortOrderInt
                };
            }
        }
        
    }
    else {
        sortOptions = {
            patientIdInt: sortOrderInt
        };
    }

    try 
    {
        let consortiumPatients;
        if(forExport === true)
        {
            consortiumPatients = await ConsortiumPatient.aggregate([
                          {
                              $match: fetchOptions // For Fetch
                          }
                    ])
                    .project(projectObj)
                    .sort(sortOptions);
        }
        else
        {
            consortiumPatients = await ConsortiumPatient.aggregate([
                        
                            {
                                $match: fetchOptions // For Fetch
                            }
                    ])
                    .project(projectObj)
                    .sort(sortOptions)
                    .skip(skipVal)
                    .limit(limit);
        }

        consortiumPatients = await ConsortiumPatient.populate(consortiumPatients, populateOptions);

        let recordCntData =  await ConsortiumPatient.aggregate([
                                            {
                                                $match: fetchOptions
                                            },
                                            {
                                                $group: { _id: null, count: { $sum: 1 } }
                                            }
                                            ]);

        let totalRecords = 0;

        if(recordCntData && recordCntData[0] && recordCntData[0].count) {
            totalRecords = recordCntData[0].count;
        }

        let filteredRecords = totalRecords;

        let response = {
            results: consortiumPatients,
            totalRecords: totalRecords,
            filteredRecords: filteredRecords
        };

        return response;

    } 
    catch (e) 
    {
        throw Error('Error while Paginating ConsortiumPatient ' + e)
    }
}


exports.getConsortiumPatientsForSelect = async function(req,onlyActiveStatus){

    var filConsortium =  req.body.filConsortium;
   
    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$fullName',
        'textI': { '$toLower': '$fullName' }
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    if(onlyActiveStatus && onlyActiveStatus == 1)
    {
        fetchOptions.isActive =  1;
    }

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

    if(isConsortiumUserRequest === true)
    {
        if(consortiumUser)
        {
            let consortiumId = consortiumUser.consortium;
            if(mongodb.ObjectId.isValid(consortiumId)) {
                fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumId);
            }
        }
    }


    if(mongodb.ObjectId.isValid(filConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
    }

    try {
        var consortiumPatient = await ConsortiumPatient.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
        
            consortiumPatient.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumPatient;
    } catch (e) {
        throw Error('Error while Paginating ConsortiumPatient ' + e)
    }
}

exports.getFilteredConsortiumPatientsForSelect = async function(req,searchByCode, searchStr){
    var filConsortium =  req.body.filConsortium;
   
    const consortiumPatientPrefix = AppCommonService.getConsortiumPatientPrefixText();
   
    const projectObj = {
        '_id': '$_id',
        'patientIdInt': '$patientId',
        'patientId': { '$concat': [ consortiumPatientPrefix, { $substr: ["$patientId", 0, -1 ] } ] },
        'consortium': '$consortium',
        'salutation': '$salutation',
        'fullName': '$fullName',
        'firstName': '$firstName',
        'middleName': '$middleName',
        'lastName': '$lastName',
        'birthDate': '$birthDate',
        'birthDateStr': '$birthDateStr',
        'householdHeadName': '$householdHeadName',
        'mrNumber': '$mrNumber',
        'physicianName': '$physicianName',
        'primaryCarePhysicianName': '$primaryCarePhysicianName',
        'refferingPhysicianName': '$refferingPhysicianName',
        'address': '$address',
        'email': '$email',
        'emergencyContactPersonName': '$emergencyContactPersonName',
        'emergencyContactPersonRelationship': '$emergencyContactPersonRelationship',
        'emergencyContactPersonNumber': '$emergencyContactPersonNumber',
        'gender': '$gender',
        'description': '$description',
        'isActive': '$isActive',
        'createdAt': '$createdAt',
        'updatedAt': '$updatedAt',
        'createdBySystemUser': '$createdBySystemUser',
        'updatedBySystemUser': '$updatedBySystemUser'
     };

    const populateOptions = [
        {
            path : 'consortium',
            select : 'consortiumName consortiumId'
        },
        {
            path : 'salutation',
            select : 'salutationText'
        },
        {
            path : 'emergencyContactPersonRelationship',
            select : 'relationshipName'
        },
        {
            path : 'gender',
            select : 'genderName'
        },
        {
            path : 'primaryInsuranceRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'secondaryRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'tertiaryRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'createdBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'createdByConsortiumUser',
            select : 'userFullName'
        },
        {
            path : 'updatedBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'updatedByConsortiumUser',
            select : 'userFullName'
        },
    ];

    const sortOptions = {};
    sortOptions.textI = 1;

    let secFetchOptions = {};

    let fetchOptions = {};
    fetchOptions.isDeleted =  0;
    fetchOptions.isActive =  1;

    var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);
    var consortiumUser = await AppCommonService.getConsortiumUserFromRequest(req);

    if(isConsortiumUserRequest === true)
    {
        if(consortiumUser)
        {
            let consortiumId = consortiumUser.consortium;
            if(mongodb.ObjectId.isValid(consortiumId)) {
                fetchOptions.consortium = new mongoose.Types.ObjectId(consortiumId);
            }
        }
    }

    if(mongodb.ObjectId.isValid(filConsortium)) {
        fetchOptions.consortium = new mongoose.Types.ObjectId(filConsortium);
    }

    var regex = new RegExp(searchStr, "i");

    // if(searchByCode === AppConfigConst.PATIENT_SEARCH_BY_CODE_CONTACT_NO)
    // {
    //     fetchOptions.emergencyContactPersonNumber = regex;
    // }
    

    if(searchByCode === AppConfigConst.PATIENT_SEARCH_BY_CODE_PATIENT_ID)
    {
        secFetchOptions.patientId = regex;
    }
    else if(searchByCode === AppConfigConst.PATIENT_SEARCH_BY_CODE_PATIENT_NAME)
    {
        let searchKeywordOptions = [];
        searchKeywordOptions.push({ 'fullName' : regex });
        searchKeywordOptions.push({ 'firstName' : regex });
        searchKeywordOptions.push({ 'middleName' : regex });
        searchKeywordOptions.push({ 'lastName' : regex });

        let complexFetchOptions = {
          '$or' : searchKeywordOptions
        };

        secFetchOptions = complexFetchOptions;
    }
    else if(searchByCode === AppConfigConst.PATIENT_SEARCH_BY_CODE_ALL_PATIENT_PARAMS)
    {
        let searchKeywordOptions = [];
        searchKeywordOptions.push({ 'patientId' : regex });
        searchKeywordOptions.push({ 'fullName' : regex });
        searchKeywordOptions.push({ 'firstName' : regex });
        searchKeywordOptions.push({ 'middleName' : regex });
        searchKeywordOptions.push({ 'lastName' : regex });

        let complexFetchOptions = {
          '$or' : searchKeywordOptions
        };

        secFetchOptions = complexFetchOptions;
    }

    try {
        var consortiumPatients;

        consortiumPatients = await ConsortiumPatient.aggregate([ { $match: fetchOptions } ])
                            .project(projectObj)
                            .match(secFetchOptions)
                            .sort(sortOptions);

        consortiumPatients = await ConsortiumPatient.populate(consortiumPatients, populateOptions);
                                
        consortiumPatients.forEach(function(v){
                    delete v.textI;
                    v.ageStr = AppCommonService.getAgeStrFromDOB(v.birthDate);
                });

        return consortiumPatients;
    } catch (e) {
        throw Error('Error while Paginating patients ' + e)
    }

}

exports.findConsortiumPatientById = async function(req, consortiumPatientId){
    
     const populateOptions = [
        {
            path : 'consortium',
            select : 'consortiumName consortiumId'
        },
        {
            path : 'salutation',
            select : 'salutationText'
        },
        {
            path : 'emergencyContactPersonRelationship',
            select : 'relationshipName'
        },
        {
            path : 'gender',
            select : 'genderName'
        },
        {
            path : 'primaryInsuranceRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'secondaryRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'tertiaryRelationshipToInsured',
            select : 'relationshipName'
        },
        {
            path : 'createdBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'createdByConsortiumUser',
            select : 'userFullName'
        },
        {
            path : 'updatedBySystemUser',
            select : 'userFullName'
        },
        {
            path : 'updatedByConsortiumUser',
            select : 'userFullName'
        },
    ];
    
     var options = {
         _id : consortiumPatientId,
         isDeleted : 0
     };

     var isConsortiumUserRequest = await AppCommonService.getIsRequestFromConsortiumUser(req);

     if(isConsortiumUserRequest === true)
     {
         let sessConsortiumLocationId = await AppCommonService.getConsortiumLocationIdFromRequest(req);
 
         if(mongodb.ObjectId.isValid(sessConsortiumLocationId))
         {
             options.consortiumLocation = new mongoose.Types.ObjectId(sessConsortiumLocationId);
         }
     }
 
     try {
        var consortiumPatient;
        if(mongodb.ObjectId.isValid(consortiumPatientId))
        {
            var consortiumPatient = await ConsortiumPatient.findOne(options).populate(populateOptions);
            consortiumPatient = JSON.parse(JSON.stringify(consortiumPatient));
            consortiumPatient.patientId = AppCommonService.getConsortiumPatientIdWithPrefix(consortiumPatient.patientId);

            // let attachments = consortiumPatient.attachments;
            // if(attachments && attachments.length > 0)
            // {
            //     await Promise.all(attachments.map(async (attachment, attIndex) => {

            //         if(attachment.isImage === true)
            //         {
            //             let attImageUrl = AppUploadService.getConsortiumPatientAttachmentUrlFromPath(consortiumPatient.consortium,attachment.attFilePathActual);
            //             let attThumbImageUrl = AppUploadService.getConsortiumPatientAttachmentUrlFromPath(consortiumPatient.consortium,attachment.attFilePathThumb);
            
            //             attachment.attImageUrl = attImageUrl;
            //             attachment.attThumbImageUrl = attThumbImageUrl;
            //         }
            //         else
            //         {
            //             let attFileUrl = AppUploadService.getConsortiumPatientAttachmentUrlFromPath(consortiumPatient.consortium,attachment.attFilePath);
            
            //             attachment.attFileUrl = attFileUrl;                        
            //         }
            //     }));
            // }
        }
        return consortiumPatient;
     } catch (e) {
         throw Error('Error while Fetching ConsortiumPatient' + e)
     }
}


exports.getConsortiumPatientCountByConsortiumId = async function(consortiumId){
    
    var options = {
        consortium : consortiumId,
        isDeleted : 0,
        isActive : 1,
    };

    try {
       var consortiumPatientCount;
       if(mongodb.ObjectId.isValid(consortiumId))
       {
           consortiumPatientCount = await ConsortiumPatient.find(options).count();
       }
       return consortiumPatientCount;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatient' + e)
    }
}


exports.checkIfConsortiumPatientUsesConsortium = async function(id) {
    var options = {
        isDeleted: 0,
        consortium: id
    };

    try {
        var consortiumPatient = await ConsortiumPatient.findOne(options);
        return consortiumPatient;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatient ' + e)
    }
}


exports.getCurrentHighestConsortiumPatientId = async function(consortiumId){

	let selectArr = [ 'patientId' ];

    let sortOptions = {
    	patientId: -1
	};

    var options = {
        isDeleted : 0,
        consortium : new mongoose.Types.ObjectId(consortiumId),
    };

    try {
        let highestConsortiumPatientId = 0;
        var consortiumPatient = await ConsortiumPatient.findOne(options).sort(sortOptions).select(selectArr);
        if(consortiumPatient) {
            highestConsortiumPatientId = consortiumPatient.patientId;
        }
      return highestConsortiumPatientId;
    } catch (e) {
        throw Error('Error while Fetching consortiumPatient' + e)
    }
}


exports.getConsortiumPatientListByName = async function(fullName) {
    var options = {
        fullName : new RegExp(`^${fullName}$`, 'i'),
        isDeleted: 0
    };

    try {
        var consortiumPatient = await ConsortiumPatient.find(options);
        return consortiumPatient;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatient ' + e)
    }
}



exports.getConsortiumPatientListByIdString = async function(patientIdStr,consortiumId) {
    var options = {
        patientIdStr : patientIdStr,
        consortium :  new mongoose.Types.ObjectId(consortiumId),
        isDeleted: 0
    };

    try {
        var consortiumPatients = [];
        if(mongodb.ObjectId.isValid(consortiumId))
        {
            consortiumPatients = await ConsortiumPatient.find(options);
        }
        return consortiumPatients;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatient ' + e)
    }
}


exports.updateConsortiumPatientId = async function() {
    var options = {
        isDeleted: 0
    };

    try {
        let consortiumPatientList = [];
        var consortiumPatients = await ConsortiumPatient.find(options);
        if(consortiumPatients && consortiumPatients.length > 0)
        {
            await Promise.all((consortiumPatients).map(async (consortiumPatient, consortiumPatientIndex) => {
                consortiumPatient.patientIdStr = AppCommonService.getConsortiumPatientIdWithPrefix(consortiumPatient.patientId);
                let savedConsortiumPatient = await consortiumPatient.save();
                consortiumPatientList[consortiumPatientIndex] = savedConsortiumPatient;
            }));
        }
        return consortiumPatientList;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatient ' + e)
    }
}

exports.checkIfConsortiumPatientUsesRelationship = async function(id) {
    var options = {
        isDeleted: 0,
        $or: [ { emergencyContactPersonRelationship: new mongoose.Types.ObjectId(id) }, { primaryInsuranceRelationshipToInsured: new mongoose.Types.ObjectId(id) }, { secondaryRelationshipToInsured: new mongoose.Types.ObjectId(id) }, { tertiaryRelationshipToInsured: new mongoose.Types.ObjectId(id) } ]
    };

    try {
        var consortiumPatient;
        if(mongodb.ObjectId.isValid(id))
        {
            consortiumPatient = await ConsortiumPatient.findOne(options);
        }
        return consortiumPatient;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatient ' + e)
    }
}


exports.checkIfConsortiumPatientUsesSalutation = async function(id) {
    var options = {
        isDeleted: 0,
        salutation: new mongoose.Types.ObjectId(id),
    };

    try {
        var consortiumPatient;
        if(mongodb.ObjectId.isValid(id))
        {
            consortiumPatient = await ConsortiumPatient.findOne(options);
        }
        return consortiumPatient;
    } catch (e) {
        throw Error('Error while Fetching ConsortiumPatient ' + e)
    }
}