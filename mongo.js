import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const client = new MongoClient(process.env.MONGO_CLIENT_URL);
await client.connect();

export let currentDB = 'tg-bot-shared';
let db = client.db(currentDB);

export const registerUser = async userId => {
    currentDB = `tg-bot-${userId}`;
    db = await client.db(currentDB);
}

export const goneToSharedDB = async () => {
    currentDB = 'tg-bot-shared';
    db = await client.db(currentDB);
}

export const addToDB = async (key, value) => {
    const inDB = await getFromDB(key);
    if (inDB === null) {
        await db.collection('words').insertOne({key: key, value: value});
        return "ok";
    } else {
        return "used";
    }
}

export const getFromDB = async key => {
    return await db.collection('words').findOne({key: key});
}

export const delFromDB = async key => {
    await db.collection('words').deleteOne({ key: key });
}