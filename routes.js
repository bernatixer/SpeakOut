var flash = require('connect-flash')
    , db = require('./db');
const crypto = require('crypto');

module.exports = function(app) {

    app.get('/', function(req, res) {
        var current_time = new Date();
        crypto.pbkdf2(current_time.getTime().toString(), 'salt', 100000, 4, 'sha512', (err, key) => {
            if (err) throw err;
            res.render('index', { title: key.toString('hex') });
        });
    });

    app.get('/:name', function(req, res) {
        var name = req.params.name;
        db.findChatbyId(name, function (err, user) {
            if (err) {
                console.log("ERROR : ", err);
            } else {
                if (user == null) {
                    res.render('index', { num: 0 });
                } else {
                    res.render('index', { num: 0 });
                }
            }
        });
    });

    app.get('*', function(req, res) {
        if (typeof req.user !== 'undefined') {
            // User is logged in.
            res.render('404', {logged: true, user: req.user});
        } else {
            res.render('404', {logged: false});
        }
    });

};
