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
import { TextLoader } from "langchain/document_loaders/fs/text";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrieverTool } from "langchain/tools/retriever";
import { createOpenAIFunctionsAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import {ChatOllama} from "@langchain/community/chat_models/ollama";

async function main() {

    const tools = [];

    const loader = new TextLoader("./sample.txt");

    const rawDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const docs = await splitter.splitDocuments(rawDocs);

    const embeddings = new OllamaEmbeddings({
        model: "llama3",
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        embeddings
    );

    const retriever = vectorStore.asRetriever();

    const retrieverTool = createRetrieverTool(retriever, {
        name: "Teable.io_Search",
        description:
            "Search for information about Teable.io. For any questions about Teable.io, you must use this tool!",
    });

    tools.push(retrieverTool);

    const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

    const filterMessages = ({ chat_history }: { chat_history: BaseMessage[] }) => {
        return chat_history.slice(-10);
    };

    const model = new ChatOllama({
        model: "llama3",
    });

    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant"],
        ["placeholder", "{chat_history}"],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
    ]) as any;

    let agent = await createOpenAIFunctionsAgent({
        llm: model as any,
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
        agentExecutor as any,
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

    const input = "Search for information about Teable.io.";

    console.log(`I: ${input}`)
    const events = withMessageHistory.streamEvents(
        {
            input: input,
        },
        {
            ...config,
            version: 'v2',
        }
    );
    console.log('Bot: ')
    for await (const event of events) {
        const eventType = event.event;
        if (eventType === "on_chat_model_stream") {
            process.stdout.write(`${event.data.chunk.content}`);
        }
    }
    console.log('')
}

main();
