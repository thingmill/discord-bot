const Discord = require('discord.js');
const DotEnv = require('dotenv')
DotEnv.config()
const client = new Discord.Client();
const config = require('./config.json')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("!!deploy", {"type": "PLAYING"});
});

client.on('message', msg => {
  if (msg.author.id === client.user.id) { return }
  if (msg.content.substr(0, 2) === '!!') {
    // process as a command
    // msg.channel.startTyping()
    let commandRow = msg.content.substr(2, msg.length)
    let commandArgs = commandRow.split(' ')
    let canDeploy = false
    if (!msg.author.bot) {
        canDeploy = msg.member.roles.cache.array().filter(role => role.name === 'can-deploy').length !== 0
    } else {
        canDeploy = true
    }
    switch (commandArgs[0]) {
      case 'ping':
        msg.reply('Pong!')
        break;
      case 'list':
        if (!canDeploy) {
          msg.reply("Nop, you can't see that")
        } else {
          let lines = config.applications.map(item => {
            return item.name
          })
          lines = lines.join('\n')
          msg.channel.send('```' + lines + '```')
        }
        break;
      case 'view':
        if (!canDeploy) {
          msg.reply("Nop, you can't see that")
        } else {
          let applications = config.applications.filter(app => app.name === commandArgs[1])
          if (applications.length === 0) {
            msg.reply(`I can't find any application with the name "${commandArgs[1]}"`)
          } else {
            let application = applications[0]
            let embed = new Discord.RichEmbed({
              title: application.name,
              fields: [
                {
                  name: "Path",
                  value: application.path
                },
                { 
                  name: "Commandes",
                  value: application.scripts.deploy.join(' && ')                  
                }
              ]
            });
            msg.channel.send(embed)
          }
        }
        break;
      case 'deploy':
        // user need to be admin
        if (!canDeploy) {
          msg.reply("Oh sorry you can't deploy because you are not very wealthy unlike the others...")
        } else {
          let applications = config.applications.filter(app => app.name === commandArgs[1])
          if (applications.length === 0) {
            msg.reply(`I can't find any application with the name "${commandArgs[1]}"`)
          } else {
            msg.reply('Ok, I will deploy that for you...')
            let application = applications[0]
            application.scripts.deploy.unshift('cd ' + application.path)
            let commandToExec = application.scripts.deploy.join(' && ')
            let exec = require('node-exec-promise').exec;
            exec(commandToExec).then(function(out) {
              msg.reply(`\`\`\` ${out.stdout} \`\`\``)
              if (out.stderr != "" && out.stderr != " ") {
                msg.reply(`\`\`\` ${out.stderr} \`\`\``)
              }
              msg.reply("It's deploy!")
            }, function(err) {
              console.error(err);
              msg.reply(`\`\`\` ${err} \`\`\``)
            });
          }
        }
        break;
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
