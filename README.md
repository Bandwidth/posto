# ⚠️ DEPRECATED⚠️ 

## posto
[![Build](https://travis-ci.org/bandwidthcom/posto.png)](https://travis-ci.org/bandwidthcom/posto)
[![Dependencies](https://david-dm.org/bandwidthcom/posto.png)](https://david-dm.org/bandwidthcom/posto)


Email service for hapi projects

## Install

```
npm install posto
```
and then use this plugin from code like

```
yield server.register(require("posto"));
```

or from  manifest file

```
"plugins":{
   "posto": {}
}
```

Also you can use yeoman generator to install this plugin

```
yo co-hapi:add-plugin posto
```

##Options
  * `transport` is name of transport module (required),
  * `transportOptions` are optional options for transport,
  * `from` is default 'from' field value (if ommited in sendEmail()),
  * `templatesOptions` contains options like `directory` (root directory for templates, default 'templates') and `helpers` (array of hapi modules with helper functions which can be used inside templates)

##Usage

### Sending of email
```
yield yield server.plugins.posto.sendEmail({from: "", to: "", subject: "", html: ""});
yield yield server.plugins.posto.sendEmail("template1", {from: "", to: "", subject: ""});
yield yield server.plugins.posto.sendEmail("template_with_data", data, {from: "", to: "", subject: ""});
```

### Getting transport instance
```
let transport = server.plugins.posto.getTransport();
```

### Sample of helper plugin

```
"use strict";
module.exports.register = function*(plugin){
  plugin.expose("emailTemplateHelpers", {
    test: function(s){
      return "hello " + s; // you can use function test() from templates now
    }
  });
};

module.exports.register.attributes = {
  name: "viewHelpers"
};


```

