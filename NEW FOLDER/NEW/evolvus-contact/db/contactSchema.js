const mongoose = require("mongoose");
const validator = require("validator");

var contactSchema = new mongoose.Schema({
    // Add all attributes below tenantId
    tenantId: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 64
    },
    contactCode: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },
    contactName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
        validate: {
            validator: function(v) {
                return /^[A-Za-z ]*$/.test(v);
            },
            message: "{PATH} can contain only alphabets and spaces"
        }
    },
    enabled: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        minlength: 0,
        maxlength: 255
    },
    logo: {
        type: String
    },
    favicon: {
        type: String
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String
    },
    createdDate: {
        type: Date,
        required: true
    },
    updatedDate: {
        type: Date
    }
});

contactSchema.index({
    tenantId: 1,
    contactCode: 2
}, {
    unique: true
});

module.exports = contactSchema;