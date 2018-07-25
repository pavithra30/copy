const _ = require('lodash');
/*
 ** JSON Schema representation of the masterTimeZone model
 */
var masterTimeZoneSchema = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "title": "masterTimeZoneModel",
    "type": "object",
    "properties": {
        "tenantId": {
            "type": "string",
            "maxLength": 64,
            "filterable": false, //custom attributes
            "sortable": false //custom attribute
        },
        "masterTimeZoneCode": {
            "type": "string",
            "minLength": 3,
            "maxLength": 20,
            "filterable": true, //custom attributes
            "sortable": true //custom attributes
        },
        "masterTimeZoneName": {
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
    "required": ["tenantId", "masterTimeZoneCode", "masterTimeZoneName", "createdBy", "createdDate"]
};

module.exports.schema = masterTimeZoneSchema;

filterAttributes = _.keys(_.pickBy(masterTimeZoneSchema.properties, (a) => {
    return (a.filterable);
}));

module.exports.filterAttributes = filterAttributes;

sortableAttributes = _.keys(_.pickBy(masterTimeZoneSchema.properties, (a) => {
    return (a.sortable);
}));

module.exports.sortableAttributes = sortableAttributes;