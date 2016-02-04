var express = require('express');
var router = express.Router();
var user = {email: "", password: "", name: ""};
var isLogedIn = false;
var error = [];

router.get('/user/logout', function(req, res, next) {
    user.email = "";
    user.name = "";
    user.password = "";
    isLogedIn = false;
    res.redirect('/');
});

/* GET home page */
router.get('/', function(req, res, next) {
    user.email = "";
    user.name = "";
    user.password = "";
    isLogedIn = false;
    res.render('index');
});

/* POST log-in form */
router.post('/user/login', function(req, res) {
    var validation = validateLogInForm(req.body.email, req.body.password);
    if(validation==true){
        var db = req.db;
        var emailUser = req.body.email;
        var passwordUser = req.body.password;
        var nameUser = req.body.name;
        var collection = db.get('usercollection');
        collection.find({ email: emailUser}, function(e,docs){
            if (docs.length == 1) {
                collection.find({ email: emailUser, password: passwordUser}, function(e,docs){
                    if(docs.length < 1){
                        var alertMsg = [];
                        alertMsg.push("Invalid password");
                        res.render('index', {"errormsg" : alertMsg});
                    }else{
                        user.email = emailUser;
                        user.password = passwordUser;
                        user.name = nameUser;
                        isLogedIn = true;
                        res.redirect("/dashboard");
                    }
                });
            }else{
                var alertMsg = [];
                alertMsg.push("Invalid email address");
                res.render('index', {"errormsg" : alertMsg});
            }
        });
    }else{
        res.render('index', {"errormsg" : validation})
    }
});

/* VALIDATE log-in form */
function validateLogInForm(user, pass){
	var alertMsg = [];
	var isValid = true;
	if(user.length>50 || user.length==0){
		alertMsg.push("User email must be between 0 and 50 characters");
		isValid = false;
	}
	if(pass.length>50 || pass.length==0){
		alertMsg.push("Password must be between 0 and 50 characters");
		isValid = false;
	}
	var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	if(!filter.test(user) && user.length>0){
	    alertMsg.push("Input a valid email");
	    isValid = false;
	}
	if(!isValid){
		return alertMsg;
	}
	return isValid;
}

/* GET dashboard */
router.get('/dashboard', function(req, res) {
    if(isLogedIn){
        var errormsg = error;
        error = [];
        var db = req.db;
        var collection = db.get('usercollection');
        collection.find({ email: user.email , password: user.password},function(e,docs){
            var userData = docs;
            collection.find({$or:[
                {colaborator0 : user.email},
                {colaborator1 : user.email},
                {colaborator2 : user.email}
            ]},function(e,tasks){
                var taskData = tasks;
                res.render('dashboard', {
                    "user" : userData,
                    "task" : taskData,
                    "errormsg": errormsg
                });
            });
        });
    }else{
        res.redirect('/');
    }
});

/* POST sign up form*/
router.post('/user/register', function(req, res) {
    var db = req.db;
    
    var name = req.body.fl_name;
    var userEmail = req.body.email;
    var password = req.body.password;
    var password_confirm = req.body.password_confirmation;

    var validation = validateSignInForm(name, userEmail, password, password_confirm);

	var collection = db.get('usercollection');
    collection.find({ email: userEmail}, function(e,docs){
        if (docs.length != 0) {
            var alertMsg = [];
            alertMsg.push("Account with this email already exists!");
            res.render('index', {"errormsg" : alertMsg});
        }else{
            if(validation == true){
            collection.insert({
                "email" : userEmail,
                "password" : password,
                "name" : name
                }, function (err, doc) {
                    if (err) {
                        res.send("There was a problem adding the information to the database.");
                    }else {
                    res.render("index");
                    }
                });
            }else{
                res.render('index', {"errormsg" : validation})
            }
        }
    });
    
    
});

/* VALIDATION sign up form */
function validateSignInForm(UserName, user, pass, pass_confirm){
	var alertMsg = [];
	var isValid = true;
	if(UserName.length == 0){
	    alertMsg.push("Input a name");
	    isValid = false;
	}
	if(user.length>50 || user.length==0){
		alertMsg.push("User email must be between 0 and 50 characters");
		isValid = false;
	}
	if(pass.length>50 || pass.length==0){
		alertMsg.push("Password must be between 0 and 50 characters");
		isValid = false;
	}
	var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	if(!filter.test(user) && user.length > 0){
	    alertMsg.push("Input a valid email");
	    isValid = false;
	}
	if(pass_confirm.localeCompare(pass) != 0){
	    alertMsg.push("Password and password confirmation do not match");
	    isValid = false;
	}
	if(!isValid){
		return alertMsg;
	}
	return isValid;
};

/* POST create task form */
router.post('/task/create', function(req, res) {
    var db = req.db;
    
    var title = req.body.task_title;
    var description = req.body.task_description;
    var colaborator0 = user.email;
    var colaborator1 = "null";
    var colaborator2 = "null";
    var colaborator3 = "null";
        if(validateEmail(req.body.task_colaborator1)){
            colaborator1 = req.body.task_colaborator1;
        }
        if(validateEmail(req.body.task_colaborator2)){
            colaborator2 = req.body.task_colaborator2;
        }
        if(validateEmail(req.body.task_colaborator3)){
            colaborator3 = req.body.task_colaborator3;
        }

    var validation = validateCreateTask(title, description);
    var collection = db.get('usercollection');
    if(validation == true){
        collection.insert({
            "title" : title,
            "description" : description,
            "colaborator0" : colaborator0,
            "colaborator1" : colaborator1,
            "colaborator2" : colaborator2,
            "colaborator3" : colaborator3,
            "state" : 0
        }, function (err, doc) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            }
            else {
                res.redirect("/dashboard");
            }
        });
    }else{
        error = validation;
        res.redirect("/dashboard")
    }
});

/* VALIDATION create task form */
function validateCreateTask(title, description){
    var isValid = true;
    var alertMsg = [];
    
    if(title.length == 0){
        isValid = false;
        alertMsg.push("Input a title for the task");
    }
    if(description.length == 0){
        isValid = false;
        alertMsg.push("Input a description for the task");
    }
    if(!isValid){
		return alertMsg;
	}
	return isValid;
}

/* VALIDATION email */
function validateEmail(email){
    var isValid = true;
    var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	if(!filter.test(email)){
	    isValid = false;
	} 
	return isValid
}

/* POST delete task form */
router.post('/task/delete', function(req, res) {

    var db = req.db;

    var title = req.body.taskTitle;
    var description = req.body.taskDescription;
    var colaborator0 = user.email;

        var collection = db.get('usercollection');

        collection.remove({
            "title" : title,
            "description" : description,
            "colaborator0" : colaborator0
        }, function (err, doc) {
            if (err) {
                res.send("There was a problem removing the information to the database.");
            }
            else {
                res.redirect("/dashboard");
            }
        });
});

/* POST update task form */
router.post('/updatetask', function(req, res) {
    var db = req.db;
    
    var title = req.body.taskTitle;
    var description = req.body.taskDescription;
    var colaborator0 = req.body.taskColaborator0;
    var oldState = req.body.taskState;

        var collection = db.get('usercollection');

        collection.find({
        "title" : title,
        "description" : description,
        "colaborator0" : colaborator0
        }, function (err, doc) {
            var newState;
            if(oldState === "1"){
                newState = 0;
            }else{
                newState = 1;
            }
            collection.update({
                "title" : title,
                "description" : description,
                "colaborator0" : colaborator0
            }, {$set : {"state" : newState}}, function (err, doc) {
                if (err) {
                    res.send("There was a problem removing the information to the database.");
                }
                else {
                    res.redirect("dashboard");
                }
            });
        });
});

module.exports = router;