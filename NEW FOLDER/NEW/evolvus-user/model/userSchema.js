const _ = require('lodash');
/*
 ** JSON Schema representation of the user model
 */
var userSchema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "title": "userModel",
    "type": "object",
    "properties": {
        "tenantId": {
            "type": "string",
            "maxLength": 64,
            "filterable": false, //custom attributes
            "sortable": false //custom attribute
        },
        "userCode": {
            "type": "string",
            "minLength": 3,
            "maxLength": 20,
            "filterable": true, //custom attributes
            "sortable": true //custom attributes
        },
        "userName": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100,
            "filterable": true, //custom attributes
            "sortable": true //custom attributes
        },
        "enabled": {
            "type": "boolean",
            "default": true,
            "filterable": true, //custom attributes
            "sortable": true //custom attributes
        },
        "logo": {
            "type": "string",
            "filterable": false, //custom attributes
            "sortable": false //custom attributes
        },
        "favicon": {
            "type": "string",
            "filterable": false, //custom attributes
            "sortable": false //custom attributes
        },
        "createdBy": {
            "type": "string",
            "filterable": false, //custom attributes
            "sortable": true //custom attributes
        },
        "updatedBy": {
            "type": "string",
            "filterable": false, //custom attributes
            "sortable": true //custom attributes
        },
        "createdDate": {
            "type": "string",
            "format": "date-time",
            "filterable": true, //custom attributes
            "sortable": true //custom attributes
        },
        "updatedDate": {
            "type": ["string", "null"],
            "format": "date-time",
            "filterable": false, //custom attributes
            "sortable": true //custom attributes
        },
        "description": {
            "type": "string",
            "minLength": 0,
            "maxLength": 255,
            "filterable": false, //custom attributes
            "sortable": false, //custom attributes
            "displayable": true
        }
    },
    "required": ["tenantId", "userCode", "userName", "createdBy", "createdDate"]
};

module.exports.schema = userSchema;

filterAttributes = _.keys(_.pickBy(userSchema.properties, (a) => {
    return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(userSchema.properties, (a) => {
    return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;