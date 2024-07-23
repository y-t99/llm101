import {RunnableWithMessageHistory} from "@langchain/core/runnables";
import {InMemoryChatMessageHistory} from "@langchain/core/chat_history";
import * as process from "node:process";
import {type BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
    RunnablePassthrough,
    RunnableSequence,
} from "@langchain/core/runnables";
import * as crypto from 'crypto';
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {TextLoader} from "langchain/document_loaders/fs/text";
import {MemoryVectorStore} from "langchain/vectorstores/memory";
import {createRetrieverTool} from "langchain/tools/retriever";
import {AgentExecutor} from "langchain/agents";
import {OllamaEmbeddings} from "@langchain/community/embeddings/ollama";
import { AgentAction, AgentFinish, AgentStep } from "@langchain/core/agents";
import { InputValues } from "@langchain/core/memory";
import { formatLogToString } from "langchain/agents/format_scratchpad/log";
import { PromptTemplate } from "@langchain/core/prompts";
import {ChatOllama} from "@langchain/community/chat_models/ollama";

/** Create the prefix prompt */
const PREFIX = `Answer the following questions as best you can. You have access to the following tools:
{tools}`;
/** Create the tool instructions prompt */
const TOOL_INSTRUCTIONS_TEMPLATE = `Use the following format in your response:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question`;
/** Create the suffix prompt */
const SUFFIX = `Begin!

Question: {input}
Thought:`;

/** Define the custom output parser */
function customOutputParser(message: BaseMessage): AgentAction | AgentFinish {
    const text = message.content;
    if (typeof text !== "string") {
        throw new Error(
            `Message content is not a string. Received: ${JSON.stringify(
                text,
                null,
                2
            )}`
        );
    }
    /** If the input includes "Final Answer" return as an instance of `AgentFinish` */
    if (text.includes("Final Answer:")) {
        const parts = text.split("Final Answer:");
        const input = parts[parts.length - 1].trim();
        const finalAnswers = { output: input };
        return { log: text, returnValues: finalAnswers };
    }
    /** Use RegEx to extract any actions and their values */
    const match = /Action: (.*)\nAction Input: (.*)/s.exec(text);
    if (!match) {
        throw new Error(`Could not parse LLM output: ${text}`);
    }
    /** Return as an instance of `AgentAction` */
    return {
        tool: match[1].trim(),
        toolInput: match[2].trim().replace(/^"+|"+$/g, ""),
        log: text,
    };
}

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
        name: "Teable_Search",
        description:
            "Search for information about Teable.io. For any questions about Teable.io, you must use this tool!",
    });

    tools.push(retrieverTool);

    const formatMessages = async (
        values: InputValues
    ): Promise<Array<BaseMessage>> => {
        /** Check input and intermediate steps are both inside values */
        if (!("input" in values) || !("intermediate_steps" in values)) {
            throw new Error("Missing input or agent_scratchpad from values.");
        }
        /** Extract and case the intermediateSteps from values as Array<AgentStep> or an empty array if none are passed */
        const intermediateSteps = values.intermediate_steps
            ? (values.intermediate_steps as Array<AgentStep>)
            : [];
        /** Call the helper `formatLogToString` which returns the steps as a string  */
        const agentScratchpad = formatLogToString(intermediateSteps);
        /** Construct the tool strings */
        const toolStrings = tools
            .map((tool) => `${tool.name}: ${tool.description}`)
            .join("\n");
        const toolNames = tools.map((tool) => tool.name).join(",\n");
        /** Create templates and format the instructions and suffix prompts */
        const prefixTemplate = new PromptTemplate({
            template: PREFIX,
            inputVariables: ["tools"],
        });
        const instructionsTemplate = new PromptTemplate({
            template: TOOL_INSTRUCTIONS_TEMPLATE,
            inputVariables: ["tool_names"],
        });
        const suffixTemplate = new PromptTemplate({
            template: SUFFIX,
            inputVariables: ["input"],
        });
        /** Format both templates by passing in the input variables */
        const formattedPrefix = await prefixTemplate.format({
            tools: toolStrings,
        });
        const formattedInstructions = await instructionsTemplate.format({
            tool_names: toolNames,
        });
        const formattedSuffix = await suffixTemplate.format({
            input: values.input,
        });
        /** Construct the final prompt string */
        const formatted = [
            formattedPrefix,
            formattedInstructions,
            formattedSuffix,
            agentScratchpad,
        ].join("\n");
        /** Return the message as a HumanMessage. */
        return [new HumanMessage(formatted)];
    }
    const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

    const filterMessages = ({chat_history}: { chat_history: BaseMessage[] }) => {
        return chat_history.slice(-10);
    };

    const model = new ChatOllama({
        model: "llama3",
    });

    const agent = RunnableSequence.from([
        {
            input: (values: InputValues) => values.input,
            intermediate_steps: (values: InputValues) => values.steps,
        },
        formatMessages,
        model as any,
        customOutputParser,
    ]);

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

    const inputs = [
        "Search for information about Teable.io.",
        "Teable.io is ?",
        "Tell me more about teable.io feature based on your last update"
    ];

    for (const input of inputs) {
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
}

main();
