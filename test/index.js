"use strict";
let helper = require("./helper");
let sinon = require("sinon");
let Hapi = require("co-hapi");
describe("posto", function(){
  let server;
  before(function*(){
    server = yield helper.startServer({
      transport: "demo",
      transportOptions: {
        setting1: "test1",
        setting2: 10
      },
      from: "globalFrom",
      templatesOptions: {
        helpers: "viewHelpers"
      }
    });
  });
  after(function*(){
    yield server.stop();
  });
  it("should expose some data", function*(){
    server.plugins.posto.sendEmail.should.be.a.function;
    server.plugins.posto.nodemailer.should.be.ok;
    server.plugins.posto.emailTemplates.should.be.ok;
  });
  it("should fail if required options are missing", function*(){
    try{
      let server = new Hapi.Server("localhost", 3002);
      yield server.pack.register([
        {plugin: require(".."), options: {}}
      ]);
    }
    catch(err){
      return;
    }
    throw new Error("An exception is estimated here");
  });
  describe("#sendEmail", function(){
    let createTransportStub, sendMailSpy;
    beforeEach(function(){
      let fakeTransport = {
        sendMail: function(opts, callback){
          callback();
        }
      };
      createTransportStub = sinon.stub(server.plugins.posto.nodemailer, "createTransport").returns(fakeTransport);
      sendMailSpy = sinon.spy(fakeTransport, "sendMail");
    });

    afterEach(function(){
      createTransportStub.restore();
      sendMailSpy.restore();
    });

    it("should pass right params to nodemailer transport (with 1 arg)", function*(){
      let data = {
        from: "from",
        to: "to",
        subject: "subject",
        html: "text"
      };
      yield server.plugins.posto.sendEmail(data);
      createTransportStub.callCount.should.equal(1);
      sendMailSpy.callCount.should.equal(1);
      createTransportStub.args[0][0].should.equal("demo");
      createTransportStub.args[0][1].should.eql({
        setting1: "test1",
        setting2: 10
      });
      sendMailSpy.args[0][0].should.eql(data);
    });

    it("should pass right params to nodemailer transport (with 2 args)", function*(){
      let data = {
        from: "from",
        to: "to",
        subject: "subject"
      };
      yield server.plugins.posto.sendEmail("template1", data);
      sendMailSpy.callCount.should.equal(1);
      data.text = "Text content";
      data.html = "<p>Html content</p>";
      sendMailSpy.args[0][0].should.eql(data);
    });

    it("should pass right params to nodemailer transport (with 3 args)", function*(){
      let data = {
        from: "from",
        to: "to",
        subject: "subject"
      };
      yield server.plugins.posto.sendEmail("template2", {item: 1}, data);
      sendMailSpy.callCount.should.equal(1);
      data.text = "Text content 1";
      data.html = "<p>Html content 1</p>";
      sendMailSpy.args[0][0].should.eql(data);
    });

    it("should use global 'from' value if it is missing in options", function*(){
      let data = {
        to: "to",
        html: "message"
      };
      yield server.plugins.posto.sendEmail(data);
      sendMailSpy.args[0][0].from.should.equal("globalFrom");
    });

    it("should fail if 'from' or 'to' are missing", function*(){
      try{
        let data = {
          subject: "subject",
          html: "message"
        };
        yield server.plugins.posto.sendEmail(data);
      }
      catch(err){
        return;
      }
      throw new Error("An exception is estimated here");
    });

    it("should support view helpers", function*(){
      yield server.plugins.posto.sendEmail("template3", "to");
      let data = sendMailSpy.args[0][0];
      data.from.should.equal("globalFrom");
      data.to.should.equal("to");
      data.html.should.equal("hello world");
    });
  });
});
