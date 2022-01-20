var express = require('express');
var mongo = require('mongodb');
var dotenv = require('dotenv');
var bodyparser = require('body-parser');
var cors = require('cors');
var mongoclient = mongo.MongoClient;
dotenv.config();

var mongourl = "mongodb+srv://Robin:amanrobin@cluster0.q4zxq.mongodb.net/newdb?retryWrites=true&w=majority";
var port = process.env.PORT || 3333;
var app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(cors());
var db;
 


/* Default */
app.get('/',(req,res)=>{
    res.send('Default Route');
})

/*_____Lists all Cities______ */
app.get('/location',(req,res)=>{
    db.collection('location').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result); 
    })
})

/*_____Lists all Restaurants wrt city______ */
app.get('/restaurants/:id',(req,res) => {
    var id = parseInt(req.params.id);
    db.collection('restaurantdata').find({"state_id":id}).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

/*_____Lists all Mealtypes______ */
app.get('/mealtypes',(req,res) => {
    db.collection('mealtype').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

/*_____Restaurants wrt Mealtype selected______ */
app.get('/filter/:mealid',(req,res) => {

    var id = parseInt(req.params.mealid)
    var query = {"mealTypes.mealtype_id":id};
    var cuisine = parseInt(req.query.cuisine);
    var sort = {cost:1};
    var skip = 0;
    var limit = 0;
     
    if(req.query.sortkey){
        var sortkey = parseInt(req.query.sortkey)
        if(sortkey>1 || sortkey<-1 || sortkey==0){
            sortkey = 1;
        }
        sort = {cost:sortkey};
    }
    if(req.query.skip && req.query.limit){
        var skip  = parseInt(req.query.skip);
        var limit  = parseInt(req.query.limit);
    }
    if(req.query.lcost && req.query.hcost){
        var lcost = parseInt(req.query.lcost);
        var hcost = parseInt(req.query.hcost);
    }
    if(req.query.cuisine && req.query.lcost && req.query.hcost){
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"cuisines.cuisine_id":cuisine,"mealTypes.mealtype_id":id};
    }
    else if( req.query.lcost && req.query.hcost){
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":id};
    }
    else if(req.query.cuisine){
        query = {"mealTypes.mealtype_id":id,"cuisines.cuisine_id":cuisine};
    }
        
    db.collection('restaurantdata').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

/*_________Restaurant wrt its id_____________ */

app.get('/restaurant/:restid',(req,res) => {
    var restid = parseInt(req.params.restid);
    db.collection('restaurantdata').find({restaurant_id:restid}).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

/*_________Menu wrt restid_____________ */

app.get('/menu/:restid',(req,res) => {
    var restid = parseInt(req.params.restid);
    db.collection('menu').find({restaurant_id:restid}).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

/*________MenuItems wrt to menus selected_________*/
app.post('/menuitem',(req,res) => {
    db.collection('menu').find({menu_id:{ $in:req.body }}).toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

/*_____Post Orders______ */
app.post('/placeorder',(req,res) => {
    db.collection('orders').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

/*____Update Order_______*/
app.put('/updateStatus/:id',(req,res) => {
    var id = parseInt(req.params.id);
    var status = req.body.status?req.body.status:"Pending"
    db.collection('orders').updateOne(
        {"id":id},
        {
            $set:{
                "date": req.body.date,
                "bank_status": req.body.bank_status,
                "bank": req.body.bank,
                "status":status
            }
        }
    )
    res.send('Updated')
})

/*____Delete orders______ */
app.delete('/deleteorder',(req,res) => {
    db.collection('orders').remove({},(err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

/*______Return orders data_________ */
app.get('/orders',(req,res) => {
    db.collection('orders').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

mongoclient.connect(mongourl,(err,client)=>{
    if(err) console.log('Error in mongoclient');
    db = client.db('newdb');
    app.listen(port,()=>{
        console.log(`port ${port}`);
    })
})




// var express = require('express');
// var dotenv = require('dotenv');
// var fs = require('fs');
// dotenv.config();
// var port = process.env.port || 3333;

// var app = express();

// app.get('/',(req,res)=>{
//     fs.readFile('new.txt','utf-8',(err,data)=>{
//         res.send(data)
//     })
// })

// app.listen(port)

//___________returns promise
// app.get('/restaurant',(req,res)=>{
    // var ct = db.collection('restaurantdata').find().count().then((length)=>{console.log(length)});
    // var ct = db.collection('restaurantdata').countDocuments().then((length)=>{console.log(length)});
    
    // db.collection('restaurantdata').find().count({rating_text:"Good"}).then( (count) => {console.log(count) });
    // db.collection('restaurantdata').count({rating_text:"Good"}).then( (count) => {console.log(count) });
    // db.collection('restaurantdata').countDocuments({rating_text:"Good"}).then( (count) => {console.log(count) });

//     var count = db.collection('restaurant').countDocuments();
//     db.collection('restaurant').find({},{projection:{_id:0,restaurant_name:1}}).toArray((err,result)=>{
//         if (err) throw err;
//         res.send(result);
//         console.log(count)
//     })
// })
