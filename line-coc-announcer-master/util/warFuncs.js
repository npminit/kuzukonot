const crypto = require('crypto');
const config = require('../config')

global.fixISO = str => {
  return str.substr(0,4) + "-" + str.substr(4,2) + "-" + str.substr(6,5) + ":" + str.substr(11,2) + ":" +  str.substr(13)
}

global.discordReportMessage = (WarData, remindermsg) => {
  
  var reminder = `${WarData.stats.clan.name} vs ${WarData.stats.opponent.name}\n
  ${remindermsg.title}\n
  ${remindermsg.body}`

  Storage.setItemSync(clanData[WarData.stats.clan.tag].warId, WarData)

  notify(reminder, WarData.stats.clan.tag);

}

global.discordAttackMessage = (WarData, attackData) => {
  
  var warAtt = Storage.getItemSync(`${clanData[WarData.stats.clan.tag].warId}warAttacks`);
  var warCalls = Storage.getItemSync(`${clanData[WarData.stats.clan.tag].warId}warCalls`);

  let attacker = clanData[WarData.stats.clan.tag].Players[attackData.attackerTag]
  let defender = clanData[WarData.stats.clan.tag].Players[attackData.defenderTag]

  if (attackData.who == "clan") {
    if (attackData.stars === 3) {
      let call = warCalls[attacker.mapPosition].split("//")
      if (call && typeof clanData[WarData.stats.clan.tag].userData[call[1]] != 'undefined') {
        clanData[WarData.stats.clan.tag].userData[call[1]].calls -= 1;
      }
      warCalls[attacker.mapPosition] = "hide";
      Storage.setItemSync(`${clanData[WarData.stats.clan.tag].warId}warCalls`, warCalls);
    } else if (warAtt[attacker.mapPosition] !== "empty") {
      var args = warAtt[attacker.mapPosition].split(" ");
      
      var stars = args[0];
      var percent = args[1];

      if (percent < attackData.destructionPercentage) {
        warAtt[defender.mapPosition] = `${attackData.stars} ${attackData.destructionPercentage}`
        Storage.setItemSync(`${clanData[WarData.stats.clan.tag].warId}warAttacks`, warAtt);
      }
    } else {
      warAtt[defender.mapPosition] = `${attackData.stars} ${attackData.destructionPercentage}`
      Storage.setItemSync(`${clanData[WarData.stats.clan.tag].warId}warAttacks`, warAtt);
    }
  }

  var AttackMessage = `${attackData.who == "clan" ? WarData.stats.clan.name : WarData.stats.opponent.name} attacked ${attackData.who == "clan" ? WarData.stats.opponent.name : WarData.stats.clan.name}
  Attacker: ${attacker.mapPosition}. ${attacker.name}
  Defender: ${defender.mapPosition}. ${defender.name}
  destructionPercentage: ${attackData.destructionPercentage}%
  stars: `;
  for (let i = 0; i < attackData.stars; i++) {
    AttackMessage += "🌟";
  }

  list(WarData.stats.clan.tag, (list) => {
    WarData.lastReportedAttack = attackData.order
    callEvent("attack", attackData, WarData);
    Storage.setItemSync(clanData[WarData.stats.clan.tag].warId, WarData);

    notify(`${AttackMessage}\n${list}`, WarData.stats.clan.tag);
  })
}

global.parseCurrentWar = (war, cT) => {
  // Making sure we actually have war data to mess with lol

  console.log(war);

  if (war && war.reason != 'notFound' && war.reason != 'accessDenied' && war.state != 'notInWar') {
    let sha1 = crypto.createHash('sha1')
    let opponentTag = war.opponent.tag
    sha1.update(war.clan.tag + opponentTag + war.preparationStartTime)
    let warId = sha1.digest('hex');

    clanData[war.clan.tag].warId = warId
    clanData[war.clan.tag].name = war.clan.name;

    var WarData = Storage.getItemSync(warId);
    if (!WarData) {
      WarData = { lastReportedAttack: 0, prepDayReported: false, clanCastleReported: false, battleDayReported: false, lastHourReported: false, finalMinutesReported: false }

      var warCalls = new Array(war.teamSize + 1);
      warCalls.fill("empty");
      warCalls[0] = "dont use me"
      Storage.setItemSync(`${warId}warCalls`, warCalls);

      var warAtt = new Array(war.teamSize + 1);
      warAtt.fill("empty");
      warAtt[0] = "dont use me"
      Storage.setItemSync(`${warId}warAttacks`, warAtt);

      callEvent('newwar', war);
    } else if (clanData[war.clan.tag].onStartup) {
      var warCalls = Storage.getItemSync(`${clanData[war.clan.tag].warId}warCalls`);
      clanData[war.clan.tag].userData = {};
      
      warCalls.forEach((call, index, calls) => {
        if (call !== "hide" && call !== "empty" && call !== "dont use me") {
          var callInfo = call.split("//");

          if (clanData[war.clan.tag].userData[call[1]]) {
            clanData[war.clan.tag].userData[call[1]].calls++
          } else {
            clanData[war.clan.tag].userData[call[1]] = {calls:0}
          }
        }
      });
      Storage.setItemSync(`${clanData[war.clan.tag].warId}warCalls`, warCalls);
    }

    let tmpAttacks = {}
    clanData[war.clan.tag].Players = {}
    war.clan.members.forEach(member => {
      clanData[war.clan.tag].Players[member.tag] = member
      if (member.attacks) {
        member.attacks.forEach(attack => {
          tmpAttacks[attack.order] = Object.assign(attack, {who: 'clan'})
        })
      }
    })
    war.opponent.members.forEach(member => {
      clanData[war.clan.tag].Players[member.tag] = member
      if (member.attacks) {
        member.attacks.forEach(attack => {
          tmpAttacks[attack.order] = Object.assign(attack, {who: 'opponent'})
        })
      }
    })

    let threeStars = {
      clan: 0,
      opponent: 0
    }
    let TH9v9 = {
      clan: {
        attempt: 0,
        success: 0
      },
      opponent: {
        attempt: 0,
        success: 0
      }
    }
    let TH10v10 = {
      clan: {
        attempt: 0,
        success: 0
      },
      opponent: {
        attempt: 0,
        success: 0
      }
    }
    let TH10v11 = {
      clan: {
        attempt: 0,
        success: 0
      },
      opponent: {
        attempt: 0,
        success: 0
      }
    }
    let TH11v11 = {
      clan: {
        attempt: 0,
        success: 0
      },
      opponent: {
        attempt: 0,
        success: 0
      }
    }
    Object.keys(tmpAttacks).forEach(k => {
      let attack = tmpAttacks[k]
      let clanPlayer
      let opponentPlayer
      if (attack.who === 'clan') {
        clanPlayer = clanData[war.clan.tag].Players[attack.attackerTag]
        opponentPlayer = clanData[war.clan.tag].Players[attack.defenderTag]
      } else if (attack.who === 'opponent') {
        opponentPlayer = clanData[war.clan.tag].Players[attack.attackerTag]
        clanPlayer = clanData[war.clan.tag].Players[attack.defenderTag]
      }
      if (attack.stars === 3) {
        if (attack.who === 'clan') {
          threeStars.clan++
        } else if (attack.who === 'opponent') {
          threeStars.opponent++
        }
      }
      if (clanPlayer.townhallLevel === 9 && opponentPlayer.townhallLevel === 9) {
        if (attack.who === 'clan') {
          TH9v9.clan.attempt++
        } else if (attack.who === 'opponent') {
          TH9v9.opponent.attempt++
        }
        if (attack.stars === 3) {
          if (attack.who === 'clan') {
            TH9v9.clan.success++
          } else if (attack.who === 'opponent') {
            TH9v9.opponent.success++
          }
        }
      } else if (clanPlayer.townhallLevel === 10) {
        if (opponentPlayer.townhallLevel === 10) {
          if (attack.who === 'clan') {
            TH10v10.clan.attempt++
          } else if (attack.who === 'opponent') {
            TH10v10.opponent.attempt++
          }
          if (attack.stars === 3) {
            if (attack.who === 'clan') {
              TH10v10.clan.success++
            } else if (attack.who === 'opponent') {
              TH10v10.opponent.success++
            }
          }
        } else if (opponentPlayer.townhallLevel === 11) {
          if (attack.who === 'clan') {
            TH10v11.clan.attempt++
          } else if (attack.who === 'opponent') {
            TH10v11.opponent.attempt++
          }
          if (attack.stars === 3) {
            if (attack.who === 'clan') {
              TH10v11.clan.success++
            } else if (attack.who === 'opponent') {
              TH10v11.opponent.success++
            }
          }
        }
      } else if (clanPlayer.townhallLevel === 11 && opponentPlayer.townhallLevel === 11) {
        if (attack.who === 'clan') {
          TH11v11.clan.attempt++
        } else if (attack.who === 'opponent') {
          TH11v11.opponent.attempt++
        }
        if (attack.stars === 3) {
          if (attack.who === 'clan') {
            TH11v11.clan.success++
          } else if (attack.who === 'opponent') {
            TH11v11.opponent.success++
          }
        }
      }
    })

    WarData.stats = {
      state: war.state,
      endTime: war.endTime,
      startTime: war.startTime,
      hitrate: {
        TH9v9: TH9v9,
        TH10v10: TH10v10,
        TH10v11: TH10v11,
        TH11v11: TH11v11
      },
      clan: {
        tag: war.clan.tag,
        name: war.clan.name,
        stars: war.clan.stars,
        threeStars: threeStars.clan,
        attacks: war.clan.attacks,
        destructionPercentage: war.clan.destructionPercentage,
        memberCount: war.clan.members.length
      },
      opponent: {
        tag: war.opponent.tag,
        name: war.opponent.name,
        stars: war.opponent.stars,
        threeStars: threeStars.opponent,
        attacks: war.opponent.attacks,
        destructionPercentage: war.opponent.destructionPercentage,
        memberCount: war.opponent.members.length
      }
    }

    let attacks = []
    let earnedStars = {}
    let attacked = {}
    Object.keys(tmpAttacks).forEach(k => {
      let attack = tmpAttacks[k]
      let newStars = 0
      let fresh = false
      if (!attacked[attack.defenderTag]) {
        fresh = true
        attacked[attack.defenderTag] = true
      }
      if (earnedStars[attack.defenderTag]) {
        newStars = attack.stars - earnedStars[attack.defenderTag]
        if (newStars < 0) newStars = 0
        if (earnedStars[attack.defenderTag] < attack.stars) earnedStars[attack.defenderTag] = attack.stars
      } else {
        earnedStars[attack.defenderTag] = attack.stars
        newStars = attack.stars
      }
      attacks.push(Object.assign(attack, {newStars: newStars, fresh: fresh}))
    })

    let startTime = new Date(fixISO(war.startTime))
    let endTime = new Date(fixISO(war.endTime))
    let prepTime = startTime - new Date()
    let remainingTime = endTime - new Date()
    if (war.state == 'preparation') {
      if (!WarData.prepDayReported) {

        let prepDay = config.messages.prepDay
        prepDay.body = prepDay.body.replace('%date%', startTime.toDateString()).replace('%time%', startTime.toTimeString())
        WarData.prepDayReported = true
        discordReportMessage(WarData, prepDay)

      } else if (!WarData.clanCastleReported && prepTime < 120 * 60 * 1000) {
        let clanCastleReminder = config.messages.clanCastleReminder;
        WarData.clanCastleReported = true
        discordReportMessage(WarData, clanCastleReminder);
      }
    }
    if (!WarData.battleDayReported && startTime < new Date()) {

      let battleDay = config.messages.battleDay
      WarData.battleDayReported = true
      discordReportMessage(WarData, battleDay)

    }
    if (!WarData.lastHourReported && remainingTime < 60 * 60 * 1000) {

      let lastHour = config.messages.lastHour
      WarData.lastHourReported = true
      discordReportMessage(WarData, lastHour)

    }
    if (!WarData.finalMinutesReported && remainingTime < config.finalMinutes * 60 * 1000) {

      let finalMinutes = config.messages.finalMinutes
      WarData.finalMinutesReported = true
      discordReportMessage(WarData, finalMinutes)

    }
    let reportFrom = WarData.lastReportedAttack

    attacks.slice(reportFrom).forEach(attack => {

      discordAttackMessage(WarData, attack);

    })
    Storage.setItemSync(warId, WarData);
  } else if (war && war.reason == 'notInWar') {
    console.log(chalk.orange.bold(clan.tag.toUpperCase().replace(/O/g, '0') + ' Clan is not currently in war.'))
  } else if (war && war.reason == 'accessDenied') {
    clearInterval(clanData[cT].updateInterval);
    clanData[cT].updateInterval = "accessDenied";
    notify("War Log is private", cT);
  } else if (war.reason == 'notFound') {
    delete clanData[cT];
    notify("this clanTag is not attached to any clan, check if its correct?", cT);
    var groups = Storage.getItemSync("updateGroups");

    groups.forEach((group, index) => {
      group = group.split("//");
      if (group[1] == cT) {
        groups.splice(index, 1);
      } 
    })
    Storage.setItemSync("updateGroups", groups);
  }
}