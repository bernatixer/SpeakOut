var flash = require('connect-flash')
    , db = require('./db');

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('index', { title: "SpeakOut" });
    });

    app.get('/:id', function(req, res) {
        var id = req.params.id;
        db.findChatById(id, function (err, exists, users, messages) {
            if (err) {
                console.log("ERROR : ", err);
            } else {
                if (exists) {
                    res.render('chat', { title: "Chat #"+id, id: id, users: users, messages: messages });
                } else {
                    res.redirect('/');
                }
            }
        });
    });
    
    app.get('*', function(req, res) {
        res.render('404');
    });

};
