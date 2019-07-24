require('dotenv').config()
const Discord = require('discord.js');
const Snoowrap = require('snoowrap');
const HashMap = require('./hashmap.js');

const client = new Discord.Client();
const config = require('./config.json');
const r = new Snoowrap({
    userAgent: config.name,
    clientId: config.clientID,
    clientSecret: config.clientSecret,
    username: config.redditUser,
    password: config.redditPass
});

const prefix = config.prefix;
var subreddits = new HashMap();

// Returns a random 6 digit hexadecimal number
function getRandomColor() {
    let hexadecimal = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i++)
        color += hexadecimal[Math.floor(Math.random() * 16)];
    
    return color
}

// Returns nth post from a subreddit
async function getPost(subreddit, postnum) {
    return await r.getSubreddit(subreddit).getHot()
    .then((posts) => {
        post = posts[postnum];
 
        title = post.title;
        content = post.selftext;
        hasImg = false;
        if (content == "") {
            hasImg = true;
            content += post.url;
        }
        
        return {
            title,
            content,
            hasImg
        }
    })
    .catch((err) => {
        console.log('[ERROR] Failed in getSubreddit().getHot() ', err.message);
        throw(err);
    })
}

function owofy(text) {
    text = text.replace(/(r|l)/g, 'w');
    text = text.replace(/(R|L)/g, 'W');
    text = text.replace(prefix+'owo', '');

    return text;
}

function isDigit(text) {
    return !isNaN(text - parseFloat(text));
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    if (msg.author.bot) 
        return;

    if (msg.content == (prefix+'owo')) {
        msg.reply('*OwO*');
    }
    else if (msg.content.includes(prefix+'reset')) {
        let cmds = msg.content.split(' ');
        if (cmds.length == 1)
            subreddits = new HashMap();
        else {
            for (let i = 1; i < cmds.length; i++)
                subreddits.set(cmds[i], 0);
        }
    }
    else if (msg.content.includes('bulge')) {
        msg.reply('*Notices bulge OwO Wat this?*');
    }
    else if (msg.content[0] == prefix && msg.content.substr(0, prefix.length+3) != (prefix+"owo")) {
        let cmds = msg.content.split(' ');
        let overideNum = isDigit(cmds[1]);
        let flag = cmds[1] == (prefix + "owo") || cmds[2] == (prefix + "owo");
        subreddit = cmds[0].replace(prefix, '');
        
        if (!subreddits.has(subreddit)) 
            subreddits.set(subreddit, 1);
        else 
            subreddits.inc(subreddit);
        
        let err = getPost(subreddit, overideNum ? Number(cmds[1]) : subreddits.get(subreddit)).then((post) => {
            if (post.hasImg) {
                msg.channel.send(`***${post.title}***\n${post.content}`);
            } else {
                if (post.content.length > 2000) {
                    msg.channel.send(`***${post.title}***`);
                    let content_length = post.content.length;

                    // For post with long content
                    for (let i = 0; i < (content_length%2000); i++) {
                        let post_content = post.content.slice(i*2000, (i+1)*2000);
                        if (post_content.length == 0) {
                            break;
                        }
                        msg.channel.send(post_content);
                    }
                } else {
                    const embed = new Discord.RichEmbed()
                    .setTitle(post.title)
                    .setColor(getRandomColor())
                    .setDescription(flag ? owofy(post.content) : post.content);
                    msg.channel.send(embed);
                }
            }
    
            return false;      
        })
        .catch((err) => {
            console.log('[ERROR] CLIENT.ON("MESSAGE") failed in getPost Promise ' + err.message)
            msg.reply('*OwO an error occured*');
            return true;
        });

        if (!err && !overideNum)
            subreddits.inc(subreddit);
    } 
    else if (msg.content.includes(prefix+"owo")) {
        let res = owofy(msg.content);

        msg.reply(res);
    }
});

client.login(config.token);
