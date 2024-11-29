const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const ConsortiumUserRoleSchema = new mongoose.Schema({
    roleName: { type: String, required: true },
    isActive: { type: Number, default: 1 },
    createdAt: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
    updatedAt: { type: Number },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SystemUser' },
    isDeleted: { type: Number, default: 0 },
});

ConsortiumUserRoleSchema.plugin(mongoosePaginate);
const ConsortiumUserRole = mongoose.model('ConsortiumUserRole', ConsortiumUserRoleSchema, 'consortiumUserRoles');

module.exports = ConsortiumUserRole;

// Models required in the script
const SystemUserSession = require('./models/systemUserSession.model');
const SystemUser = require('./models/systemUser.model');
const SessionType = require('./models/sessionType.model');
const ConsortiumUserSession = require('./models/consortiumUserSession.model');
const ConsortiumUser = require('./models/consortiumUser.model');
const Consortium = require('./models/consortium.model');
const ConsortiumJobType = require('./models/consortiumJobType.model');
const SystemUserRole = require('./models/systemUserRole.model');
const TranscriptorRole = require('./models/transcriptorRole.model');
const SystemUserModuleCategory = require('./models/systemUserModuleCategory.model');
const SystemUserModule = require('./models/systemUserModule.model');

async function insertSampleSystemUserSession() {
    await mongoose.connect('mongodb+srv://websupport:u8ErwzKUq4pWr63I@cluster0.r8rsrlt.mongodb.net/rcm-new?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

    // Insert sample data for TranscriptorRole
    const transcriptorRole = new TranscriptorRole({
        roleName: 'MT+QA',
        roleCode: 'MT-QA',
        isQA: true,
        isMT: true,
        level: 1,
        isActive: 1
    });
    await transcriptorRole.save();

    // Insert sample data for SystemUserRole
    const systemUserRole = new SystemUserRole({
        roleName: 'Admin',
        isActive: 1,
        createdAt: Date.now(),
        createdBy: null,
        updatedAt: Date.now(),
        updatedBy: null,
        isDeleted: 0
    });
    await systemUserRole.save();

    // Insert sample data for SystemUser
    const systemUser = new SystemUser({
        userFullName: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        profilePhotoFilePathThumb: 'path/to/thumb.jpg',
        profilePhotoFilePathActual: 'path/to/actual.jpg',
        profileImageActualUrl: 'http://example.com/actual.jpg',
        profileImageThumbUrl: 'http://example.com/thumb.jpg',
        profileUrlExpiresAt: Date.now() + 3600 * 1000,
        gender: null,
        pseudoName: 'TestPseudo',
        birthDate: Date.now(),
        birthDateStr: '01-01-2000',
        mobileNo: '1234567890',
        alternatePhoneNumber: '0987654321',
        department: null,
        designation: null,
        role: systemUserRole._id,
        transcriptorRole: transcriptorRole._id,
        audioMinutes: 0,
        appLastAccessedAt: Date.now(),
        isActive: 1,
        createdAt: Date.now(),
        createdBy: null,
        updatedAt: Date.now(),
        updatedBy: null,
        isDeleted: 0
    });
    await systemUser.save();

    // Insert sample data for SessionType
    const sessionType = new SessionType({
        sessionTypeName: 'Test Session Type',
        sessionTypeId: 1
    });
    await sessionType.save();

    // Insert sample data for SystemUserSession
    const systemUserSession = new SystemUserSession({
        sessionToken: '7468',
        systemUser: systemUser._id,
        sessionType: sessionType._id,
        messagingToken: 'MessagingToken',
        lastSyncTs: Date.now()
    });
    await systemUserSession.save();

    // Insert sample data for ConsortiumJobType
    const consortiumJobType = new ConsortiumJobType({
        typeText: 'Test Job Type',
        typeCode: 'TJT'
    });
    await consortiumJobType.save();

    // Insert sample data for Consortium
    const consortium = new Consortium({
        consortiumId: 1,
        consortiumName: 'Test Consortium',
        consortiumShortCode: 'TC',
        description: 'This is a test consortium',
        consortiumUserCount: 10,
        consortiumLocationCount: 5,
        consortiumPatientCount: 100,
        consortiumPatientCurrentId: 101,
        consortiumPatientAppointmentCurrentId: 201,
        consortiumChatThreadCurrentId: 301,
        appLastAccessedAt: Date.now(),
        consortiumJobTypes: [consortiumJobType._id],
        isActive: 1,
        createdAt: Date.now(),
        createdBy: systemUser._id,
        updatedAt: Date.now(),
        updatedBy: systemUser._id,
        isDeleted: 0
    });
    await consortium.save();

    // Insert sample data for ConsortiumUserRole
    const consortiumUserRole = new ConsortiumUserRole({
        roleName: 'Consortium Admin',
        isActive: 1,
        createdAt: Date.now(),
        createdBy: systemUser._id,
        updatedAt: Date.now(),
        updatedBy: systemUser._id,
        isDeleted: 0
    });
    await consortiumUserRole.save();

    // Insert sample data for ConsortiumUser
    const consortiumUser = new ConsortiumUser({
        consortium: consortium._id,
        userFullName: 'Test Consortium User',
        emailOfficial: 'testconsortiumuser@example.com',
        password: 'password123',
        emailPersonal: 'personal@example.com',
        mobileNoOfficial: '1234567890',
        mobileNoPersonal: '0987654321',
        consortiumUserRole: consortiumUserRole._id,
        consortiumUserType: null,
        speciality: null,
        consortiumLocations: [],
        defaultConsortiumLocation: null,
        templateAttachments: [],
        sampleAttachments: [],
        isActive: 1,
        appLastAccessedAt: Date.now(),
        createdAt: Date.now(),
        createdBy: null,
        updatedAt: Date.now(),
        updatedBy: null,
        isDeleted: 0
    });
    await consortiumUser.save();

    // Insert sample data for ConsortiumUserSessionType
    const consortiumUserSessionType = new SessionType({
        sessionTypeName: 'Test Consortium Session Type',
        sessionTypeId: 2
    });
    await consortiumUserSessionType.save();

    // Insert sample data for ConsortiumUserSession
    const consortiumUserSession = new ConsortiumUserSession({
        sessionToken: '7469',
        consortium: consortium._id,
        consortiumUser: consortiumUser._id,
        sessionType: consortiumUserSessionType._id,
        messagingToken: 'sampleMessagingTokenConsortium',
        lastSyncTs: Date.now()
    });
    await consortiumUserSession.save();

    // Insert sample data for SystemUserModuleCategory
    const systemUserModuleCategory = new SystemUserModuleCategory({
        categoryName: 'Test Category',
        isActive: 1,
        createdAt: Date.now(),
        createdBy: systemUser._id,
        updatedAt: Date.now(),
        updatedBy: systemUser._id,
        isDeleted: 0
    });
    await systemUserModuleCategory.save();

    // Insert sample data for SystemUserModule
    const systemUserModule = new SystemUserModule({
        moduleName: 'Test Module',
        moduleCategory: systemUserModuleCategory._id,
        isActive: 1,
        createdAt: Date.now(),
        createdBy: systemUser._id,
        updatedAt: Date.now(),
        updatedBy: systemUser._id,
        isDeleted: 0
    });
    await systemUserModule.save();

    console.log('Sample data inserted successfully');
    mongoose.connection.close();
}

insertSampleSystemUserSession().catch(err => {
    console.error('Error inserting sample data:', err);
    mongoose.connection.close();
});
