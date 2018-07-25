const debug = require("debug")("evolvus-entity:index");
const entitySchema = require("./model/entitySchema")
  .schema;
const entityCollection = require("./db/entity");
const validate = require("jsonschema")
  .validate;
const docketClient = require("evolvus-docket-client");

var entityDBschema = require("./db/entitySchema");

var docketObject = {
  // required fields
  application: "PLATFORM",
  source: "entity",
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

module.exports.entity = {
  entityDBschema,
  entitySchema
};

module.exports.validate = (entityObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof entityObject === "undefined") {
        throw new Error("IllegalArgumentException:entityObject is undefined");
      }
      var res = validate(entityObject, entitySchema);
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
module.exports.save = (entityObject) => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof entityObject === 'undefined' || entityObject == null) {
        throw new Error("IllegalArgumentException: entityObject is null or undefined");
      }
      docketObject.name = "entity_save";
      docketObject.keyDataAsJSON = JSON.stringify(entityObject);
      docketObject.details = `entity creation initiated`;
      docketClient.postToDocket(docketObject);
      var res = validate(entityObject, entitySchema);
      debug("validation status: ", JSON.stringify(res));
      if (!res.valid) {
        reject(res.errors);
      } else {
        // if the object is valid, save the object to the database
        entityCollection.save(entityObject).then((result) => {
          debug(`saved successfully ${result}`);
          resolve(result);
        }).catch((e) => {
          debug(`failed to save with an error: ${e}`);
          reject(e);
        });
      }
      // Other validations here
    } catch (e) {
      docketObject.name = "entity_ExceptionOnSave";
      docketObject.keyDataAsJSON = JSON.stringify(entityObject);
      docketObject.details = `caught Exception on entity_save ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

// List all the objects in the database
// makes sense to return on a limited number
// (what if there are 1000000 records in the collection)
module.exports.getAll = (tenantId, entityId, accessLevel, pageSize, pageNo, orderBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (orderBy == null) {
        orderBy = {
          lastUpdatedDate: -1
        };
      }
      docketObject.name = "entity_getAll";
      docketObject.keyDataAsJSON = `getAll with pageSize ${pageSize}`;
      docketObject.details = `entity getAll method`;
      docketClient.postToDocket(docketObject);

      entityCollection.findAll(tenantId, entityId, accessLevel, pageSize, pageNo, orderBy).then((docs) => {
        debug(`entity(s) stored in the database are ${docs}`);
        resolve(docs);
      }).catch((e) => {
        debug(`failed to find all the entity(s) ${e}`);
        reject(e);
      });
    } catch (e) {
      docketObject.name = "entity_ExceptionOngetAll";
      docketObject.keyDataAsJSON = "entityObject";
      docketObject.details = `caught Exception on entity_getAll ${e.message}`;
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
      docketObject.name = "entity_getById";
      docketObject.keyDataAsJSON = `entityObject id is ${id}`;
      docketObject.details = `entity getById initiated`;
      docketClient.postToDocket(docketObject);

      entityCollection.findById(id)
        .then((res) => {
          if (res) {
            debug(`entity found by id ${id} is ${res}`);
            resolve(res);
          } else {
            // return empty object in place of null
            debug(`no entity found by this id ${id}`);
            resolve({});
          }
        }).catch((e) => {
          debug(`failed to find entity ${e}`);
          reject(e);
        });

    } catch (e) {
      docketObject.name = "entity_ExceptionOngetById";
      docketObject.keyDataAsJSON = `entityObject id is ${id}`;
      docketObject.details = `caught Exception on entity_getById ${e.message}`;
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

      docketObject.name = "entity_getOne";
      docketObject.keyDataAsJSON = `entityObject ${attribute} with value ${value}`;
      docketObject.details = `entity getOne initiated`;
      docketClient.postToDocket(docketObject);
      entityCollection.findOne(attribute, value).then((data) => {
        if (data) {
          debug(`entity found ${data}`);
          resolve(data);
        } else {
          // return empty object in place of null
          debug(`no entity found by this ${attribute} ${value}`);
          resolve({});
        }
      }).catch((e) => {
        debug(`failed to find ${e}`);
      });
    } catch (e) {
      docketObject.name = "entity_ExceptionOngetOne";
      docketObject.keyDataAsJSON = `entityObject ${attribute} with value ${value}`;
      docketObject.details = `caught Exception on entity_getOne ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.getMany = (attribute, value, orderBy) => {
  return new Promise((resolve, reject) => {
    try {
      if (attribute == null || value == null || typeof attribute === 'undefined' || typeof value === 'undefined') {
        throw new Error("IllegalArgumentException: attribute/value is null or undefined");
      }
      if (orderBy == null || typeof orderBy === 'undefined') {
        orderBy = {
          lastUpdatedDate: -1
        };
      }
      docketObject.name = "entity_getMany";
      docketObject.keyDataAsJSON = `entityObject ${attribute} with value ${value}`;
      docketObject.details = `entity getMany initiated`;
      docketClient.postToDocket(docketObject);
      entityCollection.findMany(attribute, value).then((data) => {
        if (data) {
          debug(`entity found ${data}`);
          resolve(data);
        } else {
          // return empty object in place of null
          debug(`no entity found by this ${attribute} ${value}`);
          resolve([]);
        }
      }).catch((e) => {
        debug(`failed to find ${e}`);
      });
    } catch (e) {
      docketObject.name = "entity_ExceptionOngetMany";
      docketObject.keyDataAsJSON = `entityObject ${attribute} with value ${value}`;
      docketObject.details = `caught Exception on entity_getMany ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.filterByEntityDetails = (tenantId, entityId, accessLevel, filterQuery, pageSize, pageNo, orderBy) => {
  return new Promise((resolve, reject) => {
    try {
      let queryObject = {};
      if (filterQuery == null || typeof filterQuery === 'undefined') {
        throw new Error("IllegalArgumentException: filterQuery is null or undefined");
      } else {
        if (filterQuery.parent != null && (filterQuery.parent !== 'undefined')) {
          queryObject.parent = filterQuery.parent;
        }
        if (filterQuery.enableFlag != null && (filterQuery.enableFlag != 'undefined')) {
          queryObject.enableFlag = filterQuery.enableFlag;
        }
        if (filterQuery.processingStatus != null && (filterQuery.processingStatus != 'undefined')) {
          queryObject.processingStatus = filterQuery.processingStatus;
        }
      }
      if (orderBy == null || typeof orderBy === 'undefined') {
        orderBy = {
          lastUpdatedDate: -1
        };
      }
      docketObject.name = "entity_filterByEntityDetails";
      docketObject.keyDataAsJSON = `Filter the entity collection by query ${filterQuery}`;
      docketObject.details = `entity_filterByEntityDetails initiated`;
      docketClient.postToDocket(docketObject);

      entityCollection.filterByEntityDetails(tenantId, entityId, accessLevel, queryObject, pageSize, pageNo, orderBy).then((filteredData) => {
        if (filteredData.length > 0) {
          debug(`filtered Data is ${filteredData}`);
          resolve(filteredData);
        } else {
          debug(`No data available for filter query ${filterQuery}`);
          resolve([]);
        }
      }).catch((e) => {
        debug(`failed to find ${e}`);
      });
    } catch (e) {
      docketObject.name = "entity_ExceptionOnFilterByEntityDetails";
      docketObject.keyDataAsJSON = `Filter the entity collection by query ${filterQuery}`;
      docketObject.details = `caught Exception on entity_filterByentityDetails ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.update = (id, update) => {
  return new Promise((resolve, reject) => {
    try {
      if (id == null || update == null) {
        throw new Error("IllegalArgumentException:id/update is null or undefined");
      }
      docketObject.name = "entity_update";
      docketObject.keyDataAsJSON = `entityObject ${id} to be updated with  ${update}`;
      docketObject.details = `entity update initiated`;
      docketClient.postToDocket(docketObject);
      entityCollection.update(id, update).then((resp) => {
        debug("updated successfully", resp);
        resolve(resp);
      }).catch((error) => {
        debug(`failed to update ${error}`);
        reject(error);
      });
    } catch (e) {
      docketObject.name = "entity_ExceptionOnUpdate";
      docketObject.keyDataAsJSON = `entityObject ${id} to be updated with  ${update}`;
      docketObject.details = `caught Exception on entity_update ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};

module.exports.getEntityCounts = (tenantId, entityId, accessLevel, countQuery, orderBy) => {
  return new Promise((resolve, reject) => {
    try {
      let queryObject = {};
      if (countQuery == null || typeof countQuery === 'undefined') {
        throw new Error("IllegalArgumentException: countQuery is null or undefined");
      } else {
        if (countQuery.parent != null && (countQuery.parent !== 'undefined')) {
          queryObject.parent = countQuery.parent;
        }
        if (countQuery.enableFlag != null && (countQuery.enableFlag != 'undefined')) {
          queryObject.enableFlag = countQuery.enableFlag;
        }
        if (countQuery.processingStatus != null && (countQuery.processingStatus != 'undefined')) {
          queryObject.processingStatus = countQuery.processingStatus;
        }
      }
      if (orderBy == null || typeof orderBy === 'undefined') {
        orderBy = {
          lastUpdatedDate: -1
        };
      }
      docketObject.name = "entity_getEntityCounts";
      docketObject.keyDataAsJSON = `Get entity Count from entity collection by query ${countQuery}`;
      docketObject.details = `entity_getEntityCounts initiated`;
      docketClient.postToDocket(docketObject);

      entityCollection.entityCounts(tenantId, entityId, accessLevel, queryObject, orderBy).then((entityCount) => {
        if (entityCount > 0) {
          debug(`entityCount Data is ${entityCount}`);
          resolve(entityCount);
        } else {
          debug(`No entity count data available for filter query ${entityCount}`);
          resolve(0);
        }
      }).catch((e) => {
        debug(`failed to find ${e}`);
      });
    } catch (e) {
      docketObject.name = "entity_ExceptionOnGetRoleCounts";
      docketObject.keyDataAsJSON = `Get role count from the entity collection by query ${countQuery}`;
      docketObject.details = `caught Exception on entity_getEntityCounts ${e.message}`;
      docketClient.postToDocket(docketObject);
      debug(`caught exception ${e}`);
      reject(e);
    }
  });
};
