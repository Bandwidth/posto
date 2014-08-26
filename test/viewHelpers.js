"use strict";
module.exports.register = function*(plugin){
  plugin.expose("emailTemplateHelpers", {
    test: function(s){
      return "hello " + s;
    }
  });
};

module.exports.register.attributes = {
  name: "viewHelpers"
};
