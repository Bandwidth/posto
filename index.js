"use strict";
let nodemailer = require("nodemailer");
let emailTemplates = require("email-templates");
let path = require("path");
let Joi = require("joi");


let optionsSchema = Joi.object().keys({
  from: Joi.string(),
  templatesOptions: Joi.object().keys({
    directory: Joi.string(),
    helpers: Joi.alternatives().try(Joi.array().min(1), Joi.string()),
  }),
  transport: Joi.alternatives().try(Joi.string(), Joi.func()).required(),
  transportOptions: Joi.object()
});


module.exports.register = function*(plugin, options){
  options = options || {};
  options = yield Joi.validate.bind(Joi, options, optionsSchema);
  options.templatesOptions = options.templatesOptions || {};
  options.templatesOptions.directory = options.templatesOptions.directory || "templates";
  let helpers = {};
  if(options.templatesOptions.helpers){
    plugin.dependency(options.templatesOptions.helpers, function*(){
      let emailTemplateHelpers = Array.isArray(options.templatesOptions.helpers) ?
        options.templatesOptions.helpers : [options.templatesOptions.helpers];
      emailTemplateHelpers.forEach(function(helper){
        let instance = (plugin.plugins[helper] || {}).emailTemplateHelpers || {};
        for(let k in instance){
          helpers[k] = instance[k];
        }
      });
    });
  }
  let template = yield emailTemplates.bind(this, options.templatesOptions.directory, options.templatesOptions);
  let getTransport = function(){
    let factory = (typeof options.transport === "string")?require(options.transport):options.transport;
    if(typeof factory !== "function"){
      throw new Error("Invalid nodemailer provider module \"" + options.transport + "\"");
    }
    return factory(options.transportOptions || {});
  };
  let sendEmail = function*(){
    let opts = {};
    let templateName, data = {};
    if(arguments.length == 1){
      opts = arguments[0];
    }
    if(arguments.length > 1){
      templateName = arguments[0];
      if(arguments.length > 2){
        data = arguments[1];
        opts = (typeof arguments[2] === "string")?{to: arguments[2]}:arguments[2];
      }
      else{
        opts = (typeof arguments[1] === "string")?{to: arguments[1]}:arguments[1];
      }
    }
    if(!opts.from) opts.from = options.from;
    let transport = nodemailer.createTransport(getTransport());
    if(!opts.from) throw new Error("Missing field 'from'");
    if(!opts.to) throw new Error("Missing field 'to'");
    if(templateName){
      let mergedData = {};
      for(let k in helpers){
        mergedData[k] = helpers[k];
      }
      for(let k in data){
        mergedData[k] = data[k];
      }
      let templateGenerator = template;
      if(opts.templatesDirectory){
        templateGenerator = yield emailTemplates.bind(this, opts.templatesDirectory, opts.templatesOptions || options.templatesOptions);
      }
      let res = yield templateGenerator.bind(this, templateName, mergedData);
      opts.html = res[0];
      opts.text = res[1];
    }
    yield transport.sendMail.bind(transport, opts);
  };
  plugin.expose("sendEmail", sendEmail);
  plugin.expose("getTransport", getTransport);
  plugin.expose("nodemailer", nodemailer);
  plugin.expose("emailTemplates", emailTemplates);
  plugin.expose("registerHelper", function(name, helper){
    helpers[name] = helper;
  });
};

module.exports.register.attributes = {
  pkg: require("./package.json")
};
