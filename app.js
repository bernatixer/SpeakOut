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
// s'executa quan un usuari es connecta a la pagina principal
io.on('connection', function(socket){
    // var que emmagatzema l'info de l'usuari
    var u_info = [];
    // s'executa quan creem un chat nou
    socket.on('create_chat', function(private, password){
        var current_time = new Date();
        // funció per crear el hash (url) de la pagina del chat
        crypto.pbkdf2(current_time.getTime().toString(), 'salt', 100000, 4, 'sha256', (err, key) => {
            if (err) throw err;
            var hash = key.toString('hex');
            // es crear la room del chat a la base de dades (private -> bool) (password -> string | null)
            db.createChat(hash, private, password);
            // s'executa l'event chat_created
            socket.emit('chat_created', hash);
        });
    });
    // s'executa quan l'usuaria s'afageix a la nova sala creada
    socket.on('im_here', function(hash){
        // afageix el nou usuari referenciat pel socket a la room referenciada pel hash (url)
        socket.join(hash);
    });
    // s'executa quan s'envia un missatge
    socket.on('send_message', function(msg, hash){
        // variable nick que conté el nom de l'usuari en la room referenciada pel hash (url)
        var nick = u_info[hash];
        // broadcast del missatge envait per "nick" a tots els usuaris connectats a la room (hash - url)
        socket.broadcast.to(hash).emit('receive_msg', msg, nick);
        // AFEGIR MISSATGE A LA DB (Amb timestamp)
    });
    // s'executa quan l'usuari obté un nickname nou
    socket.on('nickname', function(nick, hash){
        // ACTUALITZAR LA LLISTA D'USUARIS
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