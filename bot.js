const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const HashMap = require('./hashmap.js');

const client = new Discord.Client();
const config = require('./config.json');

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
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: './node_modules/puppeteer/.local-chromium/linux-672088/chrome-linux/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.goto('https://reddit.com/r/' + subreddit + '/hot', {waitUntil: 'networkidle0'})
    
    const res = await page.evaluate(async (postnum) => {
        let post_path = '#SHORTCUT_FOCUSABLE_DIV > div:nth-child(4) > div > div > div > div.s75588i-1.cHeFxI > div._1vyLCp-v-tE5QvZovwrASa > div.s60uip8-0.bBQgFn > div.rpBJOHq2PR60pnwJlUyP0 > div:nth-child(';
        let post_title_path = 'div._1poyrkZ7g36PawDueRza-J._11R7M_VOgKO1RJyRSRErT3 > div._2FCtq-QzlfuN-SwVMUZMM3._3wiKjmhpIpoTE2r5KCm2o6';
        let post_content_path = 'div._1poyrkZ7g36PawDueRza-J._11R7M_VOgKO1RJyRSRErT3 > div.STit0dLageRsa2yR4te_b'

        let post = document.querySelector(post_path + postnum + ')');
        let errMsg = "";

        if (typeof post === 'undefined') {
            errMsg += '[ERROR]: PAGE.EVALUATE querySelector failed for post #' + postnum + "\n";
            throw(errMsg);
        }

        let title = post.querySelector(post_title_path).innerText
        let content = post.querySelector(post_content_path).innerText;
        let hasImg = false

        if (content == ''){
            try {
                content = post.querySelector(post_content_path).querySelectorAll('img')
                imgs = ''
    
                for (let i = 0; i < content.length; i++) {
                    imgs += content[i].src;
                    imgs += '\n'
                }
    
                content = imgs;
                hasImg = true
            } catch (error) {
                errMsg += '[ERROR] PAGE.EVAULATE querySelector failed for text and images\n';
                content = ""
            }
        }

        return {
            title,
            content,
            hasImg, 
            errMsg
        }
    }, postnum)

    await browser.close()
    return res
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
            if (post.errMsg != "")
                console.log(post.errMsg);
            
            if (post.hasImg) {
                msg.channel.send('***'+post.title+'***\n\n'+post.content);
            } else {
                const embed = new Discord.RichEmbed()
                .setTitle(post.title)
                .setColor(getRandomColor())
                .setDescription(flag ? owofy(post.content) : post.content);
                msg.channel.send(embed);
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