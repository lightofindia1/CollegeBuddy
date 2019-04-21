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
				return true;
			}
			else{
				return false;
			}
		}
	}
}
module.exports = fn;