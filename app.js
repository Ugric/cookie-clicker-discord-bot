const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons');
const snooze = milliseconds => new Promise((resolve) => setTimeout(resolve, milliseconds))
disbut(client);

const gamedata = {}

const upgradesdata = { clickers: { ps: 1, price: 10 }, grandmas: { ps: 10, price: 100 }, factories: { ps: 100, price: 1000 } }


const embedrender = ({ user, cookies, upgrades }) => {
    const fields = upgrades.map(([key, value]) => { return { name: `${key} (${upgradesdata[key].price} cookies)`, value: `${value} ${key} = ${value * upgradesdata[key].ps} cookies per second` } })
    return new Discord.MessageEmbed()
        .setColor('#6e5000')
        .setTitle('COOKIE CLICKER')
        .setAuthor(user.tag, user.avatarURL)
        .setThumbnail("https://static.wikia.nocookie.net/cookieclicker/images/5/5a/PerfectCookie.png/revision/latest/scale-to-width-down/210?cb=20130827014912")
        .addFields(
            fields
        )
        .setFooter(`${cookies} cookies`)
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('clickButton', async (button) => {
    if (button.clicker.user && button.message.id in gamedata) {
        const olddata = JSON.stringify(gamedata[button.message.id])
        if (button.id == "click") {
            gamedata[button.message.id].cookies++
        } else if (button.id == "clicker") {
            if (gamedata[button.message.id].cookies - upgradesdata[gamedata[button.message.id].upgrades[0][0]].price >= 0) {
                gamedata[button.message.id].cookies -= upgradesdata[gamedata[button.message.id].upgrades[0][0]].price
                gamedata[button.message.id].upgrades[0][1]++
            }
        } else if (button.id == "grandma") {
            if (gamedata[button.message.id].cookies - upgradesdata[gamedata[button.message.id].upgrades[1][0]].price >= 0) {
                gamedata[button.message.id].cookies -= upgradesdata[gamedata[button.message.id].upgrades[1][0]].price
                gamedata[button.message.id].upgrades[1][1]++
            }
        } else if (button.id == "factory") {
            if (gamedata[button.message.id].cookies - upgradesdata[gamedata[button.message.id].upgrades[2][0]].price >= 0) {
                gamedata[button.message.id].cookies -= upgradesdata[gamedata[button.message.id].upgrades[2][0]].price
                gamedata[button.message.id].upgrades[2][1]++
            }
        } else if (button.id == "save") {
            button.clicker.user.send("game saved, when you want to load the game, click this", new MessageAttachment(Buffer.from('some text', 'utf-8'), 'myfile.txt'))
        }
        if (olddata !== JSON.stringify(gamedata[button.message.id])) {
            button.message.edit(embedrender(gamedata[button.message.id]))
        }
    } button.reply.defer()
})
client.on('message', async message => {
    if (message.author.bot) return
    if (message.content === '!cc start') {
        const tempgamedata = {
            user: {
                tag: message.author.tag,
                id: message.author.id,
                avatarURL: message.author.avatarURL()
            }, cookies: 0, upgrades: [["clickers", 0], ["grandmas", 0], ["factories", 0]], interval: setInterval(() => {
                const olddata = JSON.stringify(gamedata[sentmessage.id])
                for (let i = 0; i < gamedata[sentmessage.id].upgrades.length; i++) {
                    gamedata[sentmessage.id].cookies += upgradesdata[gamedata[sentmessage.id].upgrades[i][0]].ps * gamedata[sentmessage.id].upgrades[i][1] * 2
                }
                if (olddata !== JSON.stringify(gamedata[sentmessage.id])) {
                    sentmessage.edit(embedrender(gamedata[sentmessage.id]))
                }
            }, 2000)
        }
        const sentmessage = await message.channel.send(embedrender(tempgamedata), new disbut.MessageActionRow()
            .addComponent(new disbut.MessageButton()
                .setStyle("red").setLabel("🍪")
                .setID(`click`)
            ).addComponent(new disbut.MessageButton()
                .setStyle("red").setLabel("upgrade clickers")
                .setID(`clicker`)
            ).addComponent(new disbut.MessageButton()
                .setStyle("red").setLabel("upgrade grandmas")
                .setID(`grandma`)
            ).addComponent(new disbut.MessageButton()
                .setStyle("red").setLabel("upgrade factories")
                .setID(`factory`)
            ).addComponent(new disbut.MessageButton()
                .setStyle("red").setLabel("save and close")
                .setID(`save`)
            ));

        gamedata[sentmessage.id] = tempgamedata
    }
});

client.login('ODY0NjA3OTU0NDU5ODIwMDgz.YO365w.Mnlu1hw8LXsthT1IwCjrNlT3AF8');