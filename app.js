// set up ======================================================================
var express = require('express')
    , app = express()
    , bodyParser = require('body-parser')
    , server = require('http').createServer(app)
    , flash = require('connect-flash')
    , io = require('socket.io').listen(server)
    , port = 80
    , chalk = require('chalk')
    , db = require('./db');
const crypto = require('crypto');

// optimization ================================================================
var compress = require('compression');
app.use(compress());

// configuration ===============================================================
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(flash());

// set up the RethinkDB database
db.setup();

// routes ======================================================================
require('./routes')(app);

// socket.io ===================================================================
io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('create_chat', function(){
        var current_time = new Date();
        crypto.pbkdf2(current_time.getTime().toString(), 'salt', 100000, 4, 'sha256', (err, key) => {
            if (err) throw err;
            var hash = key.toString('hex');
            db.createChat(hash);
            io.emit('chat_created', hash);
        });
    });
});

// launch ======================================================================
server.listen(port, function(){
    var message = '[SERVER] Started server on localhost:'+port;
    console.log(chalk.black.bgGreen(message));
});