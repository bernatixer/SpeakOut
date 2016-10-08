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
    var u_info = [];
    socket.on('create_chat', function(private, password){
        var current_time = new Date();
        crypto.pbkdf2(current_time.getTime().toString(), 'salt', 100000, 4, 'sha256', (err, key) => {
            if (err) throw err;
            var hash = key.toString('hex');
            db.createChat(hash, private, password);
            socket.emit('chat_created', hash);
        });
    });
    socket.on('im_here', function(hash){
        socket.join(hash);
    });
    socket.on('send_message', function(msg, hash){
        var nick = u_info[hash];
        socket.broadcast.to(hash).emit('receive_msg', msg, nick);
        // AFEGIR MISSATGE A LA DB (Amb timestamp)
    });
    socket.on('nickname', function(nick, hash){
        u_info[hash] = nick;
        // AFEGIR USUARI A LA DB
        // Descarregar missatges de la DB (Per ordre de 'timestamp')
    });
});

// launch ======================================================================
server.listen(port, function(){
    var message = '[SERVER] Started server on localhost:'+port;
    console.log(chalk.black.bgGreen(message));
});