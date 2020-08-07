global.__basedir  = __dirname;
const GLOBAL_CONFIG        = require('./config/config.js');

// MVC Framework
var app           = require('express')();
var express       = require('express');
var router        = express.Router();
// Server utilities
var server        = require('http').createServer(app);
var ip            = require('ip');
const fs          = require('fs');

// Find configuration, with fixed IP
const CONFIG_SERVER = get_server_conf();

// Loading scenario
const scenario = require('./lib/scenario_utils.js')(CONFIG_SERVER);

const httpPort    = CONFIG_SERVER.port;
var io            = require('socket.io').listen(server);
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var path          = require('path');
// var formidable    = require('formidable'); // File upload

// Rfid parsing functions
var rfid          = require('./lib/rfid.js');
const { exit } = require('process');

// RFID Data structure
// var lastReadData = { code: "", reader: "" };
var rfidData     = { code: "x", reader: "1"};

// Databases
var db_rfid      = require(GLOBAL_CONFIG.app.dbPath + '/db-rfid.json');

//------------------------------------------------------------------------
// Some usefull functions
//------------------------------------------------------------------------

//------------------------------------------------------------------------
// return the conf from server ip
//------------------------------------------------------------------------
function get_server_conf() {
  return GLOBAL_CONFIG.servers.filter(server => server.ip == ip.address())[0];
}

//------------------------------------------------------------------------
// Init Socket to transmit Serial data to HTTP client
//------------------------------------------------------------------------
io.on('connection', function(socket) {
    console.log("New client is connected : " + socket.id );

    // Client asks for the next step
    io.on('toserver.nextStep', function(data){
      // The data var contains the next stepId that has been dexcribed and validated in the current step trnasition
      scenario.setCurrentStepId(data.nextStep);
      // Say to the client it has to refresh

    });

});

//------------------------------------------------------------------------
// Reading Serial Port (App have to be configure un 'real' mode, see below)
//------------------------------------------------------------------------
if (GLOBAL_CONFIG.rfid.behavior == "real") {
  const SerialPort = require('serialport');
  const Readline = SerialPort.parsers.Readline;
  const port = new SerialPort(GLOBAL_CONFIG.rfid.portName, {
      autoOpen: true,
      baudRate: GLOBAL_CONFIG.rfid.baudRate
    });
  // Parser definiton
  const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

  // Parsing RFID Tag
  parser.on('data', function(msg){
    // If data is a tag
    rfidData.code = rfid.extractTag(msg);
    if (rfidData.code != "") {
      rfidData.reader = rfid.extractReader(msg);
      console.log("extracted rfid code : " + rfidData.code + " on reader #" + rfidData.reader);
      // Send Rfid code to client
      io.emit('toclient.rfidData', {tag: rfidData.code, reader: rfidData.reader});
    }
  });

  // Opening serial port, checking for errors
  port.open(function (err) {
    if (err) {
      return console.log('Error opening port: ', err.message);
    } else {
      console.log('Reading on ', GLOBAL_CONFIG.rfid.portName);
    }
  });
}

//------------------------------------------------------------------------
// HTTP Server configuration
//------------------------------------------------------------------------
server.listen( httpPort, '0.0.0.0', function( ) {
  console.log( '------------------------------------------------------------' );
  console.log( 'server Ip Address is %s', ip.address() );
  console.log( 'it is listening at port %d', httpPort );
  console.log( '------------------------------------------------------------' );
  console.log( 'RFID reading is ' + GLOBAL_CONFIG.rfid.behavior);
  console.log( '------------------------------------------------------------' );
});

app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views/', scenario.data().templateDirectory));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/videos', express.static(__dirname + GLOBAL_CONFIG.app.mediaPath)); // redirect media directory
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/socket.io/dist')); // Socket.io
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

//-----------------------------------------------------------------------------
// Routing Middleware functions
// application logic is here / GET and POST on Index
//-----------------------------------------------------------------------------
var dataForTemplate = {};
var httpRequests = {};

router.all('/*', function (req, res, next) {
  // mettre toutes les requests dans un seul objet.
  httpRequests = req.query; // according to the use of express

  // Send server config to client
  dataForTemplate.config_server = CONFIG_SERVER;

  // send current step of the scenario to client
  dataForTemplate.currentStep = scenario.getCurrentStep();

  next(); // pass control to the next handler
})

/* POST home page. */
.post('/', function(req, res, next) {
  res.render('index', { data: dataForTemplate });
})

/* GET home page. 
  This route  gives the right template to the client in term of scenario step
*/
.get('/', function(req, res, next) {
  // We need to see what is the template for the currentStep
  var step = scenario.getCurrentStep();

  // By default the template is "content.ejs"
  var tmpl = (step.template == "") ? "content" : step.template;
  
  if (!fs.existsSync("./views/" + scenario.data().templateDirectory + tmpl + ".ejs")) { 
    console.log("The template ./views/" + scenario.data().templateDirectory + tmpl + ".ejs was not found.");
    next();
  } else {
    res.render(tmpl, { data: dataForTemplate });
  }
})

/* GET populate page. */
.get('/populate', function(req, res, next) {
	if (httpRequests && httpRequests.rfidcode) {
		db_rfid[httpRequests.rfidcode] = {'group': httpRequests.group, 'subgroup': httpRequests.subgroup};
	}
	res.render('populate');
})

/* GET save page. */
.get('/save', function(req, res, next) {
	let data = JSON.stringify(db_rfid, null, 4);
	fs.writeFileSync(GLOBAL_CONFIG.app.dbPath + '/db-rfid.json', data);

	res.end('{"success": "Sauvegarde ok !", "status": 200}');
})

//-----------------------------------------------------------------------------
// Application express
//-----------------------------------------------------------------------------
app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// all error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
