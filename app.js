const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons');
const token = require("./token.json")
const snooze = milliseconds => new Promise((resolve) => setTimeout(resolve, milliseconds))
disbut(client);

const gamedata = {}

const gamemessage = {}

const upgrademessage = {}
const upgradesmessageid = {}

const upgradebuttons = ["clicker", "grandma", "factory"]

setInterval(() => {
    for (game in gamedata) {
        const olddata = JSON.stringify(gamedata[game])
        for (let i = 0; i < gamedata[game].upgrades.length; i++) {
            gamedata[game].cookies += upgradesdata[gamedata[game].upgrades[i][0]].ps * gamedata[game].upgrades[i][1] * 5
        }
        if (olddata !== JSON.stringify(gamedata[game])) {
            gamemessage[game].edit(embedrender(gamedata[game]))
        }
    }
}, 5000)



const prefix = "!cc"

const upgradesdata = { clickers: { ps: 0.1, price: 10 }, grandmas: { ps: 2.5, price: 100 }, factories: { ps: 75.5, price: 1000 } }


const embedrender = ({ user, cookies, upgrades, buymax }) => {
    let totalps = 0
    const fields = upgrades.map(([key, value]) => { totalps += value * upgradesdata[key].ps; return { name: `${key} (${upgradesdata[key].price} cookies)`, value: `${value} ${key} = ${(value * upgradesdata[key].ps).toFixed(1)} cookies per second` } })
    return new Discord.MessageEmbed()
        .setColor('#6e5000')
        .setTitle('COOKIE CLICKER')
        .setAuthor(user.tag, user.avatarURL)
        .setThumbnail("https://raw.githubusercontent.com/Ugric/cookie-clicker-discord-bot/master/images/cci.jpg?raw=true")
        .addField("buy max", buymax)
        .addFields(
            fields
        )
        .addField("total", `${totalps.toFixed(1)} per second`)
        .setFooter(`${Math.floor(cookies)} cookies`)
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('clickButton', async (button) => {

    let messageid = button.message.id
    if (button.message.id in upgradesmessageid) {
        messageid = upgradesmessageid[button.message.id]
    }
    if (button.clicker.user && messageid in gamedata && button.clicker.user.id == gamedata[messageid].user.id) {
        const olddata = JSON.stringify(gamedata[messageid])
        if (button.id == "click") {
            gamedata[button.message.id].cookies++
        } else if (button.id == "togglebuymax") {
            gamedata[messageid].buymax = !gamedata[messageid].buymax
        }
        else if (upgradebuttons.includes(button.id)) {
            const buttonindex = upgradebuttons.indexOf(button.id)
            const bought = gamedata[messageid].buymax ? Math.floor(gamedata[messageid].cookies / upgradesdata[gamedata[messageid].upgrades[buttonindex][0]].price) : 1
            if (gamedata[messageid].cookies - upgradesdata[gamedata[messageid].upgrades[buttonindex][0]].price * bought < 0) {
                return
            }
            gamedata[messageid].cookies -= upgradesdata[gamedata[messageid].upgrades[buttonindex][0]].price * bought
            gamedata[messageid].upgrades[buttonindex][1] += bought
        }
        else if (button.id == "save") {
            const data = gamedata[messageid]
            delete gamedata[messageid]
            delete data.user
            gamemessage[messageid].delete()
            upgrademessage[messageid].delete()
            const databuffer = Buffer.from(JSON.stringify(data)).toString('base64')
            button.clicker.user.send(`game saved, when you want to load the game do:\`\`\`${prefix} start ${databuffer}\`\`\``)
            return
        }
        if (olddata !== JSON.stringify(gamedata[messageid])) {
            gamemessage[messageid].edit(embedrender(gamedata[messageid]))
        }
    } button.reply.defer()
})
client.on('message', async message => {
    if (message.author.bot) return
    const command = message.content.split(" ")
    if (command.length > 0 && command[0] == prefix) {
        command.shift()
        if (command.length > 0 && command[0] == "start") {
            command.shift()
            const tempgamedata = {
                user: {
                    tag: message.author.tag,
                    id: message.author.id,
                    avatarURL: message.author.avatarURL()
                }, cookies: 0, upgrades: [
                    ["clickers", 0],
                    ["grandmas", 0],
                    ["factories", 0]
                ],
                buymax: true
            }
            if (command.length > 0) {
                try {
                    const sentdata = JSON.parse(Buffer.from(command[0], 'base64').toString('ascii'))
                    tempgamedata.cookies = sentdata.cookies
                    tempgamedata.upgrades = sentdata.upgrades
                    tempgamedata.buymax = sentdata.buymax
                } catch {
                    message.reply(`could not load game from that game data are you sure you pasted it properly?`)
                    return
                }
            }
            const sentmessage = await message.reply(embedrender(tempgamedata), new disbut.MessageActionRow()
                .addComponent(new disbut.MessageButton()
                    .setStyle("red").setLabel("🍪")
                    .setID(`click`)
                ).addComponent(new disbut.MessageButton()
                    .setStyle("red").setLabel("toggle buy max")
                    .setID(`togglebuymax`)
                ).addComponent(new disbut.MessageButton()
                    .setStyle("red").setLabel("save and close")
                    .setID(`save`)
                ));
            const upgradesmessage = await message.reply(new Discord.MessageEmbed()
                .setColor('#6e5000')
                .setTitle('UPGRADES'), new disbut.MessageActionRow().addComponent(new disbut.MessageButton()
                    .setStyle("red").setLabel("upgrade clickers")
                    .setID(`clicker`)
                ).addComponent(new disbut.MessageButton()
                    .setStyle("red").setLabel("upgrade grandmas")
                    .setID(`grandma`)
                ).addComponent(new disbut.MessageButton()
                    .setStyle("red").setLabel("upgrade factories")
                    .setID(`factory`)
                ))
            gamedata[sentmessage.id] = tempgamedata
            gamemessage[sentmessage.id] = sentmessage
            upgrademessage[sentmessage.id] = upgradesmessage
            upgradesmessageid[upgradesmessage.id] = sentmessage.id
            message.delete().catch(() => { })
        } else {
            message.channel.send(`do \`${prefix} start\``)
        }
    }
});

client.login(token);