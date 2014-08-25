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

