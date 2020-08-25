const atp_url = 'https://www.atptour.com';
const Paginator = require("../../../extensions/paginator");
const {loadHTML} = require("../../../extensions/helpers");
const { MessageEmbed } = require("discord.js");
const {Constants} = require("discord.js");
const surfaces = ['clay','grass','hard','carpet','all'];
const surface_colors = { 
    'clay': Constants.Colors.CLAY, 
    'grass': Constants.Colors.GRASS,
    'carpet': Constants.Colors.CARPET, 
    'hard': Constants.Colors.HARD,
    'all': Constants.Colors.MAIN
}
const titles_and_finals_emoji = {'titles': '🏆','finalist': '🥈'}
class StatsPages extends Paginator {
    constructor(title,message,entries) {
        super(title,message,entries);
        this.embeds = entries;
        this.color = '';
    }
}
module.exports = class PlayerStats{
    constructor(msg,player,filters){
        this.msg = msg;
        this.player = player;
        this.filters = filters;
    }
    async findStats(){
        if(this.filters.length > 2) return this.msg.reply('`player-stats` subcommand can only take 0-2 arguements after. E.g. `10s atp player-stats 2017 Roger Federer`')
        const [year,surface] = Number.isInteger(parseInt(this.filters[0] || 0)) 
        ? [this.filters[0] || '0', this.filters[1] || 'all'] 
        : [this.filters[1] || '0',this.filters[0] || 'all'];
        if(!surfaces.includes(surface.toLowerCase())) return this.msg.reply('Surface not found. Choose from `hard`, `clay`, `grass`, or `carpet`. To display all surfaces leave blank or run `all`');
        let player_stats_url = atp_url+ this.player.link.replace('overview','') +`player-stats?year=${year}&surfaceType=${surface}`;
        let titles_and_finals_url = atp_url+ this.player.link.replace('overview','') +`titles-and-finals`;

        console.log('Player Individual Stats URL: ',player_stats_url)
        console.log('Titles & Finals Stats URL: ',titles_and_finals_url)

        const player_stats = await this.playerStats(await loadHTML(player_stats_url))
        const titles_and_finals_stats = await this.titlesAndFinals(await loadHTML(titles_and_finals_url),year,surface);
        if(!player_stats && !titles_and_finals_stats) return this.msg.reply('Stats not found.'); 

        const [title_year, title_surface] = Number.isInteger(parseInt(this.filters[0] || 0)) 
        ? ['(**'+ (this.filters[0] || 'career') +'**', '**'+ (this.filters[1] || 'all surfaces') +'**)'] 
        : ['(**'+ (this.filters[1] || 'career') +'**', '**'+ (this.filters[0] || 'all surfaces') +'**)'];
    
        const title = {
            name: `${this.player.name} Statistics ${title_year} ${title_surface}`, 
            link: player_stats_url
        }
        const pag = new StatsPages(title,this.msg, titles_and_finals_stats.concat(player_stats));
        pag.color = surface_colors[surface];
        pag.footer = `\n\n*Tips* \n-Use `+'`'+'-f'+'`'+' to filter by <year> and/or <surface>\n'
        +'-Surfaces include `hard`, `clay`, `grass`, `carpet`\n\n'
        return await pag.paginate();
    }
    async playerStats($){
        console.log('Finding Individual Stats..')

        if($('div.wrapper-404')[0]) return false;
        const stats_wrapper = $('#playerMatchFactsContainer').children();
        const tbody_tags = stats_wrapper.find('tbody').children();
        let records = [];
        $(tbody_tags).map((index,element) =>{
            const td_tag_texts = $(element).children().text().trim().split(/\s\s+/g);
            const [label,stats] = [td_tag_texts[0],td_tag_texts[1]];
            records.push({
                label: label,
                stats: stats 
            })
        });
        const service_records_embed = new MessageEmbed()
        .setThumbnail(atp_url+ this.player.picture)
        .addFields(
            { name: records[0].label,value: '`'+records[0].stats+'`', inline: true },
            { name: records[1].label,value: '`'+records[1].stats+'`', inline: true },
            { name: records[2].label,value: '`'+records[2].stats+'`', inline: true },
            { name: records[3].label,value: '`'+records[3].stats+'`', inline: true },
            { name: records[4].label,value: '`'+records[4].stats+'`', inline: true },
            { name: records[5].label,value: '`'+records[5].stats+'`', inline: true },
            { name: records[6].label,value: '`'+records[6].stats+'`', inline: true },
            { name: records[7].label,value: '`'+records[7].stats+'`', inline: true },
            { name: records[8].label,value: '`'+records[8].stats+'`', inline: true })

        const return_records_embed = new MessageEmbed()
        .setThumbnail(atp_url+ this.player.picture)
        .addFields(
            { name: records[9].label,value: '`'+records[9].stats+'`', inline: true },
            { name: records[10].label,value: '`'+records[10].stats+'`', inline: true },
            { name: records[11].label,value: '`'+records[11].stats+'`', inline: true },
            { name: records[12].label,value: '`'+records[12].stats+'`', inline: true },
            { name: records[13].label,value: '`'+records[13].stats+'`', inline: true },
            { name: records[14].label,value: '`'+records[14].stats+'`', inline: true },
            { name: records[15].label,value: '`'+records[15].stats+'`', inline: true },
            { name: records[16].label,value: '`'+records[16].stats+'`', inline: true },
            { name: records[17].label,value: '`'+records[17].stats+'`', inline: true })

        return [service_records_embed,return_records_embed];
    }
    async titlesAndFinals($,user_year,user_surface){
        console.log('Finding Titles & Finals Stats..')
        let titles_and_finals_stats = 
        [this.filterTournaments($,'table#singlesTitles>tbody',user_year,user_surface,'Singles Titles'),
        this.filterTournaments($,'table#singlesFinals>tbody',user_year,user_surface, 'Singles Finalist'),
        this.filterTournaments($,'table#doublesTitles>tbody',user_year,user_surface,'Doubles Titles'),
        this.filterTournaments($,'table#doublesFinals>tbody',user_year,user_surface,'Doubles Finalist')]
        .filter(value => Object.keys(value).length !== 0)
        let embeds = []
        for(let stats of titles_and_finals_stats){
            const fields = Object.keys(stats).map((tournament)=>{
                if(tournament && tournament !== 'title'){
                    let years = stats[tournament].join('` `') + '\n';
                    return {name:`${tournament}`, value: '`'+`${years}`+'`',inline:true}
                }
            }).filter(Boolean)
            const stats_embed = new MessageEmbed()
            .setThumbnail(atp_url+ this.player.picture)
            .setDescription(`${titles_and_finals_emoji[stats.title.split(' ')[1].toLowerCase()]} **${stats.title}**\n`)
            .addFields(
                fields
            )
            embeds.push(stats_embed);
        }
        return embeds;
    }
    filterTournaments($,tag,user_year,user_surface,category){
        const filtered = {}
        $(tag).children().map((index,element) =>{
            const year = $($(element).children()[0]).text().trim().replace(/\s\s+/g, '');
            let tournaments;
            if(category.split(' ')[0] == 'Singles'){
                tournaments = ($($(element).children()[2])
                .text().trim().replace(/\s\s+/g, ''))
                .split(')').filter(Boolean);
            }
            else{
                const reg = /[)](?=[a-zA-Z])/
                tournaments = ($($(element).children()[2])
                .text().trim().replace(/\s\s+/g, ''))
                .split(reg).filter(Boolean)
            }
            let filtered_tournaments = [];
            if(user_year == 0 || year == user_year){
                if(user_surface == 'all'){
                    for(let tournament of tournaments){
                        tournament = tournament.split('(').join(' ');
                        if(!(tournament in filtered)) filtered[tournament] = []
                        filtered[tournament].push(year)
                    }
                }else{
                    for(let tournament of tournaments){
                        tournament = tournament.split('/')
                        const tournament_surface = tournament[tournament.length-1].toLowerCase();
                        tournament = tournament.join('/').split('(').join(' ').replace(/[)]/, ' ')
                        if(tournament_surface.includes(user_surface)){
                            if(!(tournament in filtered)) filtered[tournament] = []
                            filtered[tournament].push(year)
                        }
                    }
                }
                tournaments = filtered_tournaments
                if(tournaments.length > 0) filtered[year] = tournaments
            }
        });
        if(Object.keys(filtered).length) filtered['title'] = category
        return filtered;
    }
}