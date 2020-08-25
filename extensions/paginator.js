const Pagination = require('discord-paginationembed');
const {Constants} = require("discord.js");

module.exports = class Paginator {
    constructor(title,message,entries) {
        this.title = title;
        this.message = message;
        this.entries = entries;
        this.embeds = [];
        this.color = Constants.Colors.MAIN;
        this.footer = '🎾 10s help';
    }
    async paginate() {
        this.message.channel.stopTyping(true);
        const Embeds = new Pagination.Embeds()
            .setArray(this.embeds)
            .setAuthorizedUsers([this.message.author.id])
            .setChannel(this.message.channel)
            .setTitle(this.title.name)
            .setURL(this.title.link)
            .setFooter(this.footer)
            .setColor(this.color)
            .setPageIndicator(true)
            // // Sets the client's assets to utilise. Available options:
            // //  - message: the client's Message object (edits the message instead of sending new one for this instance)
            // //  - prompt: custom content for the message sent when prompted to jump to a page
            // //      {{user}} is the placeholder for the user mention
            .setTimeout(60000)
            .setDeleteOnTimeout(true)
            // Listeners for PaginationEmbed's events
            // After the initial embed has been sent
            // (technically, after the client finished reacting with enabled navigation and function emojis).
            .on('start', (user) => this.message.reply(`Page will expire if left unused for 1 minute!`))
            // When the instance is finished by a user reacting with `delete` navigation emoji
            // or a function emoji that throws non-Error type.
            .on('finish', (user) => console.log(`Finished! User: ${user.username}`))
            // Upon a user reacting on the instance.
            .on('react', (user, emoji) => console.log(`Reacted! User: ${user.username} | Emoji: ${emoji.name} (${emoji.id})`))
            // When the awaiting timeout is reached.
            .on('expire', () => console.log('Page expired...'))
            // Upon an occurance of error (e.g: Discord API Error).
            .on('error', console.error);
        
        return await Embeds.build();
    }
}

