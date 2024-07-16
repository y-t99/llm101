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
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrieverTool } from "langchain/tools/retriever";
import { createOpenAIFunctionsAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { LlamaCppEmbeddings } from "@langchain/community/embeddings/llama_cpp";

const llamaPath = "./llama-2-7b-chat.GGUF.q4_0.bin";

async function main() {

    const tools = [];

    const loader = new CheerioWebBaseLoader(
        "https://blog.teable.io/blog/data-reimagined-postgres-airtable-fusion"
    );

    const rawDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const docs = await splitter.splitDocuments(rawDocs);

    const embeddings = new LlamaCppEmbeddings({
        modelPath: llamaPath,
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        embeddings
    );

    const retriever = vectorStore.asRetriever();

    const retrieverTool = createRetrieverTool(retriever, {
        name: "agent",
        description:
            "Search for information about teable. For any questions about teable, you must use this tool!",
    });

    tools.push(retrieverTool);

    const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

    const filterMessages = ({ chat_history }: { chat_history: BaseMessage[] }) => {
        return chat_history.slice(-10);
    };

    const model = new ChatOpenAI({
        model: "gpt-3.5-turbo",
        temperature: 0
    }, {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL
    });

    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant"],
        ["placeholder", "{chat_history}"],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
    ]) as any;

    let agent = await createOpenAIFunctionsAgent({
        llm: model,
        tools,
        prompt: chatPrompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools,
    });

    const chain = RunnableSequence.from([
        RunnablePassthrough.assign({
            chat_history: filterMessages,
        }),
        agentExecutor as any
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

    const input = "what's Teable.io?"
    const output = await withMessageHistory.invoke(
        {
            input: input,
        },
        config
    );
    console.log(`Bot: ${JSON.stringify(output, null, 2)}`)
}

main();
