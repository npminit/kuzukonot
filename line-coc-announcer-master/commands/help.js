const fs = require('fs');

exports.run = (client, message, args) => {
  // This loop reads the /command/ folder and attaches each event file to the appropriate event.

  let helpMessage = "";

  fs.readdir("./commands", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      let command = require(`./${file}`);
      let commandName = file.split(".")[0];

      helpMessage += `${commandName}. ${command.description}\n\n`;
    });

    message.author.sendMessage(helpMessage);

  });
}

exports.description = "shows the list of commands `help`";
