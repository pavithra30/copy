const _ = require('lodash');
/*
 ** JSON Schema representation of the contact model
 */
var contactSchema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "title": "contactModel",
    "type": "object",
    "properties": {
        "tenantId": {
            "type": "string",
            "maxLength": 64,
            "filterable": false, //custom attributes
            "sortable": false //custom attribute
        },
        "contactCode": {
            "type": "string",
            "minLength": 3,
            "maxLength": 20,
            "filterable": true, //custom attributes
            "sortable": true //custom attributes
        },
        "contactName": {
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
    "required": ["tenantId", "contactCode", "contactName", "createdBy", "createdDate"]
};

module.exports.schema = contactSchema;

filterAttributes = _.keys(_.pickBy(contactSchema.properties, (a) => {
    return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(contactSchema.properties, (a) => {
    return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;