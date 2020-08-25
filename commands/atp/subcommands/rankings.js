const Cheerio = require('cheerio');
const https = require('https');
const atp_url = 'https://www.atptour.com';
const Paginator = require("../../../extensions/paginator");
const { MessageEmbed } = require("discord.js");
const game_type = {'singles':'Singles', 'doubles': 'Doubles'};
const countries = require('../../../extra/countries.json');
const country_to_emoji = require('../../../extra/allcountries-2-emojis.json');
class RankPages extends Paginator {
    constructor(title,message,entries) {
        super(title,message,entries);
        this.items_per_page = 10;
        this.footer = 'Rank | Name | Age | Country | Points | No. Tournaments Played';
        let embeds = [];
        for(let i = 0; i < entries.length; i+= this.items_per_page){
            let embed = new MessageEmbed();
            let current_entries = [...entries]; //Shallow copy to avoid mutation
            current_entries = current_entries.splice(i,this.items_per_page); 
            embed.setDescription(current_entries.map(e => `${e}`).join('\n'));
            embeds.push(embed);
        }
        this.embeds = embeds
    }
}

module.exports = class Rankings{
    constructor(msg,args) {
        this.msg = msg;
        this.args = args;
    }
    async findRanks() {
        console.log(this.args);
        if(!this.args.length){
            // Help: 
            console.log('ATP_RANKINGS TODO:');
        }
        console.log('Find Rankings...');
        const type = game_type[this.args.find(t => game_type[t.toLowerCase()])] || 'Singles';
        const country = countries[this.args.find(c => countries[c.toLowerCase()])] || '';
        const range = (this.args.find(r => r.includes('-')) || '1-5000').split('-');
        const range_first = (Number(range[0]) == range[0]) ? range[0] : '1';
        const range_last = (Number(range[1]) == range[1] && range[1] > range_first) ? range[1] : '5000';
        const url = atp_url + `/en/rankings/${type}?countryCode=${country}&rankRange=${range_first}-${range_last}`;
        console.log(url)
        const html = await new Promise(resolve => {
            https.get(url).on("response", function (response) {
                let body = "";
                response.on("data", (chunk) => body += chunk);
                response.on("end", () => resolve(body));
            });
        });
        const $ = Cheerio.load(html);
        const table = $('tbody');
        if(table.children() < 2) return this.msg.reply('No players found with that command :(');
        let players = [];
        table.children().map((index,element) => {
            const rank = $(element).find('.rank-cell').text().replace(/\s\s+/g, '');
            const name = $(element).find('.player-cell').text().replace(/\s\s+/g, '');
            const name_link = $(element).find('.player-cell').find('a').attr('href');
            const age = $(element).find(".age-cell").text().replace(/\s\s+/g, '').trim();
            const player_country = country_to_emoji[$(element).find(".country-item").find('img').attr('alt').toLowerCase()];
            const points = $(element).find(".points-cell").text().trim();
            const num_tournaments = $(element).find(".tourn-cell").text().trim();
            players.push(`${rank}. | [${name}](${atp_url+name_link}) | ${age} | ${player_country} | ${points} | ${num_tournaments} `);//|${this.getUTR(name)}` );
        });
        
        const emptyOut = (el => {return el != null && el != '';});
        const title_name = ((type) || (country) ? 
        ['ATP', type, country.toUpperCase(), 'Rankings', `(${table.children().length})`].filter(emptyOut).join(' ') 
        : `ATP Singles Rankings (${table.children().length})`);
        const title = {
            name: title_name,
            link: url
        }
        const pag = new RankPages(title,this.msg, players);
        return await pag.paginate(); 
        
    }
}
