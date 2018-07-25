const debug = require("debug")("evolvus-branch.test.db.entity");
const mongoose = require("mongoose");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const branch = require("../../db/entity");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204/TestPlatform_Dev";

chai.use(chaiAsPromised);

// High level wrapper
// Testing db/branch.js
describe("db branch testing", () => {
  /*
   ** Before doing any tests, first get the connection.
   */
  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
      debug("ok got the connection");
      done();
    });
  });

  let object1 = {
    // add a valid branch object
    "tenantId": "IVL",
    "entityCode": "entity1",
    "name": "headOffice",
    "parent": "headOffice",
    "description": "bc1 description",
    "createdBy": "SYSTEM",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString(),
    "accessLevel": "1",
    "entityId": "abc12"
  };
  let object2 = {
    // add a valid branch object
    "tenantId": "IVL",
    "entityCode": "entity2",
    "name": "southZone",
    "parent": "headOffice",
    "description": "bc1 description",
    "createdBy": "SYSTEM",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString(),
    "entityId": "abc12def456",
    "accessLevel": "1"
  };
  let object3 = {
    // add a valid branch object
    "tenantId": "IVL",
    "entityCode": "entity3",
    "name": "northZone",
    "parent": "headOffice",
    "description": "entity3 description",
    "createdBy": "SYSTEM",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString(),
    "entityId": "abc12jhg45",
    "accessLevel": "1"
  };
  let object4 = {
    // add a valid branch object
    "tenantId": "IVL",
    "entityCode": "entity4",
    "name": "karanataka",
    "parent": "southZone",
    "description": "entity4 description",
    "createdBy": "SYSTEM",
    "createdDate": new Date().toISOString(),
    "lastUpdatedDate": new Date().toISOString(),
    "entityId": "abc12kff34",
    "accessLevel": "1"
  };

  describe("testing branch.save", () => {
    // Testing save
    // 1. Valid branch should be saved.
    // 2. Non branch object should not be saved.
    // 3. Should not save same branch twice.
    beforeEach((done) => {
      branch.deleteAll()
        .then((data) => {
          done();
        });
    });

    it("should save valid branch to database", (done) => {
      let testbranchCollection = {
        // add a valid branch object
        "tenantId": "IVL",
        "entityCode": "entity1",
        "name": "entity1",
        "parent": "entityparent1",
        "description": "entity1 description",
        "createdBy": "SYSTEM",
        "createdDate": new Date().toISOString(),
        "lastUpdatedDate": new Date().toISOString(),
        "entityId": "abc12",
        "accessLevel": "1"
      };
      let res = branch.save(testbranchCollection);
      expect(res)
        .to.eventually.have.property('entityCode')
        .to.eql('entity1')
        .notify(done);
    });

    it("should fail saving invalid object to database", (done) => {
      // not even a  object

      let invalidObject = {
        "tenantId": "IVL",
        "name": "entity1",
        "parent": "entityparent1",
        "description": "entity1 description",
        "createdBy": "SYSTEM",
        "createdDate": new Date().toISOString(),
        "lastUpdatedDate": new Date().toISOString(),
        "processingStatus": "authorized",
        "accessLevel": "1"
      };
      let res = branch.save(invalidObject);
      expect(res)
        .to.be.eventually.rejectedWith("entityCollection validation failed")
        .notify(done);
    });
  });

  describe("testing entity.findAll by limit", () => {
    let object1 = {
      // add a valid branch object
      "tenantId": "IVL",
      "entityCode": "entity1",
      "name": "entity1",
      "parent": "entityparent1",
      "description": "entity1 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12",
      "accessLevel": "4"
    };
    let object2 = {
      // add a valid branch object
      "tenantId": "IVL",
      "entityCode": "entity2",
      "name": "entity2",
      "parent": "entityparent2",
      "description": "entity2 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12def345",
      "accessLevel": "3"
    };
    let object3 = {
      // add a valid branch object
      "tenantId": "IVL",
      "entityCode": "entity3",
      "name": "entity3",
      "parent": "entityparent3",
      "description": "entity3 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12jhg45",
      "accessLevel": "2"
    };
    let object4 = {
      // add a valid branch object
      "tenantId": "IVL",
      "entityCode": "entity4",
      "name": "entity4",
      "parent": "entityparent4",
      "description": "entity4 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12kff34",
      "accessLevel": "1"
    };
    // 1. Delete all records in the table and insert
    //    4 new records.
    // find -should return an array of size equal to value of limit with the
    // entities

    // delete all records and insert four entities
    beforeEach((done) => {
      branch.deleteAll().then(() => {
        branch.save(object1).then((res) => {
          branch.save(object2).then((res) => {
            branch.save(object3).then((res) => {
              branch.save(object4).then((res) => {
                done();
              });
            });
          });
        });
      });
    });

    // There are 3 roles with entity 'Entity',tenandId 'tid' and accessLevel 1 and one role with accessLevel 0
    // Query the collection with tenantId 'tid', accessLevel 1 and entity 'Entity'
    // It should return 3 records
    it("should return 2 records based on filter condition", (done) => {
      let orderBy = {
      lastUpdatedDate: -1
      };
      let res = branch.findAll('IVL', 'abc12', "1", 2,2, orderBy);
      expect(res)
        .to.be.fulfilled.then((docs) => {
          expect(docs)
            .to.be.a('array');
          expect(docs.length)
            .to.eql(2);
          expect(docs[0])
            .to.have.property('tenantId')
            .to.eql('IVL');
          expect(docs[0])
            .to.have.property('entityId')
            .to.eql(object3.entityId);
          expect(docs[0])
            .to.have.property('accessLevel')
            .to.eql("2");
          done();
        }, (err) => {
          done(err);
        })
        .catch((e) => {
          done(e);
        });
    });

    it("should return limited number records based on filter condition", (done) => {
      let orderBy = {
      lastUpdatedDate: -1
      };
      let res = branch.findAll('IVL', 'abc12', "1",3, 1, orderBy);
      expect(res)
        .to.be.fulfilled.then((docs) => {
          expect(docs)
            .to.be.a('array');
          expect(docs.length)
            .to.equal(3);
          expect(docs[0])
            .to.have.property('tenantId')
            .to.eql('IVL');
          expect(docs[0])
            .to.have.property('entityId')
            .to.eql('abc12');
          expect(docs[0])
            .to.have.property('accessLevel')
            .to.eql("4");
          done();
        }, (err) => {
          done(err);
        })
        .catch((e) => {
          done(e);
        });
    });
  });

  describe("testing entity.find without data", () => {
    // delete all records
    // find should return empty array
    beforeEach((done) => {
      branch.deleteAll()
        .then((res) => {
          done();
        });
    });

    it("should return empty array i.e. []", (done) => {
      let orderBy = {
      lastUpdatedDate: -1
      };
      let res = branch.findAll('tid', 'abc12', 2, 3, orderBy);
      expect(res)
        .to.be.fulfilled.then((docs) => {
          expect(docs)
            .to.be.a('array');
          expect(docs.length)
            .to.equal(0);
          expect(docs)
            .to.eql([]);
          done();
        }, (err) => {
          done(err);
        })
        .catch((e) => {
          done(e);
        });
    });
  });

  describe("testing branch.findById", () => {
    // Delete all records, insert one record , get its id
    // 1. Query by this id and it should return one branch
    // 2. Query by an arbitrary id and it should return {}
    // 3. Query with null id and it should throw IllegalArgumentException
    // 4. Query with undefined and it should throw IllegalArgumentException
    // 5. Query with arbitrary object
    let testObject = {
      //add a valid branch object
      "tenantId": "IVL",
      "entityCode": "entity1",
      "name": "entity1",
      "parent": "entityparent",
      "description": "entity1 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12",
      "accessLevel": "1"
    };
    var id;
    beforeEach((done) => {
      branch.deleteAll()
        .then((res) => {
          branch.save(testObject)
            .then((savedObj) => {
              id = savedObj._id;
              done();
            });
        });
    });

    it("should return branch identified by Id ", (done) => {
      let res = branch.findById(id);
      expect(res)
        .to.eventually.have.property('entityId')
        .to.eql('abc12')
        .notify(done);
    });

    it("should return null as no branch is identified by this Id ", (done) => {
      let badId = new mongoose.mongo.ObjectId();
      let res = branch.findById(badId);
      expect(res)
        .to.eventually.to.eql(null)
        .notify(done);
    });
  });

  describe("testing branch.findOne", () => {
    let object1 = {
      // add a valid branch object
      "tenantId": "IVL",
      "entityCode": "entity1",
      "name": "entity1",
      "parent": "entityparent1",
      "description": "entity1 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12",
      "accessLevel": "1"
    };
    let object2 = {
      // add a valid branch object
      "tenantId": "IVL",
      "entityCode": "entity2",
      "name": "entity2",
      "parent": "entityparent2",
      "description": "entity2 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc13def345",
      "accessLevel": "1"
    };
    // Delete all records, insert two record
    // 1. Query by one attribute and it should return one branch
    // 2. Query by an arbitrary attribute value and it should return {}

    // delete all records and insert two branchs
    beforeEach((done) => {
      branch.deleteAll()
        .then((res) => {
          branch.save(object1)
            .then((res) => {
              branch.save(object2)
                .then((savedObj) => {
                  done();
                });
            });
        });
    });

    it("should return object for valid attribute value", (done) => {
      // take one valid attribute and its value
      let attributename = "entityCode";
      let attributeValue = "entity1";
      let res = branch.findOne(attributename, attributeValue);
      expect(res)
        .to.eventually.have.property('entityCode')
        .to.eql('entity1')
        .notify(done);
    });

    it("should return null as no branch is identified by this attribute ", (done) => {
      let res = branch.findOne(`entityCode`, `dfgt`);
      expect(res)
        .to.eventually.to.eql(null)
        .notify(done);
    });
  });

  describe("testing branch.findMany", () => {
    // Delete all records, insert two record
    // 1. Query by one attribute and it should return all branchs having attribute value
    // 2. Query by an arbitrary attribute value and it should return {}
    let branch1 = {
      //add valid object
      "tenantId": "IVL",
      "entityCode": "entity1",
      "name": "entity1",
      "parent": "entityparent1",
      "description": "entity1 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12",
      "accessLevel": "1"
    };
    let branch2 = {
      //add valid object with one attribute value same as "branch1"
      "tenantId": "IVL",
      "entityCode": "entity2",
      "name": "entity2",
      "parent": "entityparent2",
      "description": "entity2 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc13def345",
      "accessLevel": "1"
    };
    // delete all records and insert two branchs
    beforeEach((done) => {
      branch.deleteAll()
        .then((res) => {
          branch.save(branch1)
            .then((res) => {
              branch.save(branch2)
                .then((savedObj) => {
                  done();
                });
            });
        });
    });

    it("should return array of objects for valid attribute value", (done) => {
      // take one valid attribute and its value
      let attributename = "entityCode";
      let attributeValue = "entity1";
      let res = branch.findMany(attributename, attributeValue);
      expect(res).to.eventually.be.a("array");
      //enter proper length according to input attribute
      expect(res).to.eventually.have.length(1);
      done();
    });

    it("should return empty array as no branch is identified by this attribute ", (done) => {
      let res = branch.findMany(`entityCode`, `sfgdfg`);
      expect(res)
        .to.eventually.to.eql([])
        .notify(done);
    });
  });

  describe('testing update entity', () => {
    //Delete all the recods from database
    //add 2 entitys

    let object1 = {
      //add valid object
      "tenantId": "IVL",
      "entityCode": "entity1",
      "name": "entity1",
      "parent": "entityparent1",
      "description": "entity1 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12",
      "accessLevel": "1"
    };
    let object2 = {
      //add valid object with one attribute value same as "branch1"
      "tenantId": "IVL",
      "entityCode": "entity2",
      "name": "entity2",
      "parent": "entityparent2",
      "description": "entity2 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc13def345",
      "accessLevel": "1"
    };

    let id;
    let update = {
      entityCode: "CDA",
      name: "abc"
    };
    beforeEach((done) => {
      branch.deleteAll().then((res) => {
        branch.save(object1).then((res) => {
          id = res._id;
          branch.save(object2).then((res) => {
            done();
          });
        });
      });
    });

    it('should update a entity ', (done) => {
      var res = branch.update(id, update);
      expect(res).to.eventually.be.a("object")
        .to.have.property("name")
        .to.eql(update.name)
        .notify(done);
    });

    it("should be rejected when there is no entity matching the parameter id", (done) => {
      var res = branch.update("5b30d72a54e5f94fdc4b66b7", update);
      expect(res).to.be.rejectedWith(`There is no such entity with id:5b30d72a54e5f94fdc4b66b7`)
        .notify(done);
    });

    it("should be rejected for arbitrary object as Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value
      let invalidId = "some value";
      let res = branch.update(invalidId, update);
      expect(res)
        .to.eventually.to.be.rejectedWith("must be a single String of 12 bytes")
        .notify(done);
    });
  });

  describe("Testing filter by Entity details", () => {

    let object1 = {
      //add valid object
      "tenantId": "IVL",
      "entityCode": "entity1",
      "name": "entity1",
      "parent": "entityparent1",
      "description": "entity1 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12",
      "accessLevel": "1"
    };
    let object2 = {
      //add valid object with one attribute value same as "branch1"
      "tenantId": "IVL",
      "entityCode": "entity2",
      "name": "entity2",
      "parent": "entityparent2",
      "description": "entity2 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12def34",
      "accessLevel": "1"
    };


    beforeEach((done) => {
      branch.deleteAll().then(() => {
        branch.save(object1).then((result) => {
          branch.save(object2).then((result) => {
            done();
          });
        });
      });
    });

    //Query by processing status as PENDING_AUTHORIZATION, activationStatus as ACTIVE and applicationCode as CDA
    // It should return array of 2 objects
    it("should return filterd values based on query ", (done) => {
      var res = branch.filterByEntityDetails("IVL","abc12","1",{
        processingStatus: "PENDING_AUTHORIZATION",
        parent: "entityparent2",
        enableFlag: true

      },5,1);
      expect(res).to.eventually.be.a("array")
        .to.have.length(1)
        .notify(done);
    });


    //Query by processing status as authorized
    //It should return empty array as there are no entity with processing status as authorized
    it("should return empty array as there are no entity matching the query parameter ", (done) => {
      var res = branch.filterByEntityDetails("IVL","abc12","1",{
        processingStatus: 'auuthorized',
      },5,1);
      expect(res).to.eventually.be.a("array")
        .to.have.length(0)
        .notify(done);
    });
  });

  describe("testing entity.entityCounts", () => {
    //  Delete all records, insert two record
    //  1. Query by one attribute and it should return all roles having attribute value
    //2. Query by an arbitrary attribute value and it should return {}

    //delete all records and insert two roles
    beforeEach((done) => {
      branch.deleteAll().then(() => {
        branch.save(object1).then((res) => {
          branch.save(object2).then((res) => {
            branch.save(object3).then((res) => {
              branch.save(object4).then((res) => {
                done();
              });
            });
          });
        });
      });
    });

    it("should return Count for valid attribute value", (done) => {
      // take one valid attribute and its value
      let res = branch.entityCounts("IVL","abc12","1",{
        processingStatus: "PENDING_AUTHORIZATION"
      });
         expect(res)
        .to.eventually.deep.equal(4)
        .notify(done);

    });

  });
});
