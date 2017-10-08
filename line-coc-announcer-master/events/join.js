
exports.run = (client, group) => {
  var JoinMessage = `HELLO MORTALS I AM HERE TO HELP YOU!
  I, shall help you with your clan wars.
  
  a few of my commands.
  1. claim #clantag , you can claim your clantag to recieve war updates!
  2. help , so you can see my other commands. (help command needs some styling o-o)`

  group.sendMessage(JoinMessage);
}