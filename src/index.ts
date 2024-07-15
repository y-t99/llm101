import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import * as process from "node:process";
import type { BaseMessage } from "@langchain/core/messages";
import {
    RunnablePassthrough,
    RunnableSequence,
} from "@langchain/core/runnables";
import * as crypto from 'crypto';
import * as co from 'co';
import * as cmdInput from 'co-prompt';

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

const filterMessages = ({ chat_history }: { chat_history: BaseMessage[] }) => {
    return chat_history.slice(-10);
};

const model = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0
}, {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are a helpful assistant who remembers all details the user shares with you.`,
    ],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
]);

const chain = RunnableSequence.from([
    RunnablePassthrough.assign({
        chat_history: filterMessages,
    }),
    prompt,
    model,
]);

const withMessageHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: async (sessionId) => {
        if (messageHistories[sessionId] === undefined) {
            messageHistories[sessionId] = new InMemoryChatMessageHistory();
        }
        return messageHistories[sessionId];
    },
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
});

const config = {
    configurable: {
        sessionId:
            `${crypto.randomBytes(8).toString('hex')}`,
    },
};



co(function *(){
    while(true) {
        const input = yield cmdInput('I: ');
        const output = yield withMessageHistory.invoke(
            {
                input: input,
            },
            config
        );
        console.log(`Bot: ${output.content}`);
    }
})