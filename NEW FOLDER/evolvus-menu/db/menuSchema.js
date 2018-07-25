const mongoose = require("mongoose");
//const validator = require("validator");


var menuSchema = new mongoose.Schema({
  // Add all attributes below tenantId
  tenantId: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 64
  },
  applicationCode: {
    type: String,
    minLength: 3,
    maxLength: 20,
    required: true
  },
  menuGroupCode: {
    type: String,
    minLength: 1,
    maxLength: 20,
    unique: true,
    required: true
  },
  title: {
    type: String,
    minLength: 1,
    maxLength: 20,
    required: true
  },
  menuItems: {
    type: Array,
    minItems: 1,
    required: true,
    items: {
      menuItemType: {
        type: String,
        minLength: 1,
        maxLength: 20,
        required: true
      },
      applicationCode: {
        type: String,
        minLength: 3,
        maxLength: 20,
        required: true
      },
      menuItemCode: {
        type: String,
        minLength: 1,
        maxLength: 20,
        required: true
      },
      title: {
        type: String,
        minLength: 1,
        maxLength: 20,
        required: true
      },
      menuItemOrder: {
        type: Number,
        required: true
      },
      selectedFlag: {
        type: Boolean,
        required: false,
        default: false
      }
    }
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
  lastUpdatedDate: {
    type: Date
  },
  enableFlag: {
    type: Number,
    default: 1
  },
  deletedFlag: {
    type: Number,
    default: 0
  },
  selectedFlag: {
    type: Boolean,
    required: false,
    default: false
  },
  menuGroupOrder: {
    type: Number,
    required: true
  }
});

module.exports = menuSchema;