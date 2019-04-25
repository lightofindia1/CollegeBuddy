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
		  res.clearCookie("userId");
		  res.clearCookie("displayName");
		  res.clearCookie("userEmail");
		  res.redirect('/login');
		}).catch(function(error) {
		  res.send("Error: "+error);
		});
	});
	router.get("/dashboard",function(req, res){
		let dashinfo=require("./weather.json");
		apixu.forecast("Bangalore",7).then((forecast) => {
			fn.authRoute(req,res,firebase,"public/dashboard.html",forecast);
		}, (err) => {
			fn.authRoute(req,res,firebase,"public/dashboard.html",dashinfo);
		});
	});
	router.get("/notes",function(req, res){
		fn.authRoute(req,res,firebase,"public/notes.html");
	});
	router.get("/clubs",function(req, res){
		fn.authRoute(req,res,firebase,"public/clubs.html");
	});
	router.get("/clubs/:clubSlug",function(req, res,next){
		firebase.database().ref().child("clubs").orderByChild("clubSlug").equalTo(req.params.clubSlug).once("value", function (snapshot) {
			snapshot.forEach(function(childSnapshot) {
				response=childSnapshot.val();
				response["clubID"]=childSnapshot.key;
				if(response.members.indexOf(req.cookies.userEmail)>=0){
					response["isMember"]=true;
				}
				else{
					response["isMember"]=false;
				}
				fn.authRoute(req,res,firebase,"public/clubdetails.html",response);
				return false;
			});
		}).catch((err)=>{
			next();	
		});
	});
	router.get("/events",function(req, res){
		fn.authRoute(req,res,firebase,"public/events.html");
	});
	router.get("/events/:eventSlug",function(req, res,next){
		firebase.database().ref().child("events").orderByChild("eventSlug").equalTo(req.params.eventSlug).once("value", function (snapshot) {
			snapshot.forEach(function(childSnapshot) {
				response=childSnapshot.val();
				response["currentUserEmail"]=req.cookies.userEmail;
				fn.authRoute(req,res,firebase,"public/eventdetails.html",response);
				return false;
			});
		}).catch((err)=>{
			next();	
		});
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
			else if(op=="get_events"){
				firebase.database().ref('/events').once('value').then(function(snapshot) {
					fn.sendResp(res,"GET_EVENTS_SUC","Fetched Events successfully",fn.reverseObject(snapshot.val()));
				}).catch((err)=>{
					fn.sendResp(res,"GET_EVENTS_ERR","Failed to fetch events");
				});
			}
			else if(op=="get_clubs"){
				firebase.database().ref('/clubs').once('value').then(function(snapshot) {
					fn.sendResp(res,"GET_CLUBS_SUC","Fetched Events successfully",{"data":fn.reverseObject(snapshot.val()),"currentUserEmail":req.cookies.userEmail});
				}).catch((err)=>{
					fn.sendResp(res,"GET_CLUBS_ERR","Failed to fetch events");
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
								res.cookie('userId', idToken,{maxAge: 604800000});
								res.cookie('displayName', user.displayName,{maxAge: 604800000});
								res.cookie('userEmail', req.body.email,{maxAge: 604800000});
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
							res.cookie('userId', user.getUid(),{maxAge: 604800000});
							res.cookie('displayName', user.displayName,{maxAge: 604800000});
							res.cookie('userEmail', req.body.email,{maxAge: 604800000});
							fn.sendResp(res,"SIGNUP_SUC","Signup Successfull");
						}).catch((err)=>{
							fn.sendResp(res,err.code,err.message);
						});
					}).catch((err)=>{
						fn.sendResp(res,err.code,err.message);
					});
				}
				else if(op=="create_club"){
					let slug=fn.slugify(req.body.clubName);
					firebase.database().ref('/clubs').push({
						"clubName": req.body.clubName,
						"clubSlug":slug,
						"clubMission":req.body.clubMission,
						"clubVission":req.body.clubVission,
						"createdBy":req.cookies.userEmail,
						"createdOn":Date.now(),
						"members":[req.cookies.userEmail]
					}, function(error) {
						if (error){
							fn.sendResp(res,"CREATE_CLUB_ERR","Unable to Create New Club");
						}
						else{
							fn.sendResp(res,"CREATE_CLUB_SUC","Club Created Successfully",{redirectLoc:"/clubs/"+slug});
						}
					});
				}
				else if(op=="join_club"){
					let membersRef=firebase.database().ref('/clubs/'+req.body.clubID+'/members');
					membersRef.once('value').then(function(snap){
						let members=snap.val();
						members.push(req.cookies.userEmail);
						membersRef.set(members,function(err){
							if(err){
								fn.sendResp(res,"JOIN_CLUB_ERR","Unable to Join Club");
							}
							else{
								fn.sendResp(res,"JOIN_CLUB_SUC","Club Joined Successfully");
							}
						});
					}).catch((err)=>{
						fn.sendResp(res,err.code,err.message);
					});
				}
				else if(op=="quit_club"){
					firebase.database().ref('/clubs/'+req.body.clubID).once('value').then(function(snap){
						let snapshot=snap.val();
						if (snapshot.createdBy==req.cookies.userEmail)
						{
							fn.sendResp(res,"QUIT_CLUB_ERR","Creator Cannot Quit the Club");
						}
						else{
							let members=snapshot.members;
							let mi = members.indexOf(req.cookies.userEmail);
							if (mi > -1) {
								members.splice(mi, 1);
							}
							firebase.database().ref('/clubs/'+req.body.clubID+'/members').set(members,function(err){
								if(err){
									fn.sendResp(res,"QUIT_CLUB_ERR","Unable to Quit Club");
								}
								else{
									fn.sendResp(res,"QUIT_CLUB_SUC","Quit Club Successfully");
								}
							});
						}
					}).catch((err)=>{
						fn.sendResp(res,err.code,err.message);
					});
				}
				else if(op=="post_event"){
					let slug=fn.slugify(req.body.eventTitle);
					firebase.database().ref('/events').push({"byUser":fn.getUID(req,firebase),"eventTitle": req.body.eventTitle,"eventSlug":slug,"eventDate":req.body.eventDate,"eventFee":req.body.eventFee,"eventDesc":req.body.eventDesc}, function(error) {
						if (error){
							fn.sendResp(res,"POST_EVENT_ERR","Unable to Save New Event");
						}
						else{
							fn.sendResp(res,"POST_EVENT_SUC","Event Added Successfully",{redirectLoc:"/events/"+slug});
						}
					});
				}
				else if(op=="post_lostandfound"){
					firebase.database().ref('/lostandfound').push({"postUser":fn.getUID(req,firebase),"postTitle": req.body.post_title,"postMsg":req.body.post_msg,"postType":req.body.post_type,"postContact":req.body.post_contact}, function(error) {
						if (error){
							fn.sendResp(res,"POST_LOSTANDFOUND_ERR","Unable to Save New Post");
						}
						else{
							fn.sendResp(res,"POST_LOSTANDFOUND_SUC","Post Added Successfully");
						}
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
							res.cookie('displayName', req.body.username);
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
						admin.auth().updateUser(fn.getUID(req,firebase),{
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
				else{
					fn.sendResp(res);
				}
			}
			else{
				fn.sendResp(res);
			}
		}catch(err){
			fn.sendResp(res,msg=err);
			console.log("Something went wrong!\n"+err);
		}
	});
	router.get('*', function(req, res){
	  res.status(404).render(path.resolve("public/error.html"),{errcode:"404",errmsg:"Page Not Found"});
	});
	return router;
}