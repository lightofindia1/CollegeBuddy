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
		if(req.cookies.userId){
			return true;
		}
		else{
			var user = firebase.auth().currentUser;
			if(user){
				res.cookie('displayName', user.displayName,{maxAge: 604800000});
				res.cookie('userId', user.getUid(),{maxAge: 604800000});
				res.cookie('userEmail', user.email,{maxAge: 604800000});
				return true;
			}
			else{
				return false;
			}
		}
	},
	getUID:function(req,firebase){
		if(req.cookies.userId){
			return req.cookies.userId;
		}
		else{
			var user = firebase.auth().currentUser;
			if(user){
				return user.getUid();
			}
			else{
				return null;
			}
		}
	},
	authRoute:function(req,res,firebase,filepath,params={}){
		params["username"]=req.cookies.displayName||"noname";
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
	},
	slugify:function(string,length=30) {
	  const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;'
	  const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------'
	  const p = new RegExp(a.split('').join('|'), 'g')
	  return string.toString().toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
		.replace(/&/g, '-and-') // Replace & with ‘and’
		.replace(/[^\w\-]+/g, '') // Remove all non-word characters
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, '') // Trim - from end of text
		.substring(0,length)
	}
}
module.exports = fn;