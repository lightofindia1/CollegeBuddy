const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const port = process.env.PORT || 5050
const session = require('express-session');
const cookieParser = require('cookie-parser');
const firebase = require('firebase');
const db = require("./secure/db.js");
firebase.initializeApp(db.config);

app.use('/assets',express.static(__dirname + '/public/assets'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(session({ secret: 'panda', cookie: { maxAge: 60000 }}))
app.use(cookieParser())
app.engine('html', require('ejs').renderFile);

const routes=require('./secure/routes.js')(firebase);
app.use("/",routes);
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render(path.resolve("public/error.html"),{errcode:err.status||500,errmsg:err.message});
});

app.listen(port, () => console.log(`Server running at http:\/\/localhost:${port}`))