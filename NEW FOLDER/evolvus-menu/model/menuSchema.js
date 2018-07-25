/*
 ** JSON Schema representation of the menu model
 */
module.exports.schema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "menuModel",
  "type": "object",
  "properties": {
    "tenantId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 64
    },
    "applicationCode": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20
    },
    "menuGroupCode": {
      "type": "string",
      "minLength": 1,
      "maxLength": 20
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 20
    },
    "createdBy": {
      "type": "string"
    },
    "updatedBy": {
      "type": "string"
    },
    "createdDate": {
      "type": "string",
      "format": "date-time"
    },
    "lastUpdatedDate": {
      "type": "string",
      "format": "date-time"
    },
    "enableFlag": {
      "type": "number",
      "default": 1
    },
    "deletedFlag": {
      "type": "number",
      "default": 0
    },
    "selectedFlag": {
      "type": "boolean",
      "default": "false"
    },
    "menuGroupOrder": {
      "type": "number"
    },
    "menuItems": {
      "type": "array",
      "minItems": 1,
      "items": {
        "properties": {
          "menuItemType": {
            "type": "string",
            "minLength": 1,
            "maxLength": 20
          },
          "applicationCode": {
            "type": "string",
            "minLength": 3,
            "maxLength": 20
          },
          "menuItemCode": {
            "type": "string",
            "minLength": 1,
            "maxLength": 20
          },
          "title": {
            "type": "string",
            "minLength": 1,
            "maxLength": 20
          },
          "menuItemOrder": {
            "type": "number",
            "required": "true"
          },
          "selectedFlag": {
            "type": "boolean",
            "default": "false"
          }
        },
        "required": ["menuItemType", "applicationCode", "menuItemCode", "title", "menuItemOrder"]
      }

    }
  },
  "required": ["tenantId", "applicationCode", "menuGroupCode", "menuGroupOrder", "title", "createdDate", "createdBy", "menuItems"]
};