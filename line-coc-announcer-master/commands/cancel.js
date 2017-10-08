
exports.run = (client, message, args) => {
  var number = args[0];

  var user = args[1];

  var clanTag = checkClan(message.group.id);

  var warData = Storage.getItemSync(clanData[clanTag].warId);
  var warCalls = Storage.getItemSync(`${clanData[clanTag].warId}warCalls`);

  if (!warData) return message.reply("There is no warData have you claimed your clan?")
  if (warData.stats.state == "warEnded") return message.reply("there is no war to be cancelling calls");

  if (number < 1 || number > warData.stats.opponent.memberCount) {
    return message.reply(`bases are only between 1 and ${warData.stats.opponent.memberCount}`);
  }

  var call = warCalls[number].split('//')

  if(call[0] === "empty" ){
    message.reply(`That spot isnt called yet`);
  } else if (call[0] === "hide") {
    message.reply("this spot has been 3 star'ed so its already been canceled")
  } else if (call[1] !== message.author.id) {
    message.reply("you can't cancel someone elses call");
  } else {
    warCalls[number] = "empty";
    clanData[clanTag].userData[message.author.id].calls -= 1;
    Storage.setItemSync(`${clanData[clanTag].warId}warCalls`, warCalls);

    list(message.group.id, (list) => {
      message.reply(`${number} has been canceled\n${list}`);
    })
  }
}

exports.description = "cancel your call `cancel 4`";
