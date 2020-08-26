const Cheerio = require('cheerio');
const https = require('https');

module.exports =  {
    loadHTML: async function(url){
        const html = await new Promise(resolve => {
            https.get(url).on("response", function (response) {
                let body = "";
                response.on("data", (chunk) => body += chunk);
                response.on("end", () => resolve(body));
            });
        }); 
        return Cheerio.load(html);
    }
}

