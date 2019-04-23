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
	authRoute:function(req,res,firebase,filepath){
		if(fn.checkLogin(req,firebase)){
			res.render(path.resolve(filepath),{username:req.session.displayName||"noname"});
		}
		else{
			res.redirect("/login?redirect="+req.url);
		}
	},
	sendResp:function(res,code="INV_RQT",msg="Invalid Request"){
		res.send(JSON.stringify({"code":code,"msg":msg}));
	}
}
module.exports = fn;