//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/ExpressUserLbJquery/master/License.txt

function UserSchema(Schema)
{
    if(this instanceof UserSchema)
    {
        var UserProperties = require('user-properties');
        var EmailRegex = require('regex-email');
        var UsernameRegex = new RegExp("^[a-zA-Z][\\w\\+\\-\\.]{0,19}$");
        var PasswordRegex = new RegExp("^.{8,20}$");
        Schema = Schema || {
            'Username': {
                'Required': true,
                'Unique': true,
                'Mutable': false,
                'Description': function(Value) {return (typeof(Value)!='undefined')&&UsernameRegex.test(Value)}
            },
            'Email': {
                'Required': true,
                'Unique': true,
                'Privacy': UserProperties.Privacy.Private,
                'Description': function(Value) {return (typeof(Value)!='undefined')&&EmailRegex.test(Value)}
            },
            'Password': {
                'Required': true,
                'Privacy': UserProperties.Privacy.Secret,
                'Retrievable': false,
                'Description': function(Value) {return (typeof(Value)!='undefined')&&PasswordRegex.test(Value)},
                'Sources': ['User', 'Auto']
            },
            'EmailToken': {
                'Required': true,
                'Privacy': UserProperties.Privacy.Secret,
                'Retrievable': false,
                'Access': 'Email',
                'Sources': ['Auto']
            }
        };
        
        var Schema = UserProperties(Schema);
        
        this.GetUserSchema = function() {
            return Schema;
        };
    }
    else
    {
        return new UserSchema(Schema);
    }
}

var ExpressUserViews = ['Login', 'Registration', 'EmailVerification', 'EmailTokenRecovery', 'PasswordRecovery', 'ProfileEdit', 'ProfileDeletion', 'ProfileView'];

jQuery(document).on('click', '.ExpressUserLink', function(Event){
    var Target = jQuery(this);
    jQuery('.ExpressUserView').load('/ExpressUser/View/'+Target.attr('href').split('#')[1]);
});

jQuery(document).ready(function(){
    if(window.location.href.split('#').length>1)
    {
        var View = window.location.href.split('#')[1];
        if(ExpressUserViews.some(function(Item) {
            return View === Item;
        }))
        {
            jQuery('.ExpressUserView').load('/ExpressUser/View/'+View);
        }
    }
});
