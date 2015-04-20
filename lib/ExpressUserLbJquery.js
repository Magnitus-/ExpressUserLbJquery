//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/ExpressUserLbJquery/master/License.txt

var Express = require('express');
var Path = require('path');
var Ejs = require('ejs');
var FrameGuard = require('frameguard');

var ScriptPath = Path.resolve(__dirname, '..', 'Static', 'Scripts')
var ViewsPath = Path.resolve(__dirname, '..', 'Static', 'Views')
var ViewFileMap = {'Login': 'Login.ejs', 'Registration': 'Registration.ejs'}

var Router = Express.Router();

Router.use('/Script', Express.static(ScriptPath));

Router.use('/View', FrameGuard('sameorigin'));
Router.get('/View/:View', function(Req, Res) {
    if(ViewFileMap[Req.params.View])
    {
        var RenderPath = Path.resolve(ViewsPath, ViewFileMap[Req.params.View])
        if(Req.csrfToken)
        {
            Res.render(RenderPath, {'CsrfToken': Req.csrfToken()});
        }
        else
        {
            Res.render(RenderPath, {'CsrfToken': false});
        }
    }
    else
    {
        Res.status(404).end();
    }
});

module.exports = Router;

