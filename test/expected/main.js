define("three",[],function(){}),define("one",["./three"],function(){}),define("two",[],function(){}),require(["./one","./two"],function(){}),define("main.js",function(){});
