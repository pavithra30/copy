const debug = require("debug")("evolvus-menu.test.index");
const chai = require("chai");
const mongoose = require("mongoose");

var MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb://10.10.69.204/TestPlatform_Dev";
/*
 ** chaiAsPromised is needed to test promises
 ** it adds the "eventually" property
 **
 ** chai and others do not support async / await
 */
const chaiAsPromised = require("chai-as-promised");

const expect = chai.expect;
chai.use(chaiAsPromised);

const menu = require("../index");
const db = require("../db/menu");

describe('menu model validation', () => {
  let menuObject = {
    // add a valid menu Object here
    "tenantId": "IVL",
    "applicationCode": "FLUX-CDA",
    "menuGroupCode": "Audit",
    "title": "AUDIT",
    "menuItems": [{
        "menuItemType": "menu",
        "applicationCode": "FLUX-CDA",
        "menuItemCode": "ROLE",
        "title": "Role Management",
        "menuItemOrder": 1
      },
      {
        "menuItemType": "menu",
        "applicationCode": "FLUX-CDA",
        "menuItemCode": "ROLE",
        "title": "Role Management",
        "menuItemOrder": 1
      }
    ],
    "menuGroupOrder": 1,
    "createdDate": new Date().toISOString(),
    "createdBy": "system",
    "lastUpdatedDate": new Date().toISOString()
  };

  let invalidObject = {
    //add invalid menu Object here
    "tenantId": "IVL",
    "applicationCode": 234547,
    "menuGroupCode": 456,
    "title": "AUDIT",
    "menuItems": [{
        "menuItemType": "menu",
        "applicationCode": "FLUX-CDA",
        "menuItemCode": "ROLE",
        "title": "Role Management",
        "menuItemOrder": 1
      },
      {
        "menuItemType": "menu",
        "applicationCode": "FLUX-CDA",
        "menuItemCode": "USER",
        "title": "User Management",
        "menuItemOrder": 2
      }
    ],
    "menuGroupOrder": 2,
    "createdDate": new Date().toISOString(),
    "createdBy": "system",
    "lastUpdatedDate": new Date().toISOString()
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
    it("valid menu should validate successfully", (done) => {
      try {
        var res = menu.validate(menuObject);
        expect(res)
          .to.eventually.equal(true)
          .notify(done);
        // if notify is not done the test will fail
        // with timeout
      } catch (e) {
        expect.fail(e, null, `valid menu object should not throw exception: ${e}`);
      }
    });

    it("invalid menu should return errors", (done) => {
      try {
        var res = menu.validate(invalidObject);
        expect(res)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    if ("should error out for undefined objects", (done) => {
        try {
          var res = menu.validate(undefinedObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

    if ("should error out for null objects", (done) => {
        try {
          var res = menu.validate(nullObject);
          expect(res)
            .to.be.rejected
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

  });

  describe("testing menu.save method", () => {

    beforeEach((done) => {
      db.deleteAll().then((res) => {
        done();
      });
    });

    it('should save a valid menu object to database', (done) => {
      try {
        var result = menu.save(menuObject);
        //replace anyAttribute with one of the valid attribute of a menu Object
        expect(result)
          .to.eventually.have.property("applicationCode")
          .to.eql(menuObject.applicationCode)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `saving menu object should not throw exception: ${e}`);
      }
    });

    it('should not save a invalid menu object to database', (done) => {
      try {
        var result = menu.save(invalidObject);
        expect(result)
          .to.be.rejected
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe('testing menu.getAll when there is data in database', () => {
    let object1 = {
        //add one valid menu object here
        "tenantId": "IVL",
        "applicationCode": "FLUX-CDA",
        "menuGroupCode": "Audit",
        "title": "AUDIT",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "ROLE",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "USER",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 1,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
      },
      object2 = {
        //add one more valid menu object here
        "tenantId": "IVL",
        "applicationCode": "FLUX-CDA",
        "menuGroupCode": "AuditOne",
        "title": "AUDIT",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "ROLE",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "USER",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 2,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
      };
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(object1).then((res) => {
          db.save(object2).then((res) => {
            //db.save(object1).then((res)=> {
            done();
          });
        });
      });
      //});
    });

    it('should return limited records as specified by the limit parameter', (done) => {
      try {
        let res = menu.getAll(2);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(2);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return all records if limit is -1', (done) => {
      try {
        let res = menu.getAll(-1);
        expect(res)
          .to.be.fulfilled.then((docs) => {
            expect(docs)
              .to.be.a('array');
            expect(docs.length)
              .to.equal(2);
            done();
          });
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should throw IllegalArgumentException for null value of limit', (done) => {
      try {
        let res = menu.getAll(null);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should throw IllegalArgumentException for undefined value of limit', (done) => {
      try {
        let undefinedLimit;
        let res = menu.getAll(undefinedLimit);
        expect(res)
          .to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

  });

  describe('testing menu.getAll when there is no data', () => {

    beforeEach((done) => {
      db.deleteAll().then((res) => {
        done();
      });
    });

    it('should return empty array when limit is -1', (done) => {
      try {
        let res = menu.getAll(-1);
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

    it('should return empty array when limit is positive value ', (done) => {
      try {
        let res = menu.getAll(2);
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
    // Insert one record , get its id
    // 1. Query by this id and it should return one menu object
    // 2. Query by an arbitrary id and it should return {}
    // 3. Query with null id and it should throw IllegalArgumentException
    // 4. Query with undefined and it should throw IllegalArgumentException
    var id;
    beforeEach((done) => {
      db.deleteAll().then((res) => {
        db.save(menuObject).then((res) => {
          id = res._id;
          done();
        });
      });
    });
    describe("testing menu.getOne", () => {
      let object1 = {
          //add one valid menu object here
          "tenantId": "IVL",
          "applicationCode": "FLUX-CDA",
          "menuGroupCode": "Audit",
          "title": "AUDIT",
          "menuItems": [{
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "ROLE",
              "title": "Role Management",
              "menuItemOrder": 1
            },
            {
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "USER",
              "title": "User Management",
              "menuItemOrder": 2
            }
          ],
          "menuGroupOrder": 1,
          "createdDate": new Date().toISOString(),
          "createdBy": "system"

        },
        object2 = {
          //add one more valid menu object here
          "tenantId": "IVL",
          "applicationCode": "FLUX-CDA",
          "menuGroupCode": "Auditone",
          "title": "AUDIT",
          "menuItems": [{
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "ROLEONE",
              "title": "Role Management",
              "menuItemOrder": 1
            },
            {
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "USERONe",
              "title": "User Management",
              "menuItemOrder": 2
            }
          ],
          "menuGroupOrder": 2,
          "createdDate": new Date().toISOString(),
          "createdBy": "system"
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

      it("should return one menu record identified by attribute", (done) => {
        try {
          // take one attribute from object1 or object2 and its value
          let res = menu.getOne(`applicationCode`, `FLUX-CDA`);
          expect(res)
            .to.eventually.be.a("object")
            .to.have.property('applicationCode')
            .to.eql('FLUX-CDA')
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

      it('should return empty object i.e. {} as no menu is identified by this attribute', (done) => {
        try {
          // replace validAttribute and add a bad value to it
          var res = menu.getOne(`applicationCode`, `ujgvgy`);
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
          let res = menu.getOne(undefinedAttribute, `FLUX_CDA`);
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
          let res = menu.getOne(`applicationCode`, undefinedValue);
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
          let res = menu.getOne(null, `FLUX-CDA`);
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
          let res = menu.getOne(`applicationCode`, null);
          expect(res)
            .to.eventually.to.be.rejectedWith("IllegalArgumentException")
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });
    });


    describe("testing menu.getMany", () => {
      let object1 = {
          //add one valid menu object here
          "tenantId": "IVL",
          "applicationCode": "FLUX-CDA",
          "menuGroupCode": "AuditTwo",
          "title": "AUDIT",
          "menuItems": [{
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "ROLEtwo",
              "title": "Role Management",
              "menuItemOrder": 1
            },
            {
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "USERtwo",
              "title": "User Management",
              "menuItemOrder": 2
            }
          ],
          "menuGroupOrder": 1,
          "createdDate": new Date().toISOString(),
          "createdBy": "system"
        },
        object2 = {
          //add one more valid menu object here
          "tenantId": "IVL",
          "applicationCode": "FLUX-CDA",
          "menuGroupCode": "Auditone",
          "title": "AUDIT",
          "menuItems": [{
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "ROLEone",
              "title": "Role Management",
              "menuItemOrder": 1
            },
            {
              "menuItemType": "menu",
              "applicationCode": "FLUX-CDA",
              "menuItemCode": "USERone",
              "title": "User Management",
              "menuItemOrder": 2
            }
          ],
          "menuGroupOrder": 2,
          "createdDate": new Date().toISOString(),
          "createdBy": "system"
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

      it("should return array of menu records identified by attribute", (done) => {
        try {
          // take one attribute from object1 or object2 and its value
          let res = menu.getMany(`applicationCode`, `FLUX-CDA`);
          expect(res).to.eventually.be.a("array");
          //enter proper length according to input value
          expect(res).to.eventually.have.length(2);
          done();
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });

      it('should return empty array i.e. [] as no menu is identified by this attribute', (done) => {
        try {
          // replace validAttribute and add a bad value to it
          var res = menu.getMany(`applicationCode`, `jhvghf`);
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
          let res = menu.getMany(undefinedAttribute, `FLUX-CDA`);
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
          let res = menu.getMany(`applicationCode`, undefinedValue);
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
          let res = menu.getMany(null, `FLUX-CDA`);
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
          let res = menu.getMany(`applicationCode`, null);
          expect(res)
            .to.eventually.to.be.rejectedWith("IllegalArgumentException")
            .notify(done);
        } catch (e) {
          expect.fail(e, null, `exception: ${e}`);
        }
      });
    });

    it('should return one menu matching parameter id', (done) => {
      try {
        var res = menu.getById(id);
        expect(res).to.eventually.have.property('_id')
          .to.eql(id)
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty object i.e. {} as no menu is identified by this Id ', (done) => {
      try {
        let badId = new mongoose.mongo.ObjectId();
        var res = menu.getById(badId);
        expect(res).to.eventually.to.eql({})
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for undefined Id parameter ", (done) => {
      try {
        let undefinedId;
        let res = menu.getById(undefinedId);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should throw IllegalArgumentException for null Id parameter ", (done) => {
      try {
        let res = menu.getById(null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it("should be rejected for arbitrary object as Id parameter ", (done) => {
      // an id is a 12 byte string, -1 is an invalid id value
      let id = menuObject;
      let res = menu.getById(id);
      expect(res)
        .to.eventually.to.be.rejectedWith("must be a single String of 12 bytes")
        .notify(done);
    });

  });

  describe("testing menu.getOne", () => {
    let object1 = {
        //add one valid menu object here
        "tenantId": "IVL",
        "applicationCode": "FLUX-CDA",
        "menuGroupCode": "Audit",
        "title": "AUDIT",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "ROLE",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "USER",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 1,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"

      },
      object2 = {
        //add one more valid menu object here
        "tenantId": "IVL",
        "applicationCode": "FLUX-CDA",
        "menuGroupCode": "Auditone",
        "title": "AUDIT",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "ROLEONE",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "USERONe",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 2,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
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

    it("should return one menu record identified by attribute", (done) => {
      try {
        // take one attribute from object1 or object2 and its value
        let res = menu.getOne(`applicationCode`, `FLUX-CDA`);
        expect(res)
          .to.eventually.be.a("object")
          .to.have.property('applicationCode')
          .to.eql('FLUX-CDA')
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty object i.e. {} as no menu is identified by this attribute', (done) => {
      try {
        // replace validAttribute and add a bad value to it
        var res = menu.getOne(`applicationCode`, `ujgvgy`);
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
        let res = menu.getOne(undefinedAttribute, `FLUX_CDA`);
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
        let res = menu.getOne(`applicationCode`, undefinedValue);
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
        let res = menu.getOne(null, `FLUX-CDA`);
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
        let res = menu.getOne(`applicationCode`, null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });


  describe("testing menu.getMany", () => {
    let object1 = {
        //add one valid menu object here
        "tenantId": "IVL",
        "applicationCode": "FLUX-CDA",
        "menuGroupCode": "AuditTwo",
        "title": "AUDIT",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "ROLEtwo",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "USERtwo",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 1,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
      },
      object2 = {
        //add one more valid menu object here
        "tenantId": "IVL",
        "applicationCode": "FLUX-CDA",
        "menuGroupCode": "Auditone",
        "title": "AUDIT",
        "menuItems": [{
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "ROLEone",
            "title": "Role Management",
            "menuItemOrder": 1
          },
          {
            "menuItemType": "menu",
            "applicationCode": "FLUX-CDA",
            "menuItemCode": "USERone",
            "title": "User Management",
            "menuItemOrder": 2
          }
        ],
        "menuGroupOrder": 2,
        "createdDate": new Date().toISOString(),
        "createdBy": "system"
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

    it("should return array of menu records identified by attribute", (done) => {
      try {
        // take one attribute from object1 or object2 and its value
        let res = menu.getMany(`applicationCode`, `FLUX-CDA`);
        expect(res).to.eventually.be.a("array");
        //enter proper length according to input value
        expect(res).to.eventually.have.length(2);
        done();
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });

    it('should return empty array i.e. [] as no menu is identified by this attribute', (done) => {
      try {
        // replace validAttribute and add a bad value to it
        var res = menu.getMany(`applicationCode`, `jhvghf`);
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
        let res = menu.getMany(undefinedAttribute, `FLUX-CDA`);
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
        let res = menu.getMany(`applicationCode`, undefinedValue);
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
        let res = menu.getMany(null, `FLUX-CDA`);
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
        let res = menu.getMany(`applicationCode`, null);
        expect(res)
          .to.eventually.to.be.rejectedWith("IllegalArgumentException")
          .notify(done);
      } catch (e) {
        expect.fail(e, null, `exception: ${e}`);
      }
    });
  });
});