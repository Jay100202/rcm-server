var PlaceOfService = require("../models/placeOfService.model");

exports.placeOfServiceList = async(req)=>{
        return await PlaceOfService.find();
}

exports.getSelectPlaceOfServiceList = async function(req){
   
    // Options setup for the mongoose paginate
    const populateOptions = [
        {
            path : 'timeZoneOption',
        },
    ];

    const projectObj = {
        '_id': '$_id',
        'id': '$_id',
        'text': '$name',
    };

    const sortOptions = {};
    sortOptions.textI = 1;

    let fetchOptions = {};

    try {
        var consortiumLocations = await PlaceOfService.aggregate([ { $match: fetchOptions } ])
                                    .project(projectObj)
                                    .sort(sortOptions);
                                
            consortiumLocations = await PlaceOfService.populate(consortiumLocations, populateOptions);

            consortiumLocations.forEach(function(v){
                        delete v.textI;
                        delete v._id;
                    });

        return consortiumLocations;
    } catch (e) {
        throw Error('Error while Paginating Place Of Service ' + e)
    }
}