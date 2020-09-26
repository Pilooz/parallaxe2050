global.__basedir  = __dirname;
const GLOBAL_CONFIG        = require('./config/config.js');

// Events 
const EventEmitter = require('events').EventEmitter;
var eventEmitter = new EventEmitter();

// MVC Framework
var app           = require('express')();
var winston       = require('./lib/logger');
// var morgan        = require('morgan');

var express       = require('express');
var router        = express.Router();

// Server utilities
var server        = require('http').createServer(app);
const ip            = require('ip');
const fs          = require('fs');

// Find configuration, with fixed IP
const CONFIG_SERVER = get_server_conf();

var io            = require('socket.io').listen(server);
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var path          = require('path');

// Applicative libs
// Loading scenario
const scenario     = require('./lib/scenario_utils.js')(CONFIG_SERVER, eventEmitter);
// Logging system
const logger = require('./lib/logger')(scenario.data().scenarioId); 

// Rfid parsing functions
var rfid           = require('./lib/rfid.js')(GLOBAL_CONFIG, logger);
// Arduino stuffs 
var arduino1        = require('./lib/arduino.js')(GLOBAL_CONFIG.arduino1, logger, eventEmitter);
var arduino2        = require('./lib/arduino.js')(GLOBAL_CONFIG.arduino2, logger, eventEmitter);

// Loading Specific librairy for the specific scenario
var scenario_specifics;
if (fs.existsSync("./lib/scenario-" + scenario.data().scenarioId + ".js")){
  scenario_specifics = require('./lib/scenario-' + scenario.data().scenarioId + '.js')(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger);
}
// Monitoring system
mon = require('./lib/mon.js')(io, scenario, eventEmitter, logger);

const IsAdminServer =  (CONFIG_SERVER.ip == GLOBAL_CONFIG.app.adminServerIp);
const httpPort    = CONFIG_SERVER.port;

var dataForTemplate = {};
var httpRequests = {};


//------------------------------------------------------------------------
// data for ejs templates
//------------------------------------------------------------------------
// Putting default color set in data for ejs templates
//const defaultColors = require('./data/lights.json').colorsSet[0].list.filter(s => s.scenarioId == scenario.data().scenarioId)[0].rgb;
//dataForTemplate.currentBgColor = defaultColors;

// ************************************************************************
// ************************************************************************
//
//        G E S T I O N   D U    M O D E   D E   J E U 
//        - - - - - - - - - - - - - - - - - - - - - - 
// Il s'agit de positionner le container en mode "Classe" ou "Evénementiel"
//
//  - Mode classe : Le container est paramétré pour une classe. 
//                  Les session de jeu sont de 20 minutes.
//  - Mode Evénementiel : Le container est en mode évenementiel, 
//                        il est éventuellement ouvert, et les sessions 
//                        de jeu sont de 40 minutes.
//
//  Seul un serveur sur les 5 va gérer le mode de jeu pour tous les autres,
//  car il doit aussi gérer le timer.
// 
//  On va dire que c'est le serveur de l'activité "Hardware" qui n'en fiche pas une 
//  qui va gérer ça. (parallaxe2050-5)
//

if (IsAdminServer) {
  const lights   = require('./lib/lights-control')(GLOBAL_CONFIG, io, scenario, eventEmitter, logger);
  const timer   = require('./lib/timer')(GLOBAL_CONFIG, io, eventEmitter, logger);
}
// ************************************************************************
// ************************************************************************

//------------------------------------------------------------------------
// Some usefull functions
//------------------------------------------------------------------------

//------------------------------------------------------------------------
// return the conf from server ip
//------------------------------------------------------------------------
function get_server_conf() {
  var cnf =  GLOBAL_CONFIG.servers.filter(server => server.ip == ip.address())[0];
  if (!cnf) {
    console.error("\nNo configuration was found with the IP '" + ip.address() + "' !\n");
    return process.exit(1);
  }
  return cnf;
}

//------------------------------------------------------------------------
// Setup of environnment for the scenario.
// It is call each time a RFID badge is detected
//------------------------------------------------------------------------
function setup_scenario_environment(reInit) {
  logger.info( '---------------- setup_scenario_environment ------------------' );
  logger.info("extracted rfid code : " + rfid.getCurrentCode() + " on reader #" + rfid.getCurrentReader());
  // Putting Rfid Info in data for client
  dataForTemplate.currentRfidTag = rfid.getCurrentCode();
  dataForTemplate.currentRfidReader = rfid.getCurrentReader();
  dataForTemplate.scenarioId = scenario.data().scenarioId;
  // get the set of solutions for the group/subgroup team
  logger.info(`Current Team is ${rfid.getCurrentGroup()}${rfid.getCurrentSubGroup()}`);
  var set = scenario.setSolutionsSetForCurrentStep(rfid.getCurrentGroup(), rfid.getCurrentSubGroup());
  if (set > -1) {
    if (scenario.getOldSolutionsSet() != set || reInit) { 
      // On emet les events qui si le set de solution change de 1 à 2 ou de 2 à 1.
      // Si pas de solution on ignore
      // si même solution on ignore
      dataForTemplate.solutionsSet = set;
      logger.info(`Solutions set #${dataForTemplate.solutionsSet}`);
    
      // Set to FIRST step of the scenario.
      var firsStep = scenario.data().steps[0].stepId;
      scenario.setCurrentStepId(firsStep);

      // Emit a event to monitoring lib that pushes data to monitoring client
      eventEmitter.emit('monitoring.newGameSession', { tag: dataForTemplate.currentRfidTag, group: rfid.getCurrentGroup() + rfid.getCurrentSubGroup(), startTime: Date.now() });
      eventEmitter.emit('monitoring.newGameStep', {stepId: firsStep, totalSteps: scenario.data().steps.length});
      eventEmitter.emit('monitoring.colorsSets', {colorsSet: set});

      // Say to the client application to refresh now
      io.emit('toclient.refreshNow');
    } 
    // Emit solution for the step for each step change, not only if reInit or group changes
    eventEmitter.emit('monitoring.solutionsForStep', { solutions: scenario.getCurrentStep().solutions.filter(s => s.set == set), set: set, nextStep: scenario.getCurrentStep().transitions[0].id || null });

  } else {
    // Wrong badge on wrong device.
    // emit a socket to teel the client to refresh on error page
    // io.emit('toclient.errorOnBadge', {data: { errorMsg : "WRONG_CODE_ON_WRONG_DEVICE", errorPage, "/badgeError" } });
    // @TODO : do something clever here !!! 
  }
  logger.info( '------------------------------------------------------------' );
}
//------------------------------------------------------------------------
// Init Socket to transmit Serial data to HTTP client
//------------------------------------------------------------------------
io.on('connection', function(socket) {
    logger.info("New client is connected : " + socket.id );

    // Client asks for the next step
    socket.on('toserver.nextStep', function(data){
      // The data var contains the next stepId that has been dexcribed and validated in the current step trnasition
      logger.info("The client asked for the step '" + data.nextStep +  "'");
      scenario.setCurrentStepId(data.nextStep);
      // Say to the client it has to refresh
      socket.emit('toclient.refreshNow');
    });

    // Client asks for the previous step
    socket.on('toserver.previousStep', function(data){
      // The data var contains the previous stepId that has been described and validated in the previous step transition
      logger.info("The client asked for the step '" + data.previousStep +  "'");
      scenario.setCurrentStepId(data.previousStep);
      // Say to the client it has to refresh
      socket.emit('toclient.refreshNow');
    });

    socket.on('disconnect', function() {
      logger.info(' /!\\ Client is disconnected !');
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
    rfid.extractTag(msg);
    if (rfid.getCurrentCode() != "") {
      rfid.extractReader(msg);
      setup_scenario_environment(false);
    }
  });

  // Opening serial port, checking for errors
  port.open(function (err) {
    if (err) {
      return logger.error('Error opening port: ', err.message);
    } else {
      logger.info('Reading on ', GLOBAL_CONFIG.rfid.portName);
    }
  });
} 

if (GLOBAL_CONFIG.rfid.behavior == "emulated") {
  // Testing for group A1 7ED72360 (énigme "AdminReseau" ou énigme "ComDigitale")
  // rfid.extractTag("<TAG:C6C1441B/><READER:1/>");
  // rfid.extractReader("<TAG:C6C1441B/><READER:1/>");
  // Testing for group A2 5E3D621A (énigme "ComDigitale" ou énigme "AdminReseau") 
  rfid.extractTag("<TAG:5E3D621A/><READER:1/>");
  rfid.extractReader("<TAG:5E3D621A/><READER:1/>");
  // Testing for group A3 0EAF4C60 (énigme "Hardware" ou énigme "CodeEtProg") 
  // rfid.extractTag("<TAG:0EAF4C60/><READER:1/>");
  // rfid.extractReader("<TAG:0EAF4C60/><READER:1/>");
  // Testing for group A4 49426960 (énigme "CodeEtProg" ou énigme "BDD")
  // rfid.extractTag("<TAG:49426960/><READER:1/>");
  // rfid.extractReader("<TAG:49426960/><READER:1/>");
  // // Testing for group A5 5E68811A (énigme "BDD" ou énigme "Hardware")
  // rfid.extractTag("<TAG:5E68811A/><READER:1/>");
  // rfid.extractReader("<TAG:5E68811A/><READER:1/>");

  // Defining the step
  scenario.setCurrentStepId("step-1");

  setup_scenario_environment(false);
}

//------------------------------------------------------------------------
// HTTP Server configuration
//------------------------------------------------------------------------
server.listen( httpPort, ip.address(), function( ) {  // '0.0.0.0'
  logger.info( '------------------------------------------------------------' );
  logger.info( `server Ip Address is ${ip.address()}` );
  logger.info( `it is listening at port ${httpPort}` );
  logger.info( '------------------------------------------------------------' );
  logger.info( `RFID reading is ${GLOBAL_CONFIG.rfid.behavior}`);
  logger.info( '------------------------------------------------------------' );
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
// app.use('/medias', express.static(__dirname + GLOBAL_CONFIG.app.mediaPath)); // redirect media directory
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap')); // redirect bootstrap JS
app.use('/bootswatch', express.static(__dirname + '/node_modules/bootswatch')); // redirect bootswatch
app.use('/bootstrap-toggle', express.static(__dirname + '/node_modules/bootstrap-toggle')); // redirect bootstrap-toggle
app.use('/img/bootstrap-icons', express.static(__dirname + '/node_modules/bootstrap-icons/icons')); // redirect bootstrap icons
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/socket.io/dist')); // Socket.io
app.use('/js/xterm', express.static(__dirname + '/node_modules/xterm/lib')); // redirect JS for xTerm
app.use('/css/xterm', express.static(__dirname + '/node_modules/xterm/css')); // redirect CSS for xTerm
app.use('/js/video.js', express.static(__dirname + '/node_modules/video.js/dist')); // redirect JS for video.js player
app.use('/js/highlight', express.static(__dirname + '/node_modules/highlight.js')); // redirect JS for highligth.js player
//-----------------------------------------------------------------------------
// Routing Middleware functions
// application logic is here / GET and POST on Index
//-----------------------------------------------------------------------------
router.all('/*', function (req, res, next) {
  // mettre toutes les requests dans un seul objet.
  httpRequests = req.query; // according to the use of express

  // Send server config to client
  dataForTemplate.global_config = GLOBAL_CONFIG;
  dataForTemplate.config_server = CONFIG_SERVER;

  // send current step of the scenario to client
  dataForTemplate.currentStep = scenario.getCurrentStep();
  logger.info(`Current step is '${dataForTemplate.currentStep.stepId}'`);

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

  dataForTemplate.currentGroup = rfid.getCurrentGroup();
  dataForTemplate.currentSubGroup = rfid.getCurrentSubGroup();

  // If this set if undefined, then the team has not badged to the right activity => let's tell them gentlely !
  if (!dataForTemplate.solutionsSet) {
    logger.info("Pas de set de solution pour cette team sur ce dispositif. Attente de scan RFID...");
    res.render("../waiting", { data: dataForTemplate });
  }  
  dataForTemplate.solutions = dataForTemplate.currentStep.solutions.filter(s => s.set == dataForTemplate.solutionsSet)[0].responses;

  // By default the template is "content.ejs"
  var tmpl = (dataForTemplate.currentStep.template == "") ? "content" : dataForTemplate.currentStep.template;
  
  if (!fs.existsSync("./views/" + scenario.data().templateDirectory + tmpl + ".ejs")) { 
    logger.info("The template ./views/" + scenario.data().templateDirectory + tmpl + ".ejs was not found.");
    next();
  } else {
    res.render(tmpl, { data: dataForTemplate });
  }
})

//
// Handle Badge Error
//
.get('/hologramme', function(req, res, next){
  res.render( 'hologramme', { data: dataForTemplate });
})

//
// Back-office 
//
/* GET populate page. */
.get('/populate', function(req, res, next) {
	if (httpRequests && httpRequests.rfidcode) {
		rfid.groups_db.badges.push ( { 'code' : httpRequests.rfidcode, 'params' : {'group': httpRequests.group, 'subgroup': httpRequests.subgroup}} );
	}
	res.render('populate');
})

//
// Monitoring of all the systems
//
.get(['/admin', '/monitoring'], function(req,res,next){
  if (!IsAdminServer) {
    // Redirect vers le serveur d'admin
    res.redirect(`http://${GLOBAL_CONFIG.app.adminServerIp}:${GLOBAL_CONFIG.app.adminServerPort}/monitoring`);
  }
    res.render( '../monitoring', { data: dataForTemplate });
})

/* GET save page. */
.get('/save', function(req, res, next) {
	let data = JSON.stringify(rfid.groups_db, null, 4);
	fs.writeFileSync(GLOBAL_CONFIG.app.dbPath + '/db-rfid.json', data);

	res.end('{"success": "Sauvegarde ok !", "status": 200}');
})

//-----------------------------------------------------------------------------
// APIs for monitoring/admin
//-----------------------------------------------------------------------------
// Restart activity
.get("/api/restart", function(req, res, next){
  logger.info("restarting activity from admin page...");
  // Set Current Step as first step
  var firstStep = scenario.data().steps[0].stepId;
  scenario.setCurrentStepId(firstStep);
  setup_scenario_environment(true); 
  io.emit('toclient.refreshNow');

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({message: `Opération réussie !<br/>L'activité est revenue à l'étape '${firstStep}'.`, status: 200}));
})

// Forcing to next step
.get("/api/nextStep", function(req, res, next){
  logger.info("Going to next activity step from admin page...");
  var nextStep = scenario.getCurrentStep().transitions[0].id;
  scenario.setCurrentStepId(nextStep);
  setup_scenario_environment(false); 
  io.emit('toclient.refreshNow');

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({message: `Opération réussie !<br/>L'activité est passée à l'étape '${nextStep}'.`, status: 200}));
})

.get('/api/refresh', function(req, res, next){
  io.emit('toclient.refreshNow');
})

.get('/timer', function(req, res, next) {
    if (!IsAdminServer) {
      // Redirect vers le serveur d'admin
      res.redirect(`http://${GLOBAL_CONFIG.app.adminServerIp}:${GLOBAL_CONFIG.app.adminServerPort}/timer`);
    }
    res.render('../timer', { data: dataForTemplate });
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

  // add this line to include winston logging
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
