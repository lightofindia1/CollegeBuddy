const fs = require('fs')
const path = require('path')
var fn={
	dirTree:function(filename) {
		var filename=filename.split("\\").pop();
		var stats = fs.lstatSync(filename),
			info = {
				"name": path.basename(filename),
				"path": filename
			};
		if (stats.isDirectory()) {
			info["type"] = "folder";
			info["items"] = fs.readdirSync(filename).map(function(child) {
				return fn.dirTree(filename + '/' + child);
			});
		} else {
			info["type"] = "file";
			info["size"] = stats["size"];
		}
		return info;
	},
	checkLogin:function(req,firebase){
		if(req.session.userId){
			return true;
		}
		else{
			var user = firebase.auth().currentUser;
			if(user){
				req.session.displayName=user.displayName;
				return true;
			}
			else{
				return false;
			}
		}
	},
	authRoute:function(req,res,firebase,filepath,params={}){
		params["username"]=req.session.displayName||"noname";
		if(fn.checkLogin(req,firebase)){
			res.render(path.resolve(filepath),params);
		}
		else{
			res.redirect("/login?redirect="+req.url);
		}
	},
	sendResp:function(res,code="INV_RQT",msg="Invalid Request",value={}){
		if(value){
			res.send(JSON.stringify({"code":code,"msg":msg,"value":value}));
		}
		else{
			res.send(JSON.stringify({"code":code,"msg":msg}));
		}
	},
	reverseObject:function(object) {
		var newObject = {};
		var keys = [];
		for (var key in object) {
			keys.push(key);
		}
		for (var i = keys.length - 1; i >= 0; i--) {
			var value = object[keys[i]];
			newObject[keys[i]]= value;
		}
		return newObject;
	}
}
module.exports = fn;