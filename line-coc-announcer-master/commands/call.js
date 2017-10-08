
exports.run = (client, message, args) => {

  var clanTag = checkClan(message.group.id);

  var warCalls = Storage.getItemSync(`${clanData[clanTag].warId}warCalls`);

  let number = args[0]

  let userArgs = args.map((arg, index) => {
    if (index != 0) return arg
  });
  
  let user = userArgs.join(" ");

  var warData = Storage.getItemSync(clanData[clanTag].warId);

  if (!warData) return message.reply("There is no warData have you claimed your clan?")
  if (warData.stats.state == "warEnded") return message.reply("there is no war to be calling oponents");

  if (number < 1 || number > warData.stats.opponent.memberCount) {
    return message.reply(`bases are only between 1 and ${warData.stats.opponent.memberCount}`);
  }
  
  var call = warCalls[number].split('//')

  if(call[0] === "empty") {
    if (!clanData[clanTag].userData) clanData[clanTag].userData = {};
    if (!clanData[clanTag].userData[message.author.id]) {
      clanData[clanTag].userData[message.author.id] = {calls:0}
    }
    if (clanData[clanTag].userData[message.author.id].calls >=2) {
      message.reply("you have already called 2 spots cancel one before calling another");
    } else if (user) {
      warCalls[number] = `${user}//${message.author.id}//${new Date().getTime()}`;
      Storage.setItemSync(`${clanData[clanTag].warId}warCalls`, warCalls);
      clanData[clanTag].userData[message.author.id].calls++

      list(clanTag, (list) => {
        message.reply(`you have called ${number} for ${user}\n${list}`);
      })
        
    } else {
      
      warCalls[number] = `${message.author.username}//${message.author.id}//${new Date().getTime()}`;
      Storage.setItemSync(`${clanData[clanTag].warId}warCalls`, warCalls);
      clanData[clanTag].userData[message.author.id].calls++

      list(clanTag, (list) => {
        message.reply(`you have called ${number}\n${list}`);
      })
      
    }

  } else if (call[0] === "hide") {
    message.reply("this spot has been 3 star'ed so theirs no point in calling it")
  } else if (call[1] !== message.author.id) {
    message.reply(`${number} is taken by ${call[0]}`);
  }
}

exports.description = "used to call bases for war `call 6` or for small accounts `call 6 accountname`"
