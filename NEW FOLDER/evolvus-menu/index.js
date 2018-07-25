const debug = require("debug")("evolvus-menu:index");
const menuSchema = require("./model/menuSchema")
  .schema;
const menuCollection = require("./db/menu");
const validate = require("jsonschema")
  .validate;
const docketClient = require("evolvus-docket-client");
var menuDBschema = require("./db/menuSchema");

var docketObject = {
  // required fields
  application: "PLATFORM",
  source: "menu",
  name: "",
  createdBy: "",
  ipAddress: "",
  status: "SUCCESS", //by default
  eventDateTime: Date.now(),
  keyDataAsJSON: "",
  details: "",
  //non required fields
  level: ""
};

module.exports.menu = {
  menuDBschema,
  menuSchema
};

module.exports.validate = (menuObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof menuObject === "undefined") {
        throw new Error("IllegalArgumentException:menuObject is undefined");
      }
      var res = validate(menuObject, menuSchema);
      debug("validation status: ", JSON.stringify(res));
      if (res.valid) {
        resolve(res.valid);
      } else {
        reject(res.errors);
      }
    } catch (err) {
      reject(err);
    }
  });
};

// All validations must be performed before we save the object here
// Once the db layer is called its is assumed the object is valid.
module.exports.save = (menuObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof menuObject === 'undefined' || menuObject == null) {
        throw new Error("IllegalArgumentException: menuObject is null or undefined");
      }
      docketObject.name = "menu_save";
      docketObject.keyDataAsJSON = JSON.stringify(menuObject);
      docketObject.details = `menu creation initiated`;
      docketClient.postToDocket(docketObject);
      var res = validate(menuObject, menuSchema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        // if the object is valid, save the object to the database
        menuCollection.save(menuObject).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
      // Other validations here
    } catch (e) {
      docketObject.name = "menu_ExceptionOnSave";
      docketObject.keyDataAsJSON = JSON.stringify(menuObject);
      docketObject.details = `caught Exception on menu_save ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

// List all the objects in the database
// makes sense to return on a limited number
// (what if there are 1000000 records in the collection)
module.exports.getAll = (limit) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof(limit) == "undefined" || limit == null) {
        throw new Error("IllegalArgumentException: limit is null or undefined");
      }
      docketObject.name = "menu_getAll";
      docketObject.keyDataAsJSON = `getAll with limit ${limit}`;
      docketObject.details = `menu getAll method`;
      docketClient.postToDocket(docketObject);

      menuCollection.findAll(limit).then((docs) => {
        debug(`menu(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        debug(`failed to find all the menu(s) ${e}`);
        reject(e);
      });
    } catch (e) {
      docketObject.name = "menu_ExceptionOngetAll";
      docketObject.keyDataAsJSON = "menuObject";
      docketObject.details = `caught Exception on menu_getAll ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};


// Get the entity idenfied by the id parameter
module.exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    try {

      if (typeof(id) == "undefined" || id == null) {
        throw new Error("IllegalArgumentException: id is null or undefined");
      }
      docketObject.name = "menu_getById";
      docketObject.keyDataAsJSON = `menuObject id is ${id}`;
      docketObject.details = `menu getById initiated`;
      docketClient.postToDocket(docketObject);

      menuCollection.findById(id)
        .then((res) => {
          if (res) {
            debug(`menu found by id ${id} is ${res}`);
            resolve(res);
          } else {
            // return empty object in place of null
            debug(`no menu found by this id ${id}`);
            resolve({});
          }
        }).catch((e) => {
          debug(`failed to find menu ${e}`);
          reject(e);
        });

    } catch (e) {
      docketObject.name = "menu_ExceptionOngetById";
      docketObject.keyDataAsJSON = `menuObject id is ${id}`;
      docketObject.details = `caught Exception on menu_getById ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.getOne = (attribute, value) => {
  return new Promise((resolve, reject) => {
    try {
      if (attribute == null || value == null || typeof attribute === 'undefined' || typeof value === 'undefined') {
        throw new Error("IllegalArgumentException: attribute/value is null or undefined");
      }

      docketObject.name = "menu_getOne";
      docketObject.keyDataAsJSON = `menuObject ${attribute} with value ${value}`;
      docketObject.details = `menu getOne initiated`;
      docketClient.postToDocket(docketObject);
      menuCollection.findOne(attribute, value).then((data) => {
        if (data) {
          debug(`menu found ${data}`);
          resolve(data);
        } else {
          // return empty object in place of null
          debug(`no menu found by this ${attribute} ${value}`);
          resolve({});
        }
      }).catch((e) => {
        debug(`failed to find ${e}`);
      });
    } catch (e) {
      docketObject.name = "menu_ExceptionOngetOne";
      docketObject.keyDataAsJSON = `menuObject ${attribute} with value ${value}`;
      docketObject.details = `caught Exception on menu_getOne ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.getMany = (attribute, value) => {
  return new Promise((resolve, reject) => {
    try {
      if (attribute == null || value == null || typeof attribute === 'undefined' || typeof value === 'undefined') {
        throw new Error("IllegalArgumentException: attribute/value is null or undefined");
      }

      docketObject.name = "menu_getMany";
      docketObject.keyDataAsJSON = `menuObject ${attribute} with value ${value}`;
      docketObject.details = `menu getMany initiated`;
      docketClient.postToDocket(docketObject);
      menuCollection.findMany(attribute, value).then((data) => {
        if (data) {
          debug(`menu found ${data}`);
          resolve(data);
        } else {
          // return empty object in place of null
          debug(`no menu found by this ${attribute} ${value}`);
          resolve([]);
        }
      }).catch((e) => {
        debug(`failed to find ${e}`);
      });
    } catch (e) {
      docketObject.name = "menu_ExceptionOngetMany";
      docketObject.keyDataAsJSON = `menuObject ${attribute} with value ${value}`;
      docketObject.details = `caught Exception on menu_getMany ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};