const _ = require('lodash');
/*
 ** JSON Schema representation of the application model
 */
var applicationSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "applicationModel",
  "type": "object",
  "properties": {
    "tenantId": {
      "type": "string",
      "maxLength": 64,
      "filterable": false, //custom attributes
      "sortable": false //custom attribute
    },
    "applicationCode": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20,
      "filterable": true, //custom attributes
      "sortable": true //custom attributes
    },
    "applicationName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "filterable": true, //custom attributes
      "sortable": true //custom attributes
    },
    "enableFlag": {
      "type": "string",
      "enum": ["0", "1"],
      "filterable": true, //custom attributes
      "sortable":false//custom attributes
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
    "lastupdatedDate": {
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
  "required": ["tenantId", "applicationCode", "applicationName", "createdBy", "createdDate"]
};

module.export.schema = applicationSchema;

module.exports.filterAttributes = {
  return _.keys(_.pickBy(applicationSchema.properties, (a) => {
    return (a.filterable);
  }));
};

module.exports.sortableAttributes = {
  return _.keys(_.pickBy(applicationSchema.properties, (a) => {
    return (a.sortable);
  }));
};
