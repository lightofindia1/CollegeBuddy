const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 2000
const session = require('express-session');
const firebase = require('firebase');
const db = require("./secure/db.js");
firebase.initializeApp(db.config);

app.use('/assets',express.static(__dirname + '/public/assets'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(session({ secret: 'panda', cookie: { maxAge: 60000 }}))

const routes=require('./secure/routes.js')(firebase);
app.use("/",routes);

app.listen(port, () => console.log(`Server running at http:\/\/localhost:${port}`))