const debug = require("debug")("evolvus-branch.test.index");
const chai = require("chai");
const mongoose = require("mongoose");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204:27017/TestPlatform_Dev";
/*
 ** chaiAsPromised is needed to test promises
 ** it adds the "eventually" property
 **
 ** chai and others do not support async / await
 */
const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);

const branch = require("../index");
const db = require("../db/entity");

describe('branch model validation', () => {
  let branchObject = {
    // add a valid branch Object here
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

  let invalidObject = {
    //add invalid branch Object here
    "tenantId": "IVL",
    "code": 4575678,
    "name": "branch1",
    "contact": {
      "tenantId": "tenId",
      "firstName": "Kamala",
      "middleName": "rani",
      "lastName": "p",
      "email": "kamala@gmail.com",
      "emailVerified": true,
      "phoneNo": "264123",
      "mobileNo": "9878586312",
      "mobileVerified": true,
      "faxNumber": "1221",
      "companyName": "Evolvus",
      "Address1": "Bangalore",
      "Address2": "chennai",
      "city": "Bangalore",
      "state": "karnataka",
      "country": "India",
      "zipCode": "6868"
    }
  };

  let undefinedObject; // object that is not defined
  let nullObject = null; // object that is null

  // before we start the tests, connect to the database
  before((done) => {
    mongoose.connect(MONGO_DB_URL);
    let connection = mongoose.connection;
    connection.once("open", () => {
      debug("ok got the connection");
      done();
    });
  });

  describe("validation against jsonschema", () => {
    it("valid branch should validate successfully", (done) => {
      try {
        var res = branch.validate(branchObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid branch object should not throw exception: ${e}`);
      }
    });

    it("invalid branch should return errors", (done) => {
      try {
        var res = branch.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    if ("should error out for undefined objects", (done) => {
        try {
          var res = branch.validate(undefinedObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

    if ("should error out for null objects", (done) => {
        try {
          var res = branch.validate(nullObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

  });

  describe("testing branch.save method", () => {

    beforeEach((done) => {
      db.deleteAll().then((res) => {
        done();
      });
    });

    it('should save a valid branch object to database', (done) => {
      try {
        var result = branch.save(branchObject);
        //replace anyAttribute with one of the valid attribute of a branch Object
        expect(result)
          .to.eventually.have.property("entityCode")
          .to.eql(branchObject.entityCode)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `saving branch object should not throw exception: ${e}`);
      }
    });

    it('should not save a invalid branch object to database', (done) => {
      try {
        var result = branch.save(invalidObject);
        expect(result)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe('testing branch.getAll when there is data in database', () => {
    let object1 = {
        //add one valid branch object here
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
      },
      object2 = {
        //add one more valid branch object here
        "tenantId": "IVL",
        "entityCode": "entity2",
        "name": "entity2",
        "parent": "entityparent2",
        "description": "entity2 description",
        "createdBy": "SYSTEM",
        "createdDate": new Date().toISOString(),
        "lastUpdatedDate": new Date().toISOString(),
        "entityId": "abc12def34",
        "accessLevel": "2"
      };
    let object3 = {
      "tenantId": "IVL",
      "entityCode": "entity3",
      "name": "entity3",
      "parent": "entityparent3",
      "description": "entity3 description",
      "createdBy": "SYSTEM",
      "createdDate": new Date().toISOString(),
      "lastUpdatedDate": new Date().toISOString(),
      "entityId": "abc12dfgh45",
      "accessLevel": "3"
    };
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(object1).then((res) => {
          db.save(object2).then((res) => {
            db.save(object3).then((res) => {
              done();
            });
          });
        });
      });
    });

    it('should return limited records as specified by the pageNo parameter', (done) => {
      try {
        let orderBy = {
        lastUpdatedDate: -1
        };
        let res = branch.getAll('IVL', 'abc12', "1", 2, 2,orderBy);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(1);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return records sorted by entityId if orderBy is null or undefined', (done) => {
      try {
        let res = branch.getAll('IVL', 'abc12', "1", 2,2, null);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(1);
            expect(docs[0])
              .to.have.property('entityId')
              .to.eql('abc12dfgh45');
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });


    it('should return records sorted by entityId', (done) => {
      try {
        let orderBy = {
        lastUpdatedDate: -1
        };
        let res = branch.getAll('IVL', 'abc12', "1",0, 2, orderBy);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(3);
            expect(docs[0])
              .to.have.property('entityId')
              .to.eql('abc12');
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe('testing branch.getAll when there is no data', () => {

    beforeEach((done) => {
      db.deleteAll().then((res) => {
        done();
      });
    });

    it('should return empty array when limit is -1', (done) => {
      try {
        let res = branch.getAll('IVL', 'abc12', "1",2, 2, null);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(0);
            expect(docs)
              .to.eql([]);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });

  describe('testing getById', () => {
    let branchObject = {
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
    // Insert one record , get its id
    // 1. Query by this id and it should return one branch object
    // 2. Query by an arbitrary id and it should return {}
    // 3. Query with null id and it should throw IllegalArgumentException
    // 4. Query with undefined and it should throw IllegalArgumentException
    var id;
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(branchObject).then((res) => {
          id = res._id;
          done();
        });
      });
    });

    it('should return one branch matching parameter id', (done) => {
      try {
        var res = branch.getById(id);
        expect(res).to.eventually.have.property('_id')
          .to.eql(id)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty object i.e. {} as no branch is identified by this Id ', (done) => {
      try {
        let badId = new mongoose.mongo.ObjectId();
        var res = branch.getById(badId);
        expect(res).to.eventually.to.eql({})
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Id parameter ", (done) => {
      try {
        let undefinedId;
        let res = branch.getById(undefinedId);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null Id parameter ", (done) => {
      try {
        let res = branch.getById(null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should be rejected for arbitrary object as Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value
      let id = branchObject;
      let res = branch.getById(id);
      expect(res)
        .to.eventually.to.be.rejectedWith("must be a single String of 12 bytes")
        .notify(done);
    });

  });

  describe("testing branch.getOne", () => {
    let object1 = {
        //add one valid branch object here
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
      },
      object2 = {
        //add one more valid branch object here
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
      db.deleteAll().then((res) => {
        db.save(object1).then((res) => {
          db.save(object2).then((res) => {
            done();
          });
        });
      });
    });

    it("should return one branch record identified by attribute", (done) => {
      try {
        // take one attribute from object1 or object2 and its value
        let res = branch.getOne(`entityCode`, `entity1`);
        expect(res)
          .to.eventually.be.a("object")
          .to.have.property('entityCode')
          .to.eql('entity1')
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty object i.e. {} as no branch is identified by this attribute', (done) => {
      try {
        // replace validAttribute and add a bad value to it
        var res = branch.getOne(`entityCode`, `1dfhty`);
        expect(res).to.eventually.to.eql({})
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Attribute parameter ", (done) => {
      try {
        //replace validvalue with a valid value for an attribute
        let undefinedAttribute;
        let res = branch.getOne(undefinedAttribute, `entity1`);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Attribute parameter ", (done) => {
      try {
        // replace validAttribute with a valid attribute name
        let undefinedValue;
        let res = branch.getOne(`entityCode`, undefinedValue);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null attribute parameter ", (done) => {
      try {
        //replace validValue with a valid value for an attribute
        let res = branch.getOne(null, `entity1`);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null value parameter ", (done) => {
      try {
        //replace attributeValue with a valid attribute name
        let res = branch.getOne(`entityCode`, null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });


  describe("testing branch.getMany", () => {
    let object1 = {
        //add one valid branch object here
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
      },
      object2 = {
        //add one more valid branch object here
        "tenantId": "IVL",
        "entityCode": "entity2",
        "name": "entity2",
        "parent": "entityparent2",
        "description": "entity2 description",
        "createdBy": "SYSTEM",
        "createdDate": new Date().toISOString(),
        "lastUpdatedDate": new Date().toISOString(),
        "entityId": "abc13def34",
        "accessLevel": "1"
      };
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(object1).then((res) => {
          db.save(object2).then((res) => {
            done();
          });
        });
      });
    });

    it("should return array of branch records identified by attribute", (done) => {
      try {
        // take one attribute from object1 or object2 and its value
        let res = branch.getMany(`entityCode`, `entity1`);
        expect(res).to.eventually.be.a("array");
        //enter proper length according to input value
        expect(res).to.eventually.have.length(1);
        done();
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty array i.e. [] as no branch is identified by this attribute', (done) => {
      try {
        // replace validAttribute and add a bad value to it
        var res = branch.getMany(`entityCode`, `dfgy`);
        expect(res).to.eventually.to.eql([])
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Attribute parameter ", (done) => {
      try {
        //replace validvalue with a valid value for an attribute
        let undefinedAttribute;
        let res = branch.getMany(undefinedAttribute, `entity1`);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Attribute parameter ", (done) => {
      try {
        // replace validAttribute with a valid attribute name
        let undefinedValue;
        let res = branch.getMany(`entityCode`, undefinedValue);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null attribute parameter ", (done) => {
      try {
        //replace validValue with a valid value for an attribute
        let res = branch.getMany(null, `entity1`);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null value parameter ", (done) => {
      try {
        //replace attributeValue with a valid attribute name
        let res = branch.getMany(`entityCode`, null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });
  //
  describe("testing filterByEntityDetails", () => {

    let object1 = {
        //add one valid role object here
        "tenantId": "IVL",
        "enabledFlag": true,
        "entityCode": "entity1",
        "name": "entity1",
        "parent": "entityparent1",
        "description": "entity1 description",
        "createdBy": "SYSTEM",
        "createdDate": new Date().toISOString(),
        "lastUpdatedDate": new Date().toISOString(),
        "entityId": "abc12",
        "accessLevel": "1"

      },
      object2 = {
        //add one more valid role object here
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
      db.deleteAll()
        .then((res) => {
          db.save(object1)
            .then((res) => {
              id = res._id;
              db.save(object2)
                .then((res) => {
                  done();
                });
            });
        });
    });

    //Query by processing status as PENDING_AUTHORIZATION, activationStatus as inACTIVE and applicationCode as CDA
    // It should return array with only one object
    it("should return filterd values based on query ", (done) => {
      var res = branch.filterByEntityDetails( "IVL","abc12","1",{
        "processingStatus": "PENDING_AUTHORIZATION"


      },5,1);
      expect(res).to.eventually.be.a("array")
        .to.have.length(2)
        .notify(done);
    });

    //Query by activation status as ACTIVE
    //It should return empty array as there are no entity with activation status as inACTIVE
    it("should return empty array as there are no entity matching the query parameter ", (done) => {
      var res = branch.filterByEntityDetails("IVL","abc12","1",{
        processingStatus: 'inACTIVE'
      },5,1);
      expect(res).to.eventually.be.a("array")
        .to.have.length(0)
        .notify(done);
    });

    it("should throw IllegalArgumentException for null query parameter ", (done) => {
      let res = branch.filterByEntityDetails(null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined query parameter ", (done) => {
      let undefinedQuery;
      let res = branch.filterByEntityDetails(undefinedQuery);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

  });

  describe("testing update Entity", () => {
    var id;

    let object1 = {
        //add one valid branch object here
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
      },
      object2 = {
        //add one more valid branch object here
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
      db.deleteAll()
        .then((res) => {
          db.save(object1)
            .then((res) => {
              id = res._id;
              db.save(object2)
                .then((res) => {
                  done();
                });
            });
        });
    });

    it('should update a entity and have same _id', (done) => {
      var res = branch.update(id, {
        name: "adminOne",
        parent: "IT"
      });
      expect(res)
        .to.eventually.be.a("object")
        .to.have.property("_id")
        .to.eql(id)
        .notify(done);
    });

    it('should update a entity with new values', (done) => {
      var res = branch.update(id, {
        name: "adminOne",
        parent: "IT"
      });
      expect(res)
        .to.eventually.be.a("object")
        .to.have.property("name")
        .to.eql("adminOne")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined Id parameter ", (done) => {
      let undefinedId;
      let res = branch.update(undefinedId, {
        name: "sdg"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for undefined update parameter ", (done) => {
      let undefinedUpdate;
      let res = branch.update(id, undefinedUpdate);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = branch.update(null, {
        roleName: "Admin"
      });
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });

    it("should throw IllegalArgumentException for null update parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value+
      let res = branch.update(id, null);
      expect(res)
        .to.eventually.to.be.rejectedWith("IllegalArgumentException")
        .notify(done);
    });
  });

  describe("testing getEntityCounts", () => {

    let object1 = {
        //add one valid role object here
        "tenantId": "IVL",
        "enabledFlag": true,
        "entityCode": "entity1",
        "name": "entity1",
        "parent": "entityparent1",
        "description": "entity1 description",
        "createdBy": "SYSTEM",
        "createdDate": new Date().toISOString(),
        "lastUpdatedDate": new Date().toISOString(),
        "entityId": "abc12",
        "accessLevel": "1"

      },
      object2 = {
        //add one more valid role object here
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
      db.deleteAll()
        .then((res) => {
          db.save(object1)
            .then((res) => {
              id = res._id;
              db.save(object2)
                .then((res) => {
                  done();
                });
            });
        });
    });

    //Query by processing status as PENDING_AUTHORIZATION, activationStatus as inACTIVE and applicationCode as CDA
    // It should return array with only one object
    it("should return entity count  based on query ", (done) => {
      var res = branch.getEntityCounts("IVL","abc12","1",{
        "processingStatus": "PENDING_AUTHORIZATION"
      });
      expect(res).to.eventually.deep.equal(2)
        .notify(done);
    });

    //Query by activation status as ACTIVE
    //It should return empty array as there are no entity with activation status as inACTIVE
    it("should return 0 as there are no entity matching the query parameter ", (done) => {
      var res = branch.getEntityCounts("IVL","abc12","1",{
        processingStatus: 'inACTIVE'
      });
      expect(res).to.eventually.deep.equal(0)
        .notify(done);
    });

});
});
