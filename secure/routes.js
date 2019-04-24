const path = require('path');
const client = require('apixu');
const config = client.config;
config.apikey = "80898612d8814943b6d82455192404";
const apixu = new client.Apixu(config);
var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');
var serviceAccount = require("./collegebuddy2019-firebase-adminsdk-0vpti-3bc7ce4404.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://collegebuddy2019.firebaseio.com"
});
module.exports = function (firebase) {
	var fn=require("./functions.js");
	router.get('/', (req, res) => res.render(path.resolve("public/index.html")))
	router.get('/login', (req, res) => {
		if(fn.checkLogin(req,firebase)){
			res.redirect("/dashboard");
		}
		else{
			res.render(path.resolve("public/login.html"))
		}
	});
	router.get('/signup', (req, res) => {
		if(fn.checkLogin(req,firebase)){
			res.redirect("/dashboard");
		}
		else{
			res.render(path.resolve("public/signup.html"));
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
		let dashinfo=require("./weather.json");
		apixu.forecast("auto:ip",7).then((forecast) => {
			fn.authRoute(req,res,firebase,"public/dashboard.html",forecast);
		}, (err) => {
			fn.authRoute(req,res,firebase,"public/dashboard.html",dashinfo);
		});
	});
	router.get("/notes",function(req, res){
		fn.authRoute(req,res,firebase,"public/notes.html");
	});
	router.get("/lostandfound",function(req, res){
		fn.authRoute(req,res,firebase,"public/lostandfound.html");
	});
	router.get("/settings",function(req, res){
		fn.authRoute(req,res,firebase,"public/settings.html");
	});
	router.get('/api',(req,res) => {
		let op=req.query.op;
		if(op){
			if(op=="get_lostandfound"){
				firebase.database().ref('/lostandfound').once('value').then(function(snapshot) {
					fn.sendResp(res,"GET_LOSTANDFOUND_SUC","Fetched Posts successfully",fn.reverseObject(snapshot.val()));
				}).catch((err)=>{
					fn.sendResp(res,"GET_LOSTANDFOUND_ERR","Failed to fetch posts");
				});
				
			}
			else{
				fn.sendResp(res);
			}
		}
		else{
			fn.sendResp(res);
		}
	});
	router.post('/api',(req, res) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		let response_sent=false;
		try{
			let op=req.body.op;
			if(op){
				if(op=="login"){
					firebase.auth().signInWithEmailAndPassword(req.body.email,req.body.password).catch((err)=>{
						fn.sendResp(res,err.code,err.message);
						response_sent=true;
					});
					firebase.auth().onAuthStateChanged(function(user) {
						if (user&&(!response_sent)) {
							user.getIdToken().then(function(idToken) {
								req.session.userId=idToken;
								req.session.displayName=user.displayName;
								fn.sendResp(res,"LOGIN_SUC","Login Successfull");
								response_sent=true;
							}).catch((err)=>{
							});
						}
					});
				}
				else if(op=="signup"){
					var user=null;
					firebase.auth().createUserWithEmailAndPassword(req.body.email,req.body.password).then(()=>{
						user = firebase.auth().currentUser;
						user.sendEmailVerification();
					}).then(()=>{
						user.updateProfile({
							displayName: req.body.username
						}).then(function(){
							req.session.displayName=req.body.username;
							fn.sendResp(res,"SIGNUP_SUC","Signup Successfull");
						}).catch((err)=>{
							fn.sendResp(res,err.code,err.message);
						});
					}).catch((err)=>{
						fn.sendResp(res,err.code,err.message);
					});
				}
				else if(op=="update_username"){
					var user = firebase.auth().currentUser;
					var credential = firebase.auth.EmailAuthProvider.credential(
					  firebase.auth().currentUser.email,
					  req.body.password
					);
					user.reauthenticateAndRetrieveDataWithCredential(credential).then(function() {
						user.updateProfile({
							displayName: req.body.username
						}).then(function(){
							req.session.displayName=req.body.username;
							fn.sendResp(res,"UPDATE_USERNAME_SUC","Username Updated Successfully");
						}).catch((err)=>{
							fn.sendResp(res,err.code,err.message);
						});
					}).catch((err)=>{
						fn.sendResp(res,err.code,err.message);
					});
				}
				else if(op=="update_password"){
					var user = firebase.auth().currentUser;
					var credential = firebase.auth.EmailAuthProvider.credential(
					  firebase.auth().currentUser.email,
					  req.body.old_password
					);
					user.reauthenticateAndRetrieveDataWithCredential(credential).then(function() {
						admin.auth().updateUser(firebase.auth().currentUser.uid,{
							password: req.body.new_password
						}).then(function(userRecord){
							console.log(userRecord.toJSON());
							fn.sendResp(res,"UPDATE_PASSWORD_SUC","Password Updated Successfully");
						}).catch((err)=>{
							fn.sendResp(res,err.code,err.message);
						});
					}).catch((err)=>{
						fn.sendResp(res,err.code,err.message);
					});
				}
				else if(op=="post_lostandfound"){
					firebase.database().ref('/lostandfound').push({"postUser":firebase.auth().currentUser.uid,"postTitle": req.body.post_title,"postMsg":req.body.post_msg,"postType":req.body.post_type,"postContact":req.body.post_contact}, function(error) {
						if (error){
							fn.sendResp(res,"POST_LOSTANDFOUND_ERR","Unable to Save New Post");
						}
						else{
							fn.sendResp(res,"POST_LOSTANDFOUND_SUC","Post Added Successfully");
						}
					});
				}
				else{
					fn.sendResp(res);
				}
			}
			else{
				fn.sendResp(res);
			}
		}catch(err){
			fn.sendResp(res,msg=err);
			console.log("Something went wrong!");
		}
	});
	router.get('*', function(req, res){
	  res.status(404).render(path.resolve("public/error.html"),{errcode:"404",errmsg:"Page Not Found"});
	});
	return router;
}