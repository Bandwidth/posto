"use strict";
let helper = require("./helper");
describe("posto", function(){
  let server;
  before(function*(){
    server = yield helper.startServer({
      transport: "stub"
    });
  });
  after(function*(){
    yield server.stop();
  });
  it("should provide method 'email.send' and expose some data", function*(){
    server.methods.email.send.should.be.a.function;
    server.plugins.posto.sendEmail.should.be.a.function;
    server.plugins.posto.nodemailer.should.be.ok;
    server.plugins.posto.emailTemplates.should.be.ok;
  });
});
