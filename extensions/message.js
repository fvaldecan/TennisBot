const { Constants } = require("discord.js");
const { CommandoMessage } = require("discord.js-commando");

module.exports = () => {
  CommandoMessage.prototype.failure = async function (descriptionOrData) {
    if (typeof descriptionOrData == "string")
      descriptionOrData = { description: descriptionOrData };
    return await this.embed(
      Object.assign({}, descriptionOrData, { color: Constants.Colors.FAILURE })
    );
  };

  CommandoMessage.prototype.info = async function (info) {
    // For single page embed
    const title = info.name || "";
    const description = info.description || "";
    const thumbnail = { url: info.thumbnail } || {};
    const fields = info.fields || [];
    const image = { url: info.image } || {};
    return await this.embed(
      Object.assign(
        { title: title },
        { description: description },
        { thumbnail: thumbnail },
        { color: Constants.Colors.MAIN },
        { fields: fields },
        { image: image },
        { footer: { text: `🎾 10s help` } })
      );
  };
  CommandoMessage.prototype.prompts = {
    atp_help: {
      name: `**Association of Tennis Professionals (ATP)**`,
      description:
        "Get rankings, player profiles, and player statistics in Men's Professional Tennis\n",
      thumbnail:
        "https://www.underconsideration.com/brandnew/archives/atp_tour_logo.jpg",
      fields: [
        {
          name: '**Rankings 🏅 | `atp rankings`**',
          value: 
            `Returns a list of ATP rankings in this format:\n Rank | Name | Age | Country | Points | No. Tournaments\n` +
            `Filter rankings by <gameplay> and/or <country> and/or <range>\n` + 
            '*Gameplay* includes `singles` or `doubles`\n'+
            `*Country* searches best with 2 or 3 letters abbreviations\n`+
            "*Range* must be formmated with '-' in between\n"+
            'E.g. `10s atp rankings singles USA`, `10s atp rankings doubles serbia 100-1000`'
        },
        {
          name: '**Player Profiles 👤 | `atp player-profile`**',
          value: `Returns basic information and statistics about a player\n`+
          'E.g. `10s atp player-profile Roger Federer`',
        },
        {
          name: '**Player Statistics 📊 | `atp player-stats`**',
          value: `Returns a players individual statistics and tournament records.\n` + 
          `Use `+'`'+'-f'+'`'+' to filter by <year> and/or <surface>\n' + 
          '*Surfaces* include `hard`, `clay`, `grass`, `carpet`\n'+
          'E.g. `10s apt player-stats Rafael Nadal clay`,`10s atp player-stats Novak Djokovic hard 2012`',
        },
        {
          name: '**Help 🔍 | `atp` or `help atp`**',
          value:"Returns full details of ATP Commands",
        },
        {
          name: "**Other Details**",
          value:
            'Running `player-profile` & `player-stats` ' +
            'will search for the player first.'+ 
            'When there are multiple search results a prompt of the players found will be shown.'
        },
      ],
    },
    scores_help: {
      name: `**Scores Help**`,
      description:
        "Get scores of completed WTA & ATP matches\n",
      fields: [
        {
          name: '**Getting scores 🔢 | `scores`**',
          value:
            "Get todays scores by running `10s scores` or find scores of a certain date by running `10s scores mm/dd/yyyy` E.g. 10s scores 04/11/2019\n",
        },
        {
          name: '**Help 🔍 | `help scores`**',
          value: "Returns scores of completed ATP & WTA matches",
          
        }
      ]
    },
    help: {
      name: "**Tennis Bot Help 🔍**",
      description:
        "To run a command use `10s command`. To run a command in a DM, simply use `command` with no prefix. "  +
        "Use `10s help` to view a list of all commands. "+
        "Use `10s help <keyword>` to view detailed information about a command or group.",
      fields: [
        {
          name: '**Info on ATP Players | `atp`**',
          value:
            "Subcommands\n `rankings`, `player-profile`,`player-stats`, `player-activity`, `scores`\n",
        },
        {
          name: '**Scores on ATP & WTA matches | `scores`**',
          value: "Returns scores of completed ATP & WTA matches",
          
        }
        // { TODO:
        //   name: "**Info on WTA Players | `wta`**",
        //   value: "Same features from the `atp` command but for WTA",
        //   // value: 'Detailed Info\n`10s wta` or `10s help wta`\n'
        //   // + '*WTA Subcommands*\n `rankings`, `profile`,`player-stats`\n',
        //   // + 'Ex. `10s wta doubles rankings`, `10s wta profile Serena Williams`',
        //   inline: true,
        // },
        // { TODO:
        //   name: "**Look up tennis gear** | `gear`",
        //   value:
        //     "COMING SOON Look up from various tennis websites (Tennis-Warehouse, Tennis Express & Midwest Sports)",
        //   // value: '*Detailed Info*\n `10s gear` or `10s help gear`\n'
        //   // + 'Ex. `10s gear babolat pure drive`, `10s solinco tourbite`',
        // },
      ],
    },
  };
};
