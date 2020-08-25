const { Command } = require('discord.js-commando');
const Rankings = require('./subcommands/rankings.js');
const PlayerProfile = require('./subcommands/player-profile');
const PlayerStats = require('./subcommands/player-stats');

const Cheerio = require('cheerio');
const https = require('https');
const atp_url = 'https://www.atptour.com';

const subcommands = ['rankings','player-profile','player-stats'];
module.exports = class AtpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'atp',
            group: 'atp',
            memberName: 'atp',
            description: 'Get ATP Information',
            examples: ['10s atp rankings', '10s atp player-stats', '10s atp player-profile']
        });
        this.selected_player = {};
        this.num_players_found = [];
        this.filters = [];
    }
    async run(msg, args) {
        msg.channel.startTyping();
        args = args.split(" ").map(a => a.toLowerCase());
        if(args[0] == '' || args[0] == 'help'){
            msg.info(msg.prompts.atp_help);
        }
        else{
            if(args.filter(arg=>subcommands.includes(arg)).length > 1 || args.filter(arg=>subcommands.includes(arg)).length < 0){
                msg.reply('Command not found or too many commands in use! Use `10s help atp` if you need help');
            }
            else if(args[0] == 'rankings'){
                const rankings = new Rankings(msg,args);
                await rankings.findRanks();
            }   
            else if(args[0] == 'player-profile'){
                await this.searchPlayer(msg,args);
                if(this.num_players_found == 1){
                    const profile = new PlayerProfile(msg,this.selected_player);
                    profile.findProfile();
                }
            }
            else if(args[0] == 'player-stats'){
                await this.searchPlayer(msg,args);
                if(this.num_players_found == 1){
                    const stats = new PlayerStats(msg,this.selected_player,this.filters);
                    stats.findStats();
                }
            }
            else if(args.some(arg=> subcommands.indexOf(arg) >= 0)){
                const subcommand = args.find(arg => subcommands.includes(arg));
                msg.reply('`'+subcommand + '` might in in the wrong place. Use `10s help atp` for help');
            }
        }
        msg.channel.stopTyping(true);

    }
    async searchPlayer(msg,args){
        console.log('Arguements ', args)
        args = args.slice(1,args.length)
        let player_names = [];
        let index;
        for(index = 0; index < args.length; index++){
            if(args[index] == '-f'){
                this.filters = args.splice(index+1,args.length);
                break;
            }
            player_names.push(args[index]);
        }
        this.filters.filter(Boolean);
        if(index == args.length) this.filters = [];
        console.log('Filters: ',this.filters)

        const search_name = player_names.join('%20');
        const url = atp_url + `/en/search-results/players?searchTerm=${search_name}`;
        console.log('Search url: ', url)
        const html = await new Promise(resolve => {
            https.get(url).on("response", function (response) {
                let body = "";
                response.on("data", (chunk) => body += chunk);
                response.on("end", () => resolve(body));
            });
        }); 
        const $ = Cheerio.load(html); 
        const player_list = $('table.player-results-table').first().children();
        let players = [];
        player_list.children().map((p,element)=>{
            const player_rank = $(element).find('.result-rank >.result-value').text().replace(/\s\s+/g, '') || 'No Rank';
            const player_name = $(element).find('.result-name >a').text().replace(/\s\s+/g, '');
            const player_points = $(element).find('.result-points >.result-value').text().replace(/\s\s+/g, '') || 'No Points';
            const player_link = $(element).find('.result-name >a').attr('href');
            const player_avatar = $(element).find('.result-avatar >a>img').attr('src');
            players.push(
                {name: player_name, rank: player_rank, points: player_points,link: player_link, picture:player_avatar},
            );
        })
        this.num_players_found = players.length;
        if(!players.length) return msg.reply('No players found :(');
        else if(players.length > 1){
            console.log('Multiple search results!')
            // Will prompt at max 9 players found in search
            const player_select = players.length < 10 ? players : players.slice(0,9);
            const players_info = {
                name: `**Found ${players.length} ATP Players**`,
                fields: player_select.map((player,index) => {
                    return {
                        name: `**${player.name}**` ,//`**${player.name} `+ '`'+(index +1)+'` '+ '**',
                        value: `*Rank* ${player.rank}\n*Points* ${player.points} `,
                        inline: true
                    }
                }),
            }
            msg.info(players_info);
            return msg.reply(`Be more specific. First ${player_select.length} players shown above.`);
            // TODO:
            // Incorporate decisions after search!
            // +'Enter number from'+ '`' + 1 +'`-' +'`' + player_select.length+ '`'
            // + ' or '+"`"+`0`+"`/`"+'cancel'+"` to cancel. Page will expire in 30 seconds if no response.");
            // const filter = m => m.author.id ===  this.msg.author.id;
            // this.msg.channel.awaitMessages(filter, { 
            //     max: 1, // leave this the same
            //     time: 30000 // time in MS. there are 1000 MS in a second
            // })
            // .then(async(collected) => {
            //     if(collected.first().content == 'cancel' || collected.first().content == '0') return this.msg.reply('Command cancelled.')
            //     player_select_index = Number(collected.first().content) -1;
            //     if(player_select_index < 0 || player_select_index > players.length) return this.msg.reply('Invalid Input!');
            //     else await this.findProfile(players[player_select_index]);
            // })
            // .catch((error) => { return this.msg.reply('You took too long! Page has expired!') });
        }
        else this.selected_player = players[0];
        return;
    }
}
