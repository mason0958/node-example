// ============================================================================= DEPENDENCIES
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var port       = process.env.PORT || 3005; 
var http       = require('http');
var oracledb   = require('oracledb');
var dbConfig   = require('./dbconfig.js');
var router     = express.Router();
var query      = "SELECT department_id, department_name " +
        		 "FROM departments " +
        		 "WHERE department_id = :id";



// var mysql = require('mysql');
// var options = {
// 	host: 'localhost',
// 	user: 'x',
// 	password: 'x',
// 	database: 'test_db'
// }

// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'me',
//   password : 'secret',
//   database : 'my_db'
// });



app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public')); 
app.get('/', function(req, res) {
		res.sendfile('./public/index.html');
});










app.use('/api', router);
app.listen(port);
console.log('Your not very secure server is running on: ' + port);


// router.post('/post', (req,res)=>{
// 	var id = req.body.id || null;
// 	console.log("The ID is****"+id);
// 	if (id != null) {
// 		res.status(200).json({'msg':'success', 'id': id});		
// 	}
// 	else {
// 		res.status(208).json({'msg': 'failed'});
// 	}

// });












