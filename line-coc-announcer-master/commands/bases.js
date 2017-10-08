
exports.run = (client, message, args) => {

  list(message.group.id, (list) => {
    message.reply(list);
  })

}

exports.description = "get the list of calls `bases`"
