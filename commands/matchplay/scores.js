const Paginator = require('../../extensions/paginator');
const { MessageEmbed } = require("discord.js");
const { Command } = require('discord.js-commando');
const {loadHTML} = require("../../extensions/helpers");

const gender_alts = { 
    'type-men2':{ tour:'atp', gameplay: 'singles',emoji:'🙋‍♂️'},
    'type-men4':{tour: 'atp', gameplay: 'doubles', emoji: '🙋‍♂️🙋‍♂️' },
    'type-women2':{ tour: 'wta', gameplay: 'singles',emoji: '🙋‍♀️' },
    'type-women4':{ tour: 'wta', gameplay: 'doubles', emoji: '🙋‍♀️🙋‍♀️' }
}
const ten_ex_url ='https://www.tennisexplorer.com/results';
class ScoresPages extends Paginator {
    constructor(title,message,entries) {
        super(title,message,entries);
        this.embeds = entries;
    }
}
module.exports = class ScoresCommand extends Command{
    constructor(client) {
        super(client, {
            name: 'scores',
            group: 'matchplay',
            memberName: 'scores',
            description: 'Scores Section for Tennis Bot',
            examples: ['10s scores', '10s help scores']
        });
    }
    async run(msg, args) {
        console.log('Running Scores Command!');
        msg.channel.startTyping();
        let date = {};
        let type = '';
        if(!args){
            let today = new Date().toLocaleString('en-US').split(',')[0];
            today = today.split('/');
            date = {
                year: today[2], 
                month: today[0],
                day: today[1]
            }
            // const today = new Date();
            // date = {
            //     year:today.getFullYear(), 
            //     month: (today.getMonth()+1 < 10 ? '0'+ String(today.getMonth()+1) : String(today.getMonth()+1)),
            //     day: today.getDate()
            // }
            type = 'all';
        }else{
            args = args.split('/');
            if(args.length !== 3) return msg.reply('Not a valid date!')
            date = {
                year: args[2], 
                month: args[0],
                day: args[1]
            }
        }
        const url = ten_ex_url + `/?type=${type}l&year=${date.year}&month=${date.month}&day=${date.day}`;
        console.log('Scores URL: ', url);
        const $ = await loadHTML(url);
        const tbody_tag = $('tbody')[0]
        let events = [];
        let event_counter = -1;
        let match_count = 0;
        let same_match = false;
        $(tbody_tag).children().map((index, element) => {
            const event_type = $(element).attr('class');
            if(event_type == 'head flags'){
                const event_name = $(element).find('.t-name').text().trim();
                const class_tour = $(element).find('td.t-name>a>span')[1] || $(element).find('td.t-name>span')[1]
                const tour = gender_alts[$(class_tour).attr('class')] 
                events.push({ event_name: event_name.split(' '), event_type: tour, matches:[] });
                event_counter++;
                match_count = 0;
            }
            else{
                const name = $(element).find('.t-name>a').attr('title') || $(element).find('.t-name>a').text().trim();
                const player_games = $(element).find('.score');
                let games_array = []
                $(player_games).map((index,el) => {
                    const tiebreaker = $(el).find('sup').text();
                    const game_score = tiebreaker ?
                    `${$(el).children().remove().end().text().trim()},${tiebreaker.trim()}` : $(el).text().trim()
                    games_array.push(game_score)
                })
                const num_sets_won = $(element).find('.result').text();
                games_array = games_array.filter(Boolean);
                if(same_match){
                    events[event_counter]
                    .matches[match_count]
                    .player2 = {  name: name, games: games_array, sets_won: num_sets_won }
                    match_count++;
                    same_match = false;
                }
                else{
                    events[event_counter]
                    .matches.push({
                        player1: { name: name, games: games_array, sets_won: num_sets_won },
                        player2:{}
                    });
                    same_match = true;
                }
            }
        });
        let events_embeds = [];
        let pages = 2;
        let event_pages = {};
        events.forEach(event => {
            const matches_per_page = 6;
            const first_page = pages;            
            let event_title = event.event_name.map(t => { return t.charAt(0).toUpperCase() + t.slice(1) });
            event_title = '**'+event_title.join(' ') +'**';
            if(!(event_title in event_pages)) event_pages[event_title] = '';
            const event_type_title = `${event.event_type.tour.toUpperCase()} ${event.event_type.gameplay.charAt(0).toUpperCase()+
            event.event_type.gameplay.slice(1)}`;
            for(let match = 0; match < event.matches.length; match += matches_per_page){
                const embed = new MessageEmbed()
                .setDescription(`${event_title} ${event_type_title}`);
                let matches_on_page = [...event.matches]; 
                matches_on_page = event.matches.splice(match,matches_per_page); 
                matches_on_page.forEach(m => {
                    const match_title_winner = `${m.player1.name} VS ${m.player2.name}`;
                    let score = []
                    for(let i = 0; i < m.player1.games.length; i++){
                        let tiebreaker_score = '';
                        let player1_games = m.player1.games[i].split(',');
                        if(player1_games.length > 1){ 
                            tiebreaker_score = `(${player1_games[1]})`;
                            player1_games = `${player1_games[0]}`;
                        }
                        let player2_games = m.player2.games[i].split(',');
                        if(player2_games.length > 1) {
                            tiebreaker_score = `(${player2_games[1]})`;
                            player2_games = `${player2_games[0]}`;
                        }
                        score.push('`'+`${player1_games}-${player2_games+tiebreaker_score}`+'`');
                    }
                    score = score.join(',');
                    if(score.length == 0) score = 'Score Not Found';
                    embed.addField(match_title_winner, score, true);
                })
                pages++;
                events_embeds.push(embed);
            }            
            event_pages[event_title] += `${event_type_title} ${event.event_type.emoji} - `+'`'+`${first_page}`+'`\n';
        });
        const table_of_contents = new MessageEmbed()
        Object.entries(event_pages).map(([title, tour_and_gameplay]) => {
            table_of_contents.addField(title,tour_and_gameplay,true);
        });
        events_embeds.unshift(table_of_contents);
        const title = {name:`ATP & WTA Scores (${date.month}/${date.day}/${date.year})`, link: url}
        const pag = new ScoresPages(title,msg,events_embeds);
        pag.footer = `\n\n*Tips* \n-Format: Tournament - Page#\n-Winners are always on the left\n-Use ↗️ to jump to a page\n-Filter date: mm/dd/yyyy`;
        msg.channel.stopTyping(true);
        return await pag.paginate();
    }
}
