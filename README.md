# cpsc113-SocialToDo
Heroku link = http://socialtodo.herokuapp.com/

(all tests are passing but the one that checks if there is a "invalid email address" error message after you try to log in with a unregistered email has some issues that I just can't figure out. Some times it pass and the majority of time it fails. If you test the site and use as an input and ivalid email you will be able to see that the a message containing the string "invalid email address" shows up on the login screen with the error message. But for a strange reason it is invisible for casperjs)

Sorry for the late submit of the project but I tried to do it the hard way (googling for everything trying to do it by myself) and I just tested in the end (after I learned how to deploy it on heroku). So when the tests were running I had almost no time to make the corrections.

Because I stated my project on a different way I faced some issues to deploy on heroku and connect to MongoLabs, so to force it I hardcoded the connection string. (I know its wrong, but every other thing that I tried failed).
