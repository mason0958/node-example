// ============================================================================= DEPENDENCIES
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var mysql = require('mysql');
var options = {
	host: 'localhost',
	user: 'x',
	password: 'x',
	database: 'test_db'
}
var port     = process.env.PORT || 3000; 
var http = require('http');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'my_db'
});

// =============================================================================== UTILITY MIDDLEWARE
app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// =============================================================================== WEBPAGE SERVER ROUTE
app.use(express.static(__dirname + '/public')); 
app.get('/', function(req, res) {
		res.sendfile('./public/index.html');
});


//================================================================================= ROUTES
var router = express.Router();





router.get('/getUsers', function(req, res) {
	connection.connect();
	connection.query('SELECT * FROM users', (error,results,fields)=>{
		if (error) throw error;

		res.json({'users': results[0]});
	});	
});


//---------------------------------
router.post('/token', (req,res)=>{

	var token = req.body.token;

	res.json({ 'token': token});
})

//---------------------------------

app.use('/api', router);

// =================================================================================== INITIATE ROUTES
app.listen(port);
console.log('Your not very secure API is running on: ' + port);












