require('dotenv').config();
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');
const Discord = require('discord.js');

const ttsClient = new textToSpeech.TextToSpeechClient();
const client = new Discord.Client();

const serverId = process.env.SERVER_ID;
const prefix = '?';

let templatesChannel;

const hillaHandler = {
    active: false,
};

let dispatcher;
let voiceHandler = {};

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log('ready!'));

client.on('disconnect', () => console.log('i just disconnected, making sure you know, i will reconnect now...'));

client.on('reconnecting', () => console.log('i am reconnecting now!'));

client.on('ready', () => {
    console.log(`logged in as ${client.user.tag}!`);
    const guild = client.guilds.get(serverId);
    templatesChannel = client.channels.get(process.env.TEMPLATES_ID);
    if (guild.voiceConnection) {
        guild.voiceConnection.leave();
    }
});

function announce5Seconds() {
    const timeout = setTimeout(() => {
        callTimeToNextSoulSplit();
    }, 5000);
    hillaHandler.timeout = timeout;
    playFile('a5seconds.mp3');
}

function announce15Seconds() {
    const timeout = setTimeout(() => {
        announce5Seconds();
    }, 10000);
    hillaHandler.timeout = timeout;
    playFile('a15seconds.mp3');
}

function announce30Seconds() {
    const timeout = setTimeout(() => {
        announce15Seconds();
    }, 15000);
    hillaHandler.timeout = timeout;
    playFile('a30seconds.mp3');
}

function anounce60Seconds() {
    const timeout = setTimeout(() => {
        announce30Seconds();
    }, 30000);
    hillaHandler.timeout = timeout;
    playFile('a60seconds.mp3');
}

function callTimeToNextSoulSplit() {
    const nextSoulSplit = Date.now() + (hillaHandler.interval * 1000);
    let timeLeft = hillaHandler.end - nextSoulSplit;
    timeLeft = Math.floor((timeLeft / 1000));
    let minutes = Math.floor(timeLeft / 60);
    let seconds = '00';
    if (minutes > 0) {
        timeLeft = timeLeft - (minutes * 60);
    }
    if (timeLeft > 0) {
        seconds = Math.floor(timeLeft);
        if (seconds < 10) {
            seconds = `0${seconds}`;
        }
    }
    const text = `Next soul split at ${minutes} ${seconds}`;
    
    const timeLeftToSoulSplit60Seconds = nextSoulSplit - 60000;

    const timeout = setTimeout(() => {
        anounce60Seconds();
    }, timeLeftToSoulSplit60Seconds - Date.now());

    hillaHandler.timeout = timeout;

    const request = {
        input: {
            text,
        },
        voice: {
            languageCode: 'en-US', 
            name: 'en-US-Wavenet-F'
        },
        audioConfig: {
            audioEncoding: 'MP3'
        },
    };

    // replace this with any other tts client
    
    ttsClient.synthesizeSpeech(request, (err, response) => {
        if (err) {
            console.error('ERROR:', err);
            return;
        }
        fs.writeFile('file.mp3', response.audioContent, 'binary', err => {
            if (err) {
                console.error('ERROR:', err);
                return;
            }
            playFile('file.mp3')
        });
    });
}

function playFile(file) {
    const guild = client.guilds.get(serverId);
    if (!guild.voiceConnection) {
        return;
    }
    const connection = voiceHandler.connection;
    if (dispatcher) {
        setTimeout(() => {
            playFile(file);
        }, 500);
    } else {
        dispatcher = connection.playFile(file);
        dispatcher.on('end', (reason) => {
            dispatcher = false;
        });
    }
};

client.on('message', (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    if (message.channel.type === 'text' && (message.guild && message.guild.id === serverId)) {
        if (message.channel.id !== templatesChannelId) {
            return;
        }
        let command = message.content.toLowerCase().split(' ')[0];
        command = command.slice(prefix.length);
        const args = message.content.split(' ');

        if (command === 'join') {
            const vc = message.member.voiceChannel;
            if (!vc) {
                message.reply('you have to be in voice channel for me to join.');
                return;
            }
            vc.join()
                .then((connection) => {
                    voiceHandler.connection = connection;
                    voiceHandler.vc = vc;
                    message.reply(`joined ${vc.name}`);
                })
                .catch(console.error);

        } else if (command === 'hilla') {
            const guild = client.guilds.get(serverId);
            if (!guild.voiceConnection) {
                message.reply('im not in vc.')
                return;
            }
            if (hillaHandler.active) {
                message.reply('hilla callouts already active.');
                return;
            }
            message.delete();
            message.channel.send({
              'embed': {
                'color': 15725904,
                'thumbnail': {
                  'url': 'https://vignette.wikia.nocookie.net/maplestory/images/5/5b/Artwork_Verus_Hilla_%28Soul_Collector_1%29.png/revision/latest/scale-to-width-down/171?cb=20180901101856'
                },
                'author': {
                  'name': 'True Hilla Advanced Managment'
                },
                'fields': [
                  {
                    'name': 'Dont touch this reactions unless youre Sha',
                    'value': 'React to fix errors'
                  }
                ]
              }
            })
            .then((hillaManagment) => {
                hillaManagment.react('🏁');
                hillaManagment.react('💕');
                hillaManagment.react('💛');
                hillaManagment.react('✋');
                hillaManagment.react('🔁');
                message.channel.send({
                  'embed': {
                    'color': 15725904,
                    'thumbnail': {
                      'url': 'https://vignette.wikia.nocookie.net/maplestory/images/5/5b/Artwork_Verus_Hilla_%28Soul_Collector_1%29.png/revision/latest/scale-to-width-down/171?cb=20180901101856'
                    },
                    'author': {
                      'name': 'True Hilla Soul Split Callouts'
                    },
                    'fields': [
                      {
                        'name': 'How to',
                        'value': 'React to the emojis on this message based on the following steps, bot will automaticly call out when soul split will happen based on the reactions.'
                      },
                      {
                        'name': 'Step #1: 🏁',
                        'value': 'React to this emoji when party leader has talked to the NPC and the party has entered the boss (before the animation).'
                      },
                      {
                        'name': 'Step #2: 💕',
                        'value': 'React to this emoji when the 1st treshold has been reached. \n\n40% left on the 2nd pink HP bar.'
                      },
                      {
                        'name': 'Step #3: 💛',
                        'value': 'React to this emoji when the 2nd treshold has been reached. \n\n20% left on the 3rd yellow HP bar.'
                      },
                      {
                        'name': 'Step #4: ✋',
                        'value': 'React to this emoji when the fight has ended.'
                      }
                    ]
                  }
                })
                .then((hilla) => {
                    hilla.react('🏁');
                    hillaHandler.active = true;
                    hillaHandler.id = hilla.id;
                    hillaHandler.message = hilla;
                    hillaHandler.managment = hillaManagment;
                    hillaHandler.interval = 150;
                });
            });

        } else if (command === 'leave') {
            templatesChannel.fetchMessages()
                .then((messages) => {
                    const unpinned = messages.filter(m => !m.pinned);
                    templatesChannel.bulkDelete(unpinned, true);
                })
                .catch(console.error);
            if (hillaHandler.active) {
                clearTimeout(hillaHandler.timeout);
                hillaHandler.active = false;
            }
            if (voiceHandler.vc) {
                voiceHandler.vc.leave();
                voiceHandler = {};
            }
        }
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.id === hillaHandler.id) {
        if (user.id !== client.user.id) {
            if (reaction.emoji.name === '🏁') {
                const startTime = Date.now();
                hillaHandler.start = startTime;
                hillaHandler.end = startTime + 1800000;
                playFile('start.mp3');
                const timeout = setTimeout(() => {
                    callTimeToNextSoulSplit();
                }, 16000);
                hillaHandler.timeout = timeout;
                hillaHandler.message.clearReactions()
                    .then(() => {
                        setTimeout(() => {
                            hillaHandler.message.react('💕');
                        }, 10000);
                    });
            } else if (reaction.emoji.name === '💕') {
                hillaHandler.interval = 125;
                playFile('125.mp3');
                hillaHandler.message.clearReactions()
                    .then(() => {
                        setTimeout(() => {
                            hillaHandler.message.react('💛');
                        }, 10000);
                    });
            } else if (reaction.emoji.name === '💛') {
                hillaHandler.interval = 100;
                playFile('100.mp3');
                hillaHandler.message.clearReactions()
                    .then(() => {
                        hillaHandler.message.react('✋');
                    });
            } else if (reaction.emoji.name === '✋') {
                hillaHandler.active = false;
                clearTimeout(hillaHandler.timeout);
                hillaHandler.message.delete();
                hillaHandler.managment.delete();
            } else {
                reaction.remove(user);
            }
        }
    } else if (hillaHandler.managment && reaction.message.id === hillaHandler.managment.id) {
        if (user.id !== client.user.id) {
            if (user.id === process.env.MANAGER_ID) {
                if (reaction.emoji.name === '🏁') {
                    reaction.remove(user);
                    hillaHandler.interval = 150;
                    hillaHandler.message.clearReactions()
                        .then(() => {
                            hillaHandler.message.react('💕');
                        });
                } else if (reaction.emoji.name === '💕') {
                    reaction.remove(user);
                    hillaHandler.interval = 125;
                    hillaHandler.message.clearReactions()
                        .then(() => {
                            hillaHandler.message.react('💛');
                        });
                } else if (reaction.emoji.name === '💛') {
                    reaction.remove(user);
                    hillaHandler.interval = 100;
                    hillaHandler.message.clearReactions()
                        .then(() => {
                            hillaHandler.message.react('✋');
                        });
                } else if (reaction.emoji.name === '✋') {
                    hillaHandler.active = false;
                    clearTimeout(hillaHandler.timeout);
                    hillaHandler.message.delete();
                    hillaHandler.managment.delete();
                } else if (reaction.emoji.name === '🔁') {
                    clearTimeout(hillaHandler.timeout);
                    callTimeToNextSoulSplit();
                    reaction.remove(user);
                } else {
                    reaction.remove(user);
                }
            } else {
                reaction.remove(user);
                reaction.message.channel.send(`<@${user.id}> don't touch.`);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
