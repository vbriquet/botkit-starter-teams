/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
require('dotenv').config();


if (!process.env.PORT) {
  console.log('Error: Specify studio_token and PORT in environment');
  usage_tip();
  process.exit(1);
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');


// teamsDevBot // remember to get this out of here
var bot_options = {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
    var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_URI});
    bot_options.storage = mongoStorage;
} else {
    bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.teamsbot(bot_options);

//
// Addition for Dialogflow middleware
//
/*
var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    token: process.env.DIALOGFLOW_CLIENT_ACCESS_KEY,
});
controller.middleware.receive.use(dialogflowMiddleware.receive);
*/

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

// Load in some helpers that make running Botkit on Glitch.com better
require(__dirname + '/components/plugin_glitch.js')(controller);

// Start the bot brain in motion!!
controller.startTicking();

var normalizedPath = require("path").join(__dirname, "skills");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./skills/" + file)(controller);
});

console.log('I AM ONLINE! COME TALK TO ME: http://localhost:' + process.env.PORT)

/*
//
// Handling the conversation itself, with hears/say/ask/reply
//

controller.hears('.*', 'direct_message,direct_mention', dialogflowMiddleware.hears, function(bot, message) {
    if (message.intent == 'next-train') {
        var iRail = require("./fulfillment/iRail")(message,bot);
    }
    else {
        bot.reply (message, message.fulfillment.speech);
    }
});

controller.hears(['next-train'], 'direct_message,direct_mention', dialogflowMiddleware.hears, function(bot, message) {
    var iRail = require("./fulfillment/iRail")(message,bot);
});

controller.hears(['following-trains'], 'direct_message,direct_mention', dialogflowMiddleware.hears, function(bot, message) {
    var iRail = require("./fulfillment/iRail")(message,bot);
});

controller.hears('smalltalk(.*)', 'direct_message,direct_mention', dialogflowMiddleware.hears, function(bot, message) {
    console.log ("JSON   message received from SmallTalk: " + JSON.stringify(message));
    console.log ("Speech message received from SmallTalk: " + message.fulfillment.speech);
    bot.reply (message, message.fulfillment.speech);
});
*/

controller.on('direct_message, direct_mention', function(bot, message) {
      bot.reply(message, 'I need an API token from Botkit Studio to do more stuff. Get one here: https://studio.botkit.ai')
    });
console.log('~~~~~~~~~~');
console.log('NOTE: Botkit Studio functionality has not been enabled');
console.log('To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/');


function usage_tip() {
    console.log('~~~~~~~~~~');
    console.log('Botkit Starter Kit');
    console.log('Execute your bot application like this:');
    console.log('PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js');
    console.log('Get a Botkit Studio token here: https://studio.botkit.ai/')
    console.log('~~~~~~~~~~');
}
