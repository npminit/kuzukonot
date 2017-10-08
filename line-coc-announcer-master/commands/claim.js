var funcs = require('../util/functions.js');
var config = require('../config');

exports.run = (client, message, args) => {

  var groups = Storage.getItemSync("updateGroups");

<<<<<<< HEAD
  var clanTag = args[0].toUpperCase().replace(/O/g, '0');
=======
  var clanTag = args[0].toUpperCase().replace(/O/g, '0')
>>>>>>> 198fc561a207bab69f8e4f12a855d06c84c941a5
  let changed = false;
  let oldClan;

<<<<<<< HEAD
  console.log("command ran")

=======
>>>>>>> 198fc561a207bab69f8e4f12a855d06c84c941a5
  if (!clanTag) {
    message.reply("specify a clantag");
  } else  {
    groups.forEach((group, index) => {
      group = group.split('//');
      // group[0] group id
      // group[1] clantag

      if (group[0] == message.group.id) {
        oldClan == group[1];
        groups[index] = `${message.group.id}//${clanTag}`
        Storage.setItemSync("updateGroups", groups);
        changed = true;
      }
    })

    if (changed == false) {
      groups.push(`${message.group.id}//${clanTag}`);
      Storage.setItemSync("updateGroups", groups);
    }

    if (!clanData[clanTag]) {
      clanData[clanTag] = {channels: [message.group.id]}
    
      funcs.getCurrentWar(clanTag, (data, clanTag) => {
        if (data && data.reason != 'notFound' && data.reason != 'accessDenied') {
          if (changed == false) {
            message.reply(`this group will recieve updates for ${data.clan.name}`);
          } else {
            message.reply(`this group will recieve updates for ${data.clan.name} instead of ${clanData[oldClan].name}`);
          }
        } else if (data.reason == 'accessDenied') {
          message.reply(`the clan you claimed currently has a private warlog use the refresh command when its public`);
        } else if (data.reason == 'notFound') {
          delete clanData[clanTag];
          message.reply("this clanTag is not attached to any clan, check if its correct?");
          var groups = Storage.getItemSync("updateGroups");
      
          groups.forEach((group, index) => {
            group = group.split("//");
            if (group[1] == clanTag) {
              groups.splice(index, 1);
            } 
          })
          Storage.setItemSync("updateGroups", groups);
        }
      });

    } else {
      clanData[clanTag].channels.push(message.group.id);
      funcs.getCurrentWar(clanTag, (data, clanTag) => {
        if (data && data.reason != 'notFound' && data.reason != 'accessDenied') {
          if (changed == false) {
            message.reply(`this group will recieve updates for ${data.clan.name}`);
          } else {
            message.reply(`this group will recieve updates for ${data.clan.name} instead of ${clanData[oldClan].name}`);
          }
        } else if (data.reason == 'accessDenied') {
          message.reply(`the clan you claimed currently has a private warlog use the refresh command when its public`);
        } else if (data.reason == 'notFound') {
          delete clanData[clanTag];
          message.reply("this clanTag is not attached to any clan, check if its correct?");
          var groups = Storage.getItemSync("updateGroups");
      
          groups.forEach((group, index) => {
            group = group.split("//");
            if (group[1] == clanTag) {
              groups.splice(index, 1);
            } 
          })
          Storage.setItemSync("updateGroups", groups);
        }
      });
    }
  }
}

exports.description = "add this channel to recieve updates for a clan `claim #clantag`"
