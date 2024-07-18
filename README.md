# chatbot

## LangChain

LangChain is a framework for developing applications powered by large language models (LLMs).

### Concept

1. Chains refer to sequences of calls - whether to an LLM, a tool, or a data preprocessing step.
2. LangChain Expression Language, or LCEL, is a declarative way to easily compose chains together.
3. Agents are systems that use an LLM as a reasoning enginer to determine which actions to take and what the inputs to those actions should be.The results of those actions can then be fed back into the agent and it determine whether more actions are needed, or whether it is okay to finish.
4. Retrieval Augmented Generation (RAG), is a technique for augmenting LLM knowledge with additional data.
5. Tools are interfaces that an agent, chain, or LLM can use to interact with the world.
6. Tool calling allows a model to respond to a given prompt by generating output that matches a user-defined schema. An exciting use case for LLMs is building natural language interfaces for other "tools", whether those are APIs, functions, databases, etc.

## Dev

### Env

Running Local LLMs

1. Installing Ollama
2. Running Llama 3: `ollama run llama3`

### Run

```shell
yarn run run

I: i'm Itou Ng.
Bot: Nice to meet you, Itou! How can I assist you today?
I: what's my name?
Bot: Your name is Itou.
```
