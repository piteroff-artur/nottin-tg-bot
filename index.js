import {Telegraf} from "telegraf";
import {addToDB, delFromDB, getFromDB, registerUser, currentDB, goneToSharedDB} from "./mongo.js";
import dotenv from 'dotenv';

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.telegram.setMyCommands([
    { command: '/start', description: 'Run the bot' },
    { command: '/help', description: 'Get help' },
    { command: '/what_db', description: 'Get DB you using now' },
    { command: '/use_shared_db', description: 'Use shared DB' },
    { command: '/use_person_db', description: 'Use person DB' },
    { command: '/save', description: 'Save data on db' },
    { command: '/get', description: 'Get data from DB' },
    { command: '/del', description: 'Remove data from DB' }
]).then(() => console.log('Created commands'));

bot.start(async ctx => {
    ctx.reply(`Hello! This is a Nottin. Your DB: ${currentDB}`)
        .then(() => console.log(`User ${ctx.message.from.username} starts`));
});

bot.help(async ctx => {
    ctx.reply('Nottin - easy notes bot. You can use personal (private) db, or shared (public) db. See commands in menu.')
});

bot.command('save', async ctx => {
    const key = await ctx.message.text.split(' ')[1];
    const value = await ctx.message.text.split(' ')[2];
    const result = await addToDB(key, value);
    if (result === "ok") {
        console.log("Wrote to DB");
        ctx.reply(`Saved: \n${key}: ${value}`)
            .then(() => console.log(`User ${ctx.message.from.username} saves data - ${key}: ${value}`));
    } else if (result === "used") {
        console.log(`Error: "${key}" is used`);
        ctx.reply(`Error: "${key}" is used`)
            .then(() => console.log(`User try to ${ctx.message.from.username} saves data - ${key}: ${value}`));
    }
});

bot.command('get', async ctx => {
    const key = await ctx.message.text.split(' ')[1];
    const res = await getFromDB(key);
    ctx.reply(`${key}: ${res?.value ?? "not found"}`)
        .then(() => console.log(`User ${ctx.message.from.username} gets data - ${key}: ${res?.value ?? "not found"}`));
});

bot.command('del', async ctx => {
    const key = await ctx.message.text.split(' ')[1];
    await delFromDB(key);
    ctx.reply(`${key} deleted from DB.`)
        .then(() => console.log(`User ${ctx.message.from.username} deletes - ${key}`));
});

bot.command('what_db', async ctx => {
    ctx.reply(`DB: ${currentDB}`)
        .then(() => console.log(`User ${ctx.message.from.username} asked what db they use (${currentDB})`));
});

bot.command('use_shared_db', async ctx => {
    await goneToSharedDB();
    ctx.reply(`Set to DB: ${currentDB}`)
        .then(() => console.log(`User ${ctx.message.from.username} now uses shared DB`));
});

bot.command('use_person_db', async ctx => {
    await registerUser(ctx.message.from.id);
    ctx.reply(`Set to DB: ${currentDB}`)
        .then(() => console.log(`User ${ctx.message.from.username} now uses personal DB (${currentDB})`));
});

bot.launch()
    .then(() => console.log("Bot started"))
    .catch(err => console.log(err));