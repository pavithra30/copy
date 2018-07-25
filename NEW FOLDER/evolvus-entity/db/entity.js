const debug = require("debug")("evolvus-branch:db:branch");
const mongoose = require("mongoose");
const ObjectId = require('mongodb')
  .ObjectID;

const entitySchema = require("./entitySchema");

// Creates a branchCollection collection in the database
var entityCollection = mongoose.model("entityCollection", entitySchema);
module.exports.branchSchema = {
  entitySchema
};
// Saves the branchCollection object to the database and returns a Promise
// The assumption here is that the Object is valid
module.exports.save = (object) => {
  return new Promise((resolve, reject) => {
    try {
      // any exception during construction will go to catch
      let branch = new entityCollection(object);
      // on resolve we need to resolve the this method
      // on reject or exception we reject it,
      // this is because the record either saves or it doesnt
      // in any case it does not save, is a reject
      branch.save()
        .then((data) => {
          debug("saved successfully", data._id);
          resolve(data);
        }, (err) => {
          debug(`rejected save.. ${err}`);
          reject(err);
        })
        .catch((e) => {
          debug(`exception on save: ${e}`);
          reject(e);
        });
    } catch (e) {
      debug(`caught exception: ${e}`);
      reject(e);
    }
  });
};



// Returns a limited set if all the role(s) with a Promise
// if the collectiom has no records it Returns
// a promise with a result of  empty object i.e. {}
module.exports.findAll = (tenantId, entityId, accessLevel, pageSize, pageNo, orderBy) => {
  let query = {
    tenantId: tenantId,
    accessLevel: {
      $gte: accessLevel
    },
    entityId: {
      $regex: entityId + ".*"
    },
  };
  var qskip = pageSize * (pageNo - 1);
  var qlimit = pageSize;
  if (qlimit < 1) {
    return entityCollection.find(query).skip(qskip).limit(qlimit).sort(orderBy);
  } else {
    return entityCollection.find(query).skip(qskip).limit(qlimit).sort(orderBy);
  }
};

// Finds the branch which matches the value parameter from branch collection
// If there is no object matching the attribute/value, return empty object i.e. {}
// null, undefined should be rejected with Invalid Argument Error
// Should return a Promise
module.exports.findOne = (attribute, value) => {
  return new Promise((resolve, reject) => {
    try {
      var query = {};
      query[attribute] = value;
      entityCollection.findOne(query)
        .then((data) => {
          debug(`branch found ${data}`);
          resolve(data);
        }, (err) => {
          debug(`rejected find.. ${err}`);
          reject(err);
        })
        .catch((e) => {
          debug(`exception on find: ${e}`);
          reject(e);
        });
    } catch (e) {
      debug(`caught exception: ${e}`);
      reject(e);
    }
  });
};

// Finds all the branchs which matches the value parameter from branch collection
// If there is no object matching the attribute/value, return empty object i.e. {}
// null, undefined should be rejected with Invalid Argument Error
// Should return a Promise
module.exports.findMany = (attribute, value, orderBy) => {
  return new Promise((resolve, reject) => {
    try {
      var query = {};
      query[attribute] = value;
      entityCollection.find(query).sort(orderBy)
        .then((data) => {
          debug(`branch found ${data}`);
          resolve(data);
        }, (err) => {
          debug(`rejected find.. ${err}`);
          reject(err);
        })
        .catch((e) => {
          debug(`exception on find: ${e}`);
          reject(e);
        });
    } catch (e) {
      debug(`caught exception: ${e}`);
      reject(e);
    }
  });
};

// Finds the branch for the id parameter from the branch collection
// If there is no object matching the id, return empty object i.e. {}
// null, undefined, invalid objects should be rejected with Invalid Argument Error
// All returns are wrapped in a Promise
//
module.exports.findById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      entityCollection.findById({
          _id: new ObjectId(id)
        })
        .then((res) => {
          debug("findById successfull: ", res);
          resolve(res);
        }, (err) => {
          debug(`rejected finding branchCollection.. ${err}`);
          reject(err);
        })
        .catch((e) => {
          debug(`exception on finding branch: ${e}`);
          reject(e);
        });
    } catch (e) {
      debug(`caught exception: ${e}`);
      reject(e);
    }
  });
};

// Filters entity collection by entityDetails
// Returns a promise

module.exports.filterByEntityDetails = (tenantId, entityId, accessLevel, filterQuery, pageSize, pageNo, orderBy) => {
  filterQuery.tenantId = tenantId;
  filterQuery.accessLevel = {
    $gte: accessLevel
  };
  filterQuery.entityId = {
    $regex: entityId + ".*"
  };
  var qskip = pageSize * (pageNo - 1);
  var qlimit = pageSize;
  if (qlimit < 1) {
    // var list =[];
    // list.push(roleCollection.find(query).sort(orderBy));
    // console.log(list.length);
    return entityCollection.find(filterQuery).skip(qskip).limit(qlimit).sort(orderBy);
  } else {
    return entityCollection.find(filterQuery).skip(qskip).limit(qlimit).sort(orderBy);
  }

};

//Finds one entity by its code and updates it with new values
module.exports.update = (id, update) => {
  return new Promise((resolve, reject) => {
    try {
      entityCollection.findById({
        _id: new ObjectId(id)
      }).then((app) => {
        if (app) {
          app.set(update);
          app.save().then((res) => {
            debug(`updated successfully ${res}`);
            resolve(res);
          }).catch((e) => {
            debug(`failed to update ${e}`);
            reject(e);
          });
        } else {
          debug(`role not found with id, ${id}`);
          reject(`There is no such entity with id:${id}`);
        }
      }).catch((e) => {
        debug(`exception on findById ${e}`);
        reject(e.message);
      });
    } catch (e) {
      debug(`caught exception ${e}`);
      reject(e.message);
    }
  });
};

module.exports.entityCounts = (tenantId, entityId, accessLevel, countQuery, limit, orderBy) => {
  countQuery.tenantId = tenantId;
  countQuery.accessLevel = {
    $gte: accessLevel
  };
  countQuery.entityId = {
    $regex: entityId + ".*"
  };

  if (limit < 1) {
    return entityCollection.count(countQuery).sort(orderBy);
  } else {
    return entityCollection.count(countQuery).sort(orderBy);
  }
};
// Deletes all the entries of the collection.
// To be used by test only
module.exports.deleteAll = () => {
  return entityCollection.remove({});
};
