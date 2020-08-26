const Cheerio = require('cheerio');
const https = require('https');
const atp_url = 'https://www.atptour.com';
const Paginator = require("../../../extensions/paginator");
const {loadHTML} = require("../../../extensions/helpers");
const { MessageEmbed } = require("discord.js");
const country_to_emoji = require('../../../extra/allcountries-2-emojis.json');

class ProfilePages extends Paginator {
    constructor(title,message,entries) {
        super(title,message,entries);
        this.embeds = entries;
    }
}

module.exports = class PlayerProfile{
    constructor(msg,player){
        this.msg = msg;
        this.player = player
    }
    getBasicStats($,html_table,attribute){
        const stats = []
        $(html_table).children().map((index,element)=>{
            const text = $(element).find('div').attr(attribute);
            stats.push(text);
        });
        return stats;
    }
    getBasicBio($,html_table,class_attr){
        const bio = []
        $(html_table).children().map((index,element)=>{
            const text = $(element).find(class_attr).text().trim().replace(/\s\s+/g, '');
            bio.push(text)
        })
        return bio;
    }
    async findProfile(){
        console.log('Finding Player Profile...');
        const url = atp_url + this.player.link;
        console.log('Player url:', url);
        const $ = await loadHTML(url);
        
        const stats_table = $('.players-stats-table>tbody').children();
        const current_stats_singles = this.getBasicStats($,stats_table[0],'data-singles')
        const current_stats_doubles = this.getBasicStats($,stats_table[0],'data-doubles')
        const career_stats_singles = this.getBasicStats($,stats_table[1],'data-singles')
        const career_stats_doubles = this.getBasicStats($,stats_table[1],'data-doubles')

        const profile_table = $('.player-profile-hero-table>div>table>tbody').children();
        const player_main_info = this.getBasicBio($,profile_table[0],'.table-big-value').concat(this.getBasicBio($,profile_table[1],'.table-value'));

        const age = player_main_info[0] || 'Not Found';
        const turned_pro = player_main_info[1] || 'Not Found';
        const career_prize_money = career_stats_doubles[4] || 'Not Found';
        const height = player_main_info[3] || 'Not Found';
        const weight = player_main_info[2] || 'Not Found';
        const plays = player_main_info[6] || 'Not Found';
        const coaches = player_main_info[7] || 'Not Found';
        const birthplace = player_main_info[4] || 'Not Found';
        const residence = player_main_info[5] || 'Not Found';
        const birth_array = birthplace.split(',')
        const birth_country = country_to_emoji[birth_array[birth_array.length-1].toLowerCase().trim()] || '';
        const bio_embed = new MessageEmbed()
            .setThumbnail(atp_url+ this.player.picture)
            .addFields(
                { name: '**Age 🎂**', value: age,inline: true },
                { name: '**Turned Pro 🗓**', value: turned_pro,inline: true },
                { name: '**Career Prize 💰**', value: career_prize_money,inline: true },
                { name: '**Height 📏**', value: height,inline: true },
                { name: '**Weight 🏋️**', value: weight,inline: true },
                { name: '**Plays 👋**', value: plays,inline: true },
                { name: '**Coach(s) 👥**', value: coaches,inline: true },
                { name: `**Birthplace ${birth_country}**`, value: birthplace,inline: true },
                { name: '**Residence 🏠**', value: residence,inline: true })

        const current_singles_ranking = $('.data-number').text().trim().replace(/\s\s+/g, '') || 'Not Found';
        const career_high_singles_ranking = career_stats_singles[1] || 'Not Found';
        const current_singles_titles = current_stats_singles[5] || 'Not Found';
        const carrer_singles_titles = career_stats_singles[3]|| 'Not Found';
        const current_singles_record = current_stats_singles[4] || 'Not Found';
        const career_singles_record = career_stats_singles[2]|| 'Not Found';
        const current_doubles_ranking = current_stats_doubles[2] || 'Not Found';
        const career_high_doubles_ranking = career_stats_doubles[1] || 'Not Found'
        const current_doubles_titles = current_stats_doubles[5] || 'Not Found';
        const carrer_doubles_titles = career_stats_doubles[3]|| 'Not Found';
        const current_doubles_record = current_stats_doubles[4] || 'Not Found';
        const career_doubles_record = career_stats_doubles[2]|| 'Not Found';
    
        const stats_embed = new MessageEmbed()
            .setDescription('📊 Use `atp player-stats ' + this.player.name+ '` for full statistics')
            .setThumbnail(atp_url+ this.player.picture)
            .addFields(
                { name: '**Singles Rankings**', value: `${current_singles_ranking} (Current)\n${career_high_singles_ranking} (Career High)`,inline: true },
                { name: '**Singles Titles**', value: `${current_singles_titles} (Current)\n${carrer_singles_titles} (Career)`,inline: true },
                { name: '**Singles Records**', value: `${current_singles_record} (Current)\n${career_singles_record} (Career)`,inline: true },
                { name: '**Doubles Rankings**', value: `${current_doubles_ranking} (Current)\n${career_high_doubles_ranking} (Career High)`,inline: true },
                { name: '**Doubles Titles**', value: `${current_doubles_titles} (Current)\n${carrer_doubles_titles} (Career)`,inline: true },
                { name: '**Doubles Records**', value: `${current_doubles_record} (Current)\n${career_doubles_record} (Career)`,inline: true })

        const title = {name: `${this.player.name} ${country_to_emoji[$('.player-flag-code').text().toLowerCase()]}`, link: atp_url + this.player.link}
        const pag = new ProfilePages(title,this.msg, [bio_embed,stats_embed]);
        return await pag.paginate(); 
    }
    
}
