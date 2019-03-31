const Discord = require('discord.js');
const DotEnv = require('dotenv')
DotEnv.config()
const client = new Discord.Client();
const config = require('./config.json')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.substr(0, 2) === '!!') {
    // process as a command
    // msg.channel.startTyping()
    let commandRow = msg.content.substr(2, msg.length)
    let commandArgs = commandRow.split(' ')
    switch (commandArgs[0]) {
      case 'ping':
        msg.reply('Pong!')
      case 'deploy':
        let applications = config.applications.filter(app => app.name === commandArgs[1])
        if (applications.length === 0) {
          msg.reply(`I can't find any application with the name "${commandArgs[1]}"`)
        } else {
          msg.reply('Ok, I will deploy that for you...')
          let application = applications[0]
          application.scripts.deploy.unshift('cd ' + application.path)
          let commandToExec = application.scripts.deploy.join(' && ')
          var exec = require('node-exec-promise').exec;

          exec(commandToExec).then(function(out) {
            console.log(out)
            msg.reply("It's deploy!")
          }, function(err) {
            console.error(err);
          });
        }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
