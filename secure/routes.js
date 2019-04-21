const path = require('path')
var express = require('express')
var router = express.Router()
module.exports = function (firebase) {
	var fn=require("./functions.js");
	router.get('/', (req, res) => res.sendFile(path.resolve("public/index.html")))
	router.get('/login', (req, res) => {
		if(fn.checkLogin(req,firebase)){
			res.redirect("/dashboard");
		}
		else{
			res.sendFile(path.resolve("public/login.html"))
		}
	});
	router.get('/signup', (req, res) => {
		if(fn.checkLogin(req,firebase)){
			res.redirect("/dashboard");
		}
		else{
			res.sendFile(path.resolve("public/signup.html"));
		}
	});

	router.get('/scan', (req, res) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		let FileObj=JSON.stringify(fn.dirTree(path.resolve("./uploads")), null, 4);
		res.send(FileObj);
	});

	router.get('/logout', (req,res) => {
		firebase.auth().signOut().then(function() {
		  req.session.destroy(function(err){});
		  res.redirect('/login');
		}).catch(function(error) {
		  res.send(error);
		});
	});
	router.get("/dashboard",function(req, res){
		if(fn.checkLogin(req,firebase)){
			res.sendFile(path.resolve("public/dashboard.html"));
		}
		else{
			res.redirect("/login");
		}
	});
	router.post('/api',(req, res) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		let response={"code":"INV_RQT","msg":"Invalid Request"};
		let response_sent=false;
		try{
			let op=req.body.op;
			if(op){
				if(op=="login"){
					firebase.auth().signInWithEmailAndPassword(req.body.email,req.body.password).catch((err)=>{
						response.code=err.code;
						response.msg=err.message;
						res.send(JSON.stringify(response));
						response_sent=true;
					});
					firebase.auth().onAuthStateChanged(function(user) {
						if (user&&(!response_sent)) {
							user.getIdToken().then(function(idToken) {
								response.code="LOGIN_SUC";
								response.msg="Login Successfull";
								req.session.userId=idToken;
								res.send(JSON.stringify(response));
							}).catch((err)=>{
							});
						}
					});
				}
				else if(op=="signup"){
					firebase.auth().createUserWithEmailAndPassword(req.body.email,req.body.password).then((user)=>{
						response.code="SIGNUP_SUC";
						response.msg="Signup Successfull";
						res.send(JSON.stringify(response));
					}).catch((err)=>{
						response.code=err.code;
						response.msg=err.message;
						res.send(JSON.stringify(response));
					});
				}
				else{
					res.send(JSON.stringify(response));
				}
			}
			else{
				res.send(JSON.stringify(response));
			}
		}catch(err){
			response["msg"]=err;
			res.send(JSON.stringify(response));
			console.log("Something went wrong!");
		}
	});
	router.get('*', function(req, res){
	  res.status(404).sendFile(path.resolve("public/404.html"));
	});
	return router;
}