"use strict";
let nodemailer = require("nodemailer");
let emailTemplates = require("email-templates");
let path = require("path");
let Joi = require("joi");

function loadModules(modules){
  if(typeof modules === "string"){
    modules = [modules];
  }
  if(!Array.isArray(modules)){
    return modules;
  }
  let result = {};
  modules.forEach(function(module){
    module = (typeof module === "string")?require(module):module;
    for(let k in modules){
      result[k] = modules[k];
    }
  });
}


var optionsSchema = Joi.object().keys({
  templatesOptions: Joi.object().keys({
    directory: Joi.string(),
    partials: Joi.alternatives().try(Joi.array().min(1), Joi.string()),
    helpers: Joi.alternatives().try(Joi.array().min(1), Joi.string()),
  }),
  transport: Joi.string().required(),
  from: Joi.string()
});


module.exports.register = function*(plugin, options){
  options = options || {};
  options = yield Joi.validate.bind(Joi, options, optionsSchema);
  options.templatesOptions = options.templatesOptions || {};
  options.templatesOptions.directory = options.templatesOptions.directory || "templates";
  options.templatesOptions.partials = loadModules(options.templatesOptions.partials);
  options.templatesOptions.helpers = loadModules(options.templatesOptions.helpers);
  let template = yield emailTemplates.bind(this, options.templatesOptions, options.templatesOptions.directory);
  let sendEmail = function(){
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
    let transport = this.transport = emailer.createTransport(options.transport, options);
    return function(callback){
      let cb = function(err){
        if(err){
          let error = new Error("Error on sending email: " + (err.message || err) + ". Please check email settings.");
          error.error = err;
          callback(error);
        }
        else{
          callback.apply(this, arguments);
        }
      };
      if(!opts.from) return cb(new Error("Missing field 'from'"));
      if(!opts.to) return cb(new Error("Missing field 'to'"));
      if(templateName){
        return template(templateName, data, function(err, html, text){
          if(err) return cb(err);
          opts.html = html;
          opts.text = text;
          transport.sendMail(opts, cb);
        });
      }
      else{
        transport.sendMail(opts, cb);
      }
    };
  }
  plugin.expose("sendEmail", sendEmail);
  plugin.methods("email.send", sendEmail);
  plugin.expose("nodemailer", nodemailer);
  plugin.expose("emailTemplates", emailTemplates);
};
