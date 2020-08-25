const { Command } = require('discord.js-commando');
const AtpCommand = require('../atp/atp');
const commands = ['','atp','wta','scores','gear',];
module.exports = class HelpCommand extends Command{
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'admin',
            memberName: 'help',
            description: 'Help Section for Tennis Bot',
            examples: ['10s help', '10s help atp', '10s help wta','10s help scores']
        });
    }
    async run(msg, args) {
        console.log('Help Command called!')
        msg.channel.startTyping();
        args = args.split(" ").map(a => a.toLowerCase());
        const check_command = (command) => commands.includes(command);
        if(!args.some(check_command)) 
            await msg.reply('Command not found or too many commands in use! Use `10s help` for help');
        else if(args.includes('atp')){
            console.log('ATP Help Page!')
            const atp =  new AtpCommand(this.client);
            await atp.run(msg,'help');
        }
        else if(args.includes('scores')){
            console.log('Scores Help Page!')
            msg.info(msg.prompts.scores);
        }
        else if(args.includes('wta')){
            //TODO:
        }
        else{
            console.log('Help Page!')
            msg.info(msg.prompts.help);
        }
        msg.channel.stopTyping(true);
    }
}