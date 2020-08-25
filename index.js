const config = require('./config.json');
const Extensions = require("./extensions");
Extensions.addAll();
const { CommandoClient } = require('discord.js-commando');
const path = require('path');

const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: config.owner,
    invite: config.invite,
    disableEveryone: true,
    presence: {
        status: "online",
        activity: {
            name: `${config.prefix} help `
        }
    }
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['atp', 'Association of Tennis Professionals'],
        ['wta', 'Womens Tennis Association'],
        ['admin', 'Admin'],
        ['matchplay', 'Scores, Matches, & Tournaments']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        prefix: false,
        help: false,
        unknownCommand: false
    })
    .registerCommandsIn(path.join(__dirname, 'commands'));
client.once('ready', () => {
    console.log('Ready!');
});
client.login(config.token);