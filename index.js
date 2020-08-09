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
var io            = require('socket.io').listen(server);
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var path          = require('path');

// Loading scenario
const scenario     = require('./lib/scenario_utils.js')(CONFIG_SERVER);
// Rfid parsing functions
var rfid           = require('./lib/rfid.js')(GLOBAL_CONFIG);

const httpPort    = CONFIG_SERVER.port;
// var formidable    = require('formidable'); // File upload

//------------------------------------------------------------------------
// Some usefull functions
//------------------------------------------------------------------------

//------------------------------------------------------------------------
// return the conf from server ip
//------------------------------------------------------------------------
function get_server_conf() {
  var cnf =  GLOBAL_CONFIG.servers.filter(server => server.ip == ip.address())[0];
  if (!cnf) {
    console.log("\nNo configuration was found with the IP '" + ip.address() + "' !\n");
    return process.exit(1);
  }
  return cnf;
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
      io.emit('toclient.refreshNow');
    });

    // setTimeout(function(){
    //   console.log("go to step-2...");
    //   scenario.setCurrentStepId("step-2");
    //   io.emit('toclient.refreshNow')}
    // , 5000);
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
    rfid.extractTag(msg);
    if (rfid.getCurrentCode() != "") {
      rfid.extractReader(msg);
      console.log("extracted rfid code : " + rfid.getCurrentCode() + " on reader #" + rfid.getCurrentReader());
      // Send Rfid code to client
      io.emit('toclient.currentBadge', {tag: rfid.getCurrentCode(), reader: rfid.getCurrentReader()});
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

if (GLOBAL_CONFIG.rfid.behavior == "emulated") {

  // Testing for null data
  // rfid.extractTag("\n");
  // rfid.extractReader("\n");
  // Testing for group A
  rfid.extractTag("<TAG:49426960/><READER:1/>");
  rfid.extractReader("<TAG:49426960/><READER:1/>");
  scenario.setCurrentStepId("step-2");
  // Testing for group B
  // rfid.extractTag("<TAG:CE4E2B60/><READER:2/>");
  // rfid.extractReader("<TAG:CE4E2B60/><READER:2/>");
  // Testing for group C
  // rfid.extractTag("<TAG:E12CD11D/><READER:3/>");
  // rfid.extractReader("<TAG:E12CD11D/><READER:3/>");

  console.log("extracted rfid code : " + rfid.getCurrentCode() + " on reader #" + rfid.getCurrentReader());
  io.emit('toclient.currentBadge', {tag: rfid.getCurrentCode(), reader: rfid.getCurrentReader()});
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
app.use('/js/xterm', express.static(__dirname + '/node_modules/xterm/lib')); // redirect JS for xTerm
app.use('/css/xterm', express.static(__dirname + '/node_modules/xterm/css')); // redirect CSS for xTerm

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

  // send solutions in the client's data
  dataForTemplate.solutions = scenario.getSolutionsForCurrentStep(rfid.getCurrentGroup());

  next(); // pass control to the next handler
})

/* POST home page. */
.post('/', function(req, res, next) {
  res.render('index', { data: dataForTemplate });
})

/* GET home page. 
  This route gives the right template to the client in term of scenario step
*/
.get('/', function(req, res, next) {
  // By default the template is "content.ejs"
  var tmpl = (dataForTemplate.currentStep.template == "") ? "content" : dataForTemplate.currentStep.template;
  
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
		rfid.groups_db.badges.push ( { 'code' : httpRequests.rfidcode, 'params' : {'group': httpRequests.group, 'subgroup': httpRequests.subgroup}} );
	}
	res.render('populate');
})

/* GET save page. */
.get('/save', function(req, res, next) {
	let data = JSON.stringify(rfid.groups_db, null, 4);
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
