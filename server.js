
/*
    "node-fetch" package requires "module" type to be set.
    but we would have to use "import bla from bla" instead of "require()"
    i like require so here is a reconstructing of it
    ..what?? I dont even use node-fetch here
*/
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import fetch from "node-fetch";

const express = require("express");
const Datastore = require("nedb"); 
const database = new Datastore("database.db");
database.loadDatabase();


const app = express();
const port = process.env.PORT || 4242; //get the port number from webhosting server or 4242
app.listen(4242, ()=>{console.log(` >> listening at port:${port}...`)});
//create public(static) files
app.use(express.static("public"));
app.use(express.json({limit: "10mb"}));//our server will accept json



//client is requesting all the database
app.get("/database/:rangeIndex", (request, response) => {
    
    const rangeIndex = request.params.rangeIndex;
    database.find({}).sort({timestamp: -1}).limit(rangeIndex).exec((err,data)=>{
        if(err){
            response.end();
            console.log(err);
            return;
        }
        response.json(data);
    });
});

//client is sending data to database
app.post("/database/send", (request, response) => {
    const data = request.body;
    database.insert(data, (err, doc)=>{
       if(err){
        const answer = {
            id: "error",
            timestamp: "error",
            status : err,
        }
        response.json(answer);
        return;
       } 
        const answer = {
            id: doc._id,
            timestamp: doc.timestamp,
            status : "Succeed",
        }
        response.json(answer);    
    });
});


//client is sending like 
app.post("/database/like", (request, response) => {
    const postId = request.body.id;
    database.update({_id: postId},{$inc: {userLikesCount: 1}},{},(err,value)=>{
        if(err){
            response.end();
            console.log(err);
            return;
        }
        response.json({userLikesCount: value});    
    });
    
});










