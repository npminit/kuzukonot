const moment = require('moment');

exports.run = (client, message, args) => {
  if (args[0]) {
    let clanTag = args[0].toUpperCase().replace(/O/g, '0')
    if (clanData[clanTag]) {
      let WarData = Storage.getItemSync(clanData[clanTag].warId);
      if (WarData) {
        discordStatsMessage(WarData, message)
      } else {
        message.reply('War data is missing try again in a little bit. I might still be fetching the data.')
      }
    } else {
      message.reply('I don\'t appear to have any war data for that clan.')
    }
  } else {

    let clanTag = checkClan(message.group.id);

    let WarData = Storage.getItemSync(clanData[clanTag].warId)
    if (WarData) {
      discordStatsMessage(WarData, message)
    } else {
      message.reply('War data is missing try again in a little bit. I might still be fetching the data.')
    }

  }
}

exports.description = "see war stats for the current war";

function discordStatsMessage(WarData, message) {

  var StatsMessage = `${WarData.stats.clan.name} vs ${WarData.stats.opponent.name}\n`

  if (WarData.stats.state === 'preparation') {
    StatsMessage += `War starts ${moment(WarData.stats.startTime).fromNow()}\n`;
  } else if (WarData.stats.state === 'inWar') {
    StatsMessage += `War ends ${moment(WarData.stats.endTime).fromNow()}\n`;
  } else if (WarData.stats.state === 'warEnded') {
    StatsMessage += `War ended ${moment(WarData.stats.endTime).fromNow()}\n`;
  }

  StatsMessage += `3 Stars:\n${WarData.stats.clan.threeStars} vs ${WarData.stats.opponent.threeStars}\n`
  StatsMessage += `memberCount:\n${WarData.stats.clan.memberCount} vs ${WarData.stats.opponent.memberCount}\n`
  StatsMessage += `Attacks:\n${WarData.stats.clan.attacks} vs ${WarData.stats.opponent.attacks}\n`
  StatsMessage += `DestructionPercentage\n${WarData.stats.clan.destructionPercentage}% vs ${WarData.stats.opponent.destructionPercentage}%\n`
  StatsMessage += `Stars:\n${WarData.stats.clan.stars} vs ${WarData.stats.opponent.stars}`

  message.reply(StatsMessage);
}
