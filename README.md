# YelpCamp
WebD Proj
#YelpCamp

##Initial Setup
* Add Landing Page
* Add Campgrounds Page that lists all campgrounds

Each Campground has:
   * Name
   * Image

##Layout and Basic Styling
* Create our header and footer partials
* Add in Bootstrap

##Creating New Campgrounds
* Setup new campground POST route
* Add in body-parser
* Setup route to show form
* Add basic unstyled form

##Style the campgrounds page
* Add a better header/title
* Make campgrounds display in a grid

##Style the Navbar and Form
* Add a navbar to all templates
* Style the new campground form

##Add Mongoose
* Install and configure Mongoose
* Setup campground model
* Use campground model inside of our routes

##Show Page
* Review the RESTful routes we've seen so far
* Add description to our campground model
* Show db.collection.drop()
* Add a show route/template

##Refactor Mongoose Code
* Create a models directory
* Use module.exports
* Require everything correctly!

##Add Seeds File
* Add a seeds.js file
* Run the seeds file every time the server starts

##Add the Comment model!
* Make our errors go away!
* Display comments on campground show page

##Comment New/Create
* Discuss nested routes
* Add the comment new and create routes
* Add the new comment form

##Style Show Page
* Add sidebar to show page
* Display comments nicely

##Finish Styling Show Page
* Add public directory
* Add custom stylesheet

##Auth Pt. 1 - Add User Model
* Install all packages needed for auth
* Define User model 

##Auth Pt. 2 - Register
* Configure Passport
* Add register routes
* Add register template

##Auth Pt. 3 - Login
* Add login routes
* Add login template

##Auth Pt. 4 - Logout/Navbar
* Add logout route
* Prevent user from adding a comment if not signed in
* Add links to navbar

##Auth Pt. 5 - Show/Hide Links
* Show/hide auth links in navbar 

##Refactor The Routes
* Use Express router to reoragnize all routes

##Users + Comments
* Associate users and comments
* Save author's name to a comment automatically

##Users + Campgrounds
* Prevent an unauthenticated user from creating a campground
* Save username+id to newly created campground


TODOS
* Add "back" redirect to login
* Add method-override
* BOOTSTRAP NAV COLLPASE JS
* Flash Messages
* Refactor container div to header
* Show/hide delete and update buttons
* style login/register forms
* Random Background Landing Page
* Refactor middleware
* change styling in show template - comment delete/update
* UPATE/DELETE CAMPGROUND

* BOOTSTRAP NAV COLLPASE JS
* Flash Messages
* Refactor container div to header
* Show/hide delete and update buttons
* style login/register forms
* Random Background Landing Page
* Refactor middleware
* change styling in show template - comment delete/update
* UPDATE/DELETE CAMPGROUND
* #UI Improvement
* Landing page image slider
* Dynamic campground pricing
* Deploy & connect to hosted DB
* edit package.json to include start script
* git add files to deploy
* git commit
* heroku create to make app & connect it to heroku url
* hosted mongodb connection: sign up for mlab - mongodb online create new db create db users add url to mongoose.connect in app.js
* git push heroku master to deploy
* heroku debug: heroku logs heroku run '+ command' '+ folder' e.g: -heroku run ls publicFolder -heroku run npm install ejs --save
* Environment Variables(dotenv package)
    Create env var, equated to db url: i) dotenv package + .env file with value:key pairs ii) export DATABASEURL=localhosturl in cmd
    Update DATABASEURL on heroku
* Add ADMIN Capability
* Moment js for time of creation etc
* ADD USER PROFILE(CLICKING USER NAME RENDERS A USER PROFILE PAGE THROUGH GET ROUTE)
* ADD LOCATION TO CAMPGROUND MODEL + ADD AUTOCOMPLETE FEATURE TO LOCATION USING ALGOLIA API



