var config = require('../config');
const chalk = require('chalk');
const { exec } = require('child_process');

const COC_API_BASE = 'https://api.clashofclans.com/v1'
const async = require('async')
const get = require('simple-get')

const apiRequest = (task, cb) => {
  get.concat({
    url: task.url,
    method: 'GET',
    headers: {
      'authorization': 'Bearer ' + config.cocApiKey,
      'Cache-Control':'no-cache'
    }
  }, function (err, res, jsonBuffer) {
    cb()
    if (jsonBuffer !== undefined) {
      if (jsonBuffer.length > 0) {
        let data = JSON.parse(jsonBuffer)
        task.done(data)
      } else {
        task.done(false)
      }
    } else {
      task.done(false)
    }
  })
}

global.apiQueue = async.queue(apiRequest, 10)

const nodePersist = require('node-persist');
const crypto = require('crypto');

global.Storage = nodePersist.create({
  dir: 'storage',
  expiredInterval: 1000 * 60 * 60 * 24 * 9 // Cleanup Files older than a week + 2 days for prep / war day.
})

Storage.initSync()

var groups = Storage.getItemSync("updateGroups");
if (!groups) {
  groups = [];
  Storage.setItemSync("updateGroups", groups);
}

exports.getCurrentWar = (clanTag, done = () => {}) => {
  apiQueue.push({
    url: `${COC_API_BASE}/clans/${encodeURIComponent(clanTag)}/currentwar`,
    done: (data) => {
      if (data.error) return done(null, clanTag); // parseCurrentWar(data, clanTag);
      done(data, clanTag)
    }
  });
}

exports.getWarLog = (clanTag, done = () => {}) => {
  apiQueue.push({
    url: `${COC_API_BASE}/clans/${encodeURIComponent(clanTag)}/warlog`,
    done: done
  })
}

exports.getPlayer = (playerTag, done = () => {}) => {
  playerTag = playerTag.toUpperCase().replace(/O/g, '0');
  if (playerTag.match(/^#[0289PYLQGRJCUV]+$/)) {
    apiQueue.push({
      url: `${COC_API_BASE}/players/${encodeURIComponent(playerTag)}`,
      done: done
    })
  }
}

global.list = (id, done) => {

  let cT;

  if (typeof id == "string") {
    if (id.startsWith("#")) {
      cT = id
    } else {
      cT = checkClan(id);
    }
  } else {
    cT = checkClan(id);
  }

  var warData = Storage.getItemSync(`${clanData[cT].warId}`);
  var warCalls = Storage.getItemSync(`${clanData[cT].warId}warCalls`);
  var warAtt = Storage.getItemSync(`${clanData[cT].warId}warAttacks`);

  let listInfo = ""

  warCalls.forEach((call, index) => {
    call = call.split('//')
    if (index == 0) {

    } else if (call[0] === "hide") {

    } else if (call[0] === "empty") {
      if (warAtt[index] !== "empty") {

        var args = warAtt[index].split(" ");
        var stars = args[0];
        var percent = args[1];

        var starMsg = '';

        if (stars == 1) {
          starMsg += '🌟';
        } else if (stars == 2) {
          starMsg += '🌟🌟'
        } else {
          starMsg += ''
        }

        listInfo += `${index}. ${starMsg} ${percent}%\n`
      } else {
        listInfo += `${index}.\n`
      }
    } else {
      if (warAtt[index] !== "empty") {

        var args = warAtt[index].split(" ");
        var stars = args[0];
        var percent = args[1];

        var starMsg = '';

        if (stars == 1) {
          starMsg += '🌟';
        } else if (stars == 2) {
          starMsg += '🌟🌟'
        } else {
          starMsg += ''
        }

        listInfo += `${index}. ${call[0]}, ${starMsg} ${percent}%\n`
      } else {
        listInfo += `${index}. ${call[0]}\n`
      }
    }
  })

  if (done) done(listInfo);
}

global.checkClan = (id) => {

  let clanTag;

  Object.keys(clanData).forEach((key) => {
    clanData[key].channels.forEach((group) => {
      if (group == id) {
        clanTag = key;
      }
    })
  })

  return clanTag
  
}


global.checkForUpdate = (currentCommit, commitComment) => {
  var lastUpdate = Storage.getItemSync("lastUpdate");
  if (!lastUpdate) {
    Storage.setItemSync("lastUpdate", currentCommit);
  } else if (currentCommit !== lastUpdate) {

    var updateMsg = `New Update Available\n
    ${commitComment}`

    notify(updateMsg, "all");

    exec('git pull', (err, stdout, stderr) => {
      if (err) {
        notify("error trying to auto update, check if you have git installed on your machine https://git-scm.com/downloads", "all");
      } else if (stdout == "Already up-to-date.") {
        // not sure why this doesnt work
        notify("You was already up to date o-o", "all");
      } else {
        notify("Update Succesful, restarting...", "all");
      }
    });

    Storage.setItemSync("lastUpdate", currentCommit);

  }
}

global.notify = (msg, clanTag) => {
  var groups = Storage.getItemSync("updateGroups");
  if (groups.length != 0) {
    groups.forEach((group) => {
      group = group.split('//');
      // group[0] channel id
      // group[1] clantag
      if (clanTag == "all") {
        Client.sendMessage(group[0], msg);
      } else if (group[1] == clanTag) {
        Client.sendMessage(group[0], msg);
      }

    })
  }
}

global.callEvent = (event) => {
  var args = Array.from(arguments);
  
  // remove the event name from the arguments passed
  args.splice(0, 1);

  try {
    let eventFile = require(`../warevents/${event}.js`);
    eventFile.apply(null, args);
  } catch (err) {
    console.log(err);
  }

}
