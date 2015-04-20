//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/ExpressUserLbJquery/master/License.txt

var Http = require('http');
var Path = require('path');

var Express = require('express');
var BodyParser = require('body-parser');
var Csrf = require('csurf');

var MongoDB = require('mongodb');
var Session = require('express-session');
var SessionStore = require('express-session-mongodb');
var UserStore = require('user-store');
var ExpressUserLbJquery = require('../lib/ExpressUserLbJquery');
var ExpressUserLocal = require('express-user-local');
var ExpressUser = require('express-user');
var ExpressUserResponder = require('express-user-local-basic');

var UserProperties = require('user-properties');

var App = Express();

var RandomIdentifier = 'ExpressUserExample'+Math.random().toString(36).slice(-8);

var SessionStoreOptions = {'TimeToLive': 300, 'IndexSessionID': true, 'DeleteFlags': true};

var StaticPath = Path.resolve(__dirname, 'static');

var CsrfRoute = Csrf({ cookie: false });

var UserSchema = UserProperties({
    'Username': {
        'Required': true,
        'Unique': true,
        'Mutable': false,
        'Description': function(Value) {return (typeof(Value)!='undefined')&&Verifications['Username'].test(Value)}
    },
    'Email': {
        'Required': true,
        'Unique': true,
        'Privacy': UserProperties.Privacy.Private,
        'Description': function(Value) {return (typeof(Value)!='undefined')&&Verifications['Email'].test(Value)}
    },
    'Password': {
        'Required': true,
        'Privacy': UserProperties.Privacy.Secret,
        'Retrievable': false,
        'Description': function(Value) {return (typeof(Value)!='undefined')&&Verifications['Password'].test(Value)},
        'Sources': ['User', 'Auto'],
        'Generator': function(Callback) {Callback(null, Uid(15));}
    },
    'EmailToken': {
        'Required': true,
        'Privacy': UserProperties.Privacy.Secret,
        'Retrievable': false,
        'Access': 'Email',
        'Sources': ['Auto'],
        'Generator': function(Callback) {Callback(null, Uid(20));}
    }});

MongoDB.MongoClient.connect("mongodb://localhost:27017/"+RandomIdentifier, {native_parser:true}, function(Err, DB) {
    function MockSendEmail(User, Update, Callback)
    {
        if(Update)
        {
            if(Update.Password)
            {
                console.log('MockEmail at '+User['Email']+". New Password: "+Update.Password);
            }
            else if(Update.EmailToken)
            {
                console.log('MockEmail at '+User['Email']+". New EmailToken: "+Update.EmailToken);
            }
        }
        else
        {
            console.log('MockEmail at '+User['Email']+". New User's EmailToken: "+User['EmailToken']);
        }
        Callback(null);
    }
    var ExpressUserResponderOptions = {'SendEmail': MockSendEmail};
    var ExpressUserLocalOptions = {'CsrfRoute': CsrfRoute};
    
    UserStore(DB, UserSchema, function(Err, UserStore) {
        SessionStore(DB, function(Err, SessionStore) {
            
            App.use(Session({
                'secret': 'qwerty!',
                'resave': true,
                'saveUninitialized': true,
                'store': SessionStore
            }));
            
            App.use('/Static', Express.static(StaticPath));
            App.use(BodyParser.json());
            
            var UserRouter = ExpressUser(UserStore, {'Validator': ExpressUserLocal(ExpressUserLocalOptions), 'Responder': ExpressUserResponder(ExpressUserResponderOptions)});
            App.use(ExpressUser.SessionRoute(UserStore, '_id'));
            App.use(UserRouter);
            
            App.use('/ExpressUser/View', CsrfRoute);
            App.use('/ExpressUser', ExpressUserLbJquery);
            
            App.get('/', function(Req, Res) {
                Res.sendFile(Path.resolve(__dirname, 'views', 'Index.html'));
            });
            
            Http.createServer(App).listen(8080);
        }, SessionStoreOptions);
    });
});
