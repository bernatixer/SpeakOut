// A fork of the [node.js chat app](https://github.com/eiriksm/chat-test-2k)
// by [@orkj](https://twitter.com/orkj) using socket.io, rethinkdb, passport and bcrypt on an express app.
//
// See the [GitHub README](https://github.com/rethinkdb/rethinkdb-example-nodejs-chat/blob/master/README.md)
// for details of the complete stack, installation, and running the app.

var r = require('rethinkdb')
    , util = require('util')
    , assert = require('assert')
    , logdebug = require('debug')('rdb:debug')
    , logerror = require('debug')('rdb:error');


// #### Connection details
var dbConfig = {
    host: process.env.RDB_HOST || 'localhost',
    port: parseInt(process.env.RDB_PORT) || 28015,
    db  : process.env.RDB_DB || 'speakout',
    tables: {
        'chats': 'id',
        'users': 'id'
    }
};
/*
Setup
 */
module.exports.setup = function() {
    r.connect({host: dbConfig.host, port: dbConfig.port }, function (err, connection) {
        assert.ok(err === null, err);
        r.dbCreate(dbConfig.db).run(connection, function(err, result) {
            if(err) {
                logdebug("[DEBUG] RethinkDB database '%s' already exists (%s:%s)\n%s", dbConfig.db, err.name, err.msg, err.message);
            }
            else {
                logdebug("[INFO ] RethinkDB database '%s' created", dbConfig.db);
            }

            for(var tbl in dbConfig.tables) {
                (function (tableName) {
                    r.db(dbConfig.db).tableCreate(tableName, {primaryKey: dbConfig.tables[tbl]}).run(connection, function(err, result) {
                        if(err) {
                            logdebug("[DEBUG] RethinkDB table '%s' already exists (%s:%s)\n%s", tableName, err.name, err.msg, err.message);
                        }
                        else {
                            logdebug("[INFO ] RethinkDB table '%s' created", tableName);
                        }
                    });
                })(tbl);
            }
        });
    });
};

module.exports.findChatById = function (id, callback) {
    onConnect(function (err, connection) {
        r.db(dbConfig['db']).table('chats').filter({ id: id}).limit(1).run(connection, function(err, cursor) {
            if(err) {
                logerror("[ERROR][%s][findChatById] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
                callback(true, false, null);
            } else {

                cursor.next(function (err, row) {
                    if(err) {
                        logerror("[ERROR][%s][findChatById] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
                        callback(false, false, null); // no user, cursor is empty
                    } else {
                        callback(false, true, row);
                    }
                    connection.close();
                });
                /*
                if (!cursor) {
                    callback(false, false, null);
                } else {
                    callback(false, true, cursor);
                }*/
            }
            //connection.close();
        });
    });
};

module.exports.createChat = function (hash) {
    onConnect(function (err, connection) {
        r.db(dbConfig['db']).table('chats').insert({
            "id": hash,
            "users": [],
            "messages": []
        }).run(connection, function() {
            connection.close();
        });
    });
};

function onConnect(callback) {
    r.connect({host: dbConfig.host, port: dbConfig.port }, function(err, connection) {
        assert.ok(err === null, err);
        connection['_id'] = Math.floor(Math.random()*10001);
        callback(err, connection);
    });
}

// #### Connection management
//
// This application uses a new connection for each query needed to serve
// a user request. In case generating the response would require multiple
// queries, the same connection should be used for all queries.
//
// Example:
//
//     onConnect(function (err, connection)) {
//         if(err) { return callback(err); }
//
//         query1.run(connection, callback);
//         query2.run(connection, callback);
//     }
//