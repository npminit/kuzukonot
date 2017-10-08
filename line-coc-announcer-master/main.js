const Line = require('line.js');
const fs = require('fs');
const chalk = require('chalk');
const config = require('./config')
const funcs = require('./util/functions.js');
const WarFuncs = require('./util/warFuncs.js');

global.Client = new Line.Client({
  channelAccessToken: config.line.channelAccessToken, 
  channelSecret: config.line.channelSecret, 
  port: config.line.port 
}); 

// This loop reads the /events/ folder and attaches each event file to the appropriate event.
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    Client.on(eventName, (...args) => eventFunction.run(Client, ...args));
  });
});

Client.on("message", (message) => {
  
  if (!message.group) return message.reply("Not a valid group");

  // This is the best way to define args. Trust me.
  const args = message.content.slice(0).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // The list of if/else is replaced with those simple 2 lines:
  try {
    let commandFile = require(`./commands/${command}.js`);
    commandFile.run(Client, message, args);
  } catch (err) {
    // console.log(err);
  }
});

global.clanData = {};

// for parsing Dates and what not
const moment = require('moment');

var LogMessage = `
           --------------
           |Line War Bot|`
console.log(chalk.green(LogMessage));

// Used to check for any updates
const rp = require('request-promise');

// the options for our request
const options = {
  uri: '',
  headers: {
    'User-Agent': 'line-coc-announcer'
  },
  json: true // Automatically parses the JSON string in the response
};

rp(options) // request the commits
.then((data) => {
  checkForUpdate(data[0].sha, data[0].commit.message); // checks for update
})

// check for a update every 10 minutes
setInterval(() => {
  rp(options)
  .then((data) => {
    checkForUpdate(data[0].sha, data[0].commit.message)
  })
}, 1000 * (60 * 10));

var groups = Storage.getItemSync("updateGroups");

// Setup our clanData Object
groups.forEach((group) => {
  group = group.split("//");

  // check if we've already made an object for that clan
  if (!clanData[group[1]]) {
    // if not we make one
    clanData[group[1]] = {channels: [group[0]], onStartup: true}
  } else {
    // if so we just push our update channel to it
    clanData[group[1]].channels.push(group[0])
  }
})
Object.keys(clanData).forEach(key => {

  clanData[key].updateInterval = setInterval(() => {
    funcs.getCurrentWar(key, (data, clanTag) => {
      parseCurrentWar(data, clanTag);
    })
  }, 1000 * config.updateInterval);
  
  funcs.getCurrentWar(key, (data, clanTag) => {
    parseCurrentWar(data, clanTag);
  });
})

