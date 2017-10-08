
exports.run = (client, message, args) => {

  var clanTag = checkClan(message.group.id);

  if (clanTag && args[0]) {
    var userTag = args[0].toUpperCase().replace(/O/g, '0');

    for (var userId in clanData[clanTag].userData) {
      if (clanData[clanTag].userData[userId].verifed) {
        if (clanData[clanTag].userData[userId].tag == userTag) {
          return message.reply("someone has already verified using that user tag");
        }
      }
    }

    if (typeof clanData[clanTag].userData[message.author.id] == 'undefined') {
      clanData[clanTag].userData[message.author.id] = { tag: userTag, verified: true };
    } else {
      clanData[clanTag].userData[message.author.id].tag = userTag;
      clanData[clanTag].userData[message.author.id].verified = true;
    }

    Storage.setItemSync(message.author.id, JSON.stringify(clanData[clanTag].userData[message.author.id]));

    message.reply("you are now verified!")
  } else if (!clanTag) {
    message.reply("there is no clan linked to this channel");
  } else if (!args[0]) {
    message.reply("you have to use a user tag to verify yourself");
  }
}

exports.description = "used to link you to a coc account `claim #userTag`"