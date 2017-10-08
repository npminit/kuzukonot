var config = require('../config')
var funcs = require('../util/functions.js');

exports.run = (client, message, args) => {
  let clanTag = checkClan(message.group.id);

  if (clanTag) {
    if (clanData[clanTag].updateInterval !== "accessDenied") {
      message.reply("this clan is recieving updates already");
    } else {
      message.reply("this clan is recieving updates again");

      clanData[clanTag].updateInterval = setInterval(function() {
        funcs.getCurrentWar(clanTag)
      }, 1000 * config.updateInterval);
      
      funcs.getCurrentWar(clanTag);
    }
  } else {
    message.reply("theres no clan linked to this chat");
  }
}

exports.description = "used to make the bot recieve updates again incase you had your warLog private `refresh`";