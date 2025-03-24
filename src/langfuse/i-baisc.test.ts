import dotenv from "dotenv";
import { getDeepSeekReasoner } from "../util/openai-compatible-provider.util";
import { generateText } from "ai";
import { Langfuse } from "langfuse";
import { describe, it, expect, beforeAll } from "vitest";
import { v4 as uuidv4 } from "uuid";

describe("basic", () => {

  let langfuse: Langfuse;

  beforeAll(() => {
    dotenv.config();
    langfuse = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_API_BASE_URL,
    });
  });

  it("should be able to generate text", async () => {
    const model = getDeepSeekReasoner();

    const result = await generateText({
      model,
      prompt: "What is the capital of France?",
    });
    expect(result.response.modelId).toBe(process.env.VOLCENGINE_DEEPSEEK_REASONER_MODEL_ID);
  }, 100000);

  it("should be able to log and analyze the execution of a generation", async () => {
    const trace = langfuse.trace({
      name: 'basic-test',
      id: uuidv4(),
      userId: 'vitest',
      metadata: { model_id: process.env.VOLCENGINE_DEEPSEEK_REASONER_MODEL_ID},
      tags: ['unit-test'],
    });
    const generateResult = {
      "text": "\n\nThe capital of France is **Paris**. Known for its cultural landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral, Paris has been the political and cultural heart of France for centuries. It is situated in the northern part of the country, along the Seine River.",
      "files": [],
      "reasoning": "Okay, the user is asking, \"What is the capital of France?\" Let me think about how to approach this. First, I need to recall the correct answer. I know that France is a country in Europe, and its capital is a well-known city. Wait, is it Paris? Yes, that's right. Paris is famous for landmarks like the Eiffel Tower and the Louvre Museum. But wait, maybe I should double-check to make sure I'm not mixing it up with another country. Sometimes people confuse capitals, like how some might think Sydney is the capital of Australia, but it's actually Canberra.\n\nLet me confirm. France's capital has been Paris for a long time. There's no recent change in that, right? I don't remember any news about France changing their capital. Also, in history, Paris has always been the center of political power in France. The government, the president's residence, and major institutions are located there. So yes, Paris is definitely the capital. I should also mention a bit more to provide context, like its location along the Seine River and maybe some cultural significance. That way, the answer is informative and helpful.\n",
      "reasoningDetails": [
        {
          "type": "text",
          "text": "Okay, the user is asking, \"What is the capital of France?\" Let me think about how to approach this. First, I need to recall the correct answer. I know that France is a country in Europe, and its capital is a well-known city. Wait, is it Paris? Yes, that's right. Paris is famous for landmarks like the Eiffel Tower and the Louvre Museum. But wait, maybe I should double-check to make sure I'm not mixing it up with another country. Sometimes people confuse capitals, like how some might think Sydney is the capital of Australia, but it's actually Canberra.\n\nLet me confirm. France's capital has been Paris for a long time. There's no recent change in that, right? I don't remember any news about France changing their capital. Also, in history, Paris has always been the center of political power in France. The government, the president's residence, and major institutions are located there. So yes, Paris is definitely the capital. I should also mention a bit more to provide context, like its location along the Seine River and maybe some cultural significance. That way, the answer is informative and helpful.\n"
        }
      ],
      "toolCalls": [],
      "toolResults": [],
      "finishReason": "stop",
      "usage": {
        "promptTokens": 12,
        "completionTokens": 299,
        "totalTokens": 311
      },
      "warnings": [],
      "request": {
        "body": "{\"model\":\"deepseek-r1-250120\",\"temperature\":0,\"messages\":[{\"role\":\"user\",\"content\":\"What is the capital of France?\"}]}"
      },
      "response": {
        "id": "0217428319286510a5d9f34e21d7d2bd90e08865e68380774e793",
        "timestamp": "2025-03-24T15:58:57.000Z",
        "modelId": "deepseek-r1-250120",
        "headers": {
          "content-length": "1873",
          "content-type": "application/json; charset=utf-8",
          "date": "Mon, 24 Mar 2025 15:58:57 GMT",
          "server": "istio-envoy",
          "x-client-request-id": "unknown-20250324235848-MIorXAFO",
          "x-envoy-upstream-service-time": "8753",
          "x-request-id": "0217428319286510a5d9f34e21d7d2bd90e08865e68380774e793"
        },
        "body": {
          "choices": [
            {
              "finish_reason": "stop",
              "index": 0,
              "logprobs": null,
              "message": {
                "content": "\n\nThe capital of France is **Paris**. Known for its cultural landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral, Paris has been the political and cultural heart of France for centuries. It is situated in the northern part of the country, along the Seine River.",
                "reasoning_content": "Okay, the user is asking, \"What is the capital of France?\" Let me think about how to approach this. First, I need to recall the correct answer. I know that France is a country in Europe, and its capital is a well-known city. Wait, is it Paris? Yes, that's right. Paris is famous for landmarks like the Eiffel Tower and the Louvre Museum. But wait, maybe I should double-check to make sure I'm not mixing it up with another country. Sometimes people confuse capitals, like how some might think Sydney is the capital of Australia, but it's actually Canberra.\n\nLet me confirm. France's capital has been Paris for a long time. There's no recent change in that, right? I don't remember any news about France changing their capital. Also, in history, Paris has always been the center of political power in France. The government, the president's residence, and major institutions are located there. So yes, Paris is definitely the capital. I should also mention a bit more to provide context, like its location along the Seine River and maybe some cultural significance. That way, the answer is informative and helpful.\n",
                "role": "assistant"
              }
            }
          ],
          "created": 1742831937,
          "id": "0217428319286510a5d9f34e21d7d2bd90e08865e68380774e793",
          "model": "deepseek-r1-250120",
          "service_tier": "default",
          "object": "chat.completion",
          "usage": {
            "completion_tokens": 299,
            "prompt_tokens": 12,
            "total_tokens": 311,
            "prompt_tokens_details": {
              "cached_tokens": 0
            },
            "completion_tokens_details": {
              "reasoning_tokens": 238
            }
          }
        },
        "messages": [
          {
            "role": "assistant",
            "content": [
              {
                "type": "reasoning",
                "text": "Okay, the user is asking, \"What is the capital of France?\" Let me think about how to approach this. First, I need to recall the correct answer. I know that France is a country in Europe, and its capital is a well-known city. Wait, is it Paris? Yes, that's right. Paris is famous for landmarks like the Eiffel Tower and the Louvre Museum. But wait, maybe I should double-check to make sure I'm not mixing it up with another country. Sometimes people confuse capitals, like how some might think Sydney is the capital of Australia, but it's actually Canberra.\n\nLet me confirm. France's capital has been Paris for a long time. There's no recent change in that, right? I don't remember any news about France changing their capital. Also, in history, Paris has always been the center of political power in France. The government, the president's residence, and major institutions are located there. So yes, Paris is definitely the capital. I should also mention a bit more to provide context, like its location along the Seine River and maybe some cultural significance. That way, the answer is informative and helpful.\n"
              },
              {
                "type": "text",
                "text": "\n\nThe capital of France is **Paris**. Known for its cultural landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral, Paris has been the political and cultural heart of France for centuries. It is situated in the northern part of the country, along the Seine River."
              }
            ],
            "id": "msg-maOEhlZXyDr439VdiPCbyflp"
          }
        ]
      },
      "steps": [
        {
          "stepType": "initial",
          "text": "\n\nThe capital of France is **Paris**. Known for its cultural landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral, Paris has been the political and cultural heart of France for centuries. It is situated in the northern part of the country, along the Seine River.",
          "reasoning": "Okay, the user is asking, \"What is the capital of France?\" Let me think about how to approach this. First, I need to recall the correct answer. I know that France is a country in Europe, and its capital is a well-known city. Wait, is it Paris? Yes, that's right. Paris is famous for landmarks like the Eiffel Tower and the Louvre Museum. But wait, maybe I should double-check to make sure I'm not mixing it up with another country. Sometimes people confuse capitals, like how some might think Sydney is the capital of Australia, but it's actually Canberra.\n\nLet me confirm. France's capital has been Paris for a long time. There's no recent change in that, right? I don't remember any news about France changing their capital. Also, in history, Paris has always been the center of political power in France. The government, the president's residence, and major institutions are located there. So yes, Paris is definitely the capital. I should also mention a bit more to provide context, like its location along the Seine River and maybe some cultural significance. That way, the answer is informative and helpful.\n",
          "reasoningDetails": [
            {
              "type": "text",
              "text": "Okay, the user is asking, \"What is the capital of France?\" Let me think about how to approach this. First, I need to recall the correct answer. I know that France is a country in Europe, and its capital is a well-known city. Wait, is it Paris? Yes, that's right. Paris is famous for landmarks like the Eiffel Tower and the Louvre Museum. But wait, maybe I should double-check to make sure I'm not mixing it up with another country. Sometimes people confuse capitals, like how some might think Sydney is the capital of Australia, but it's actually Canberra.\n\nLet me confirm. France's capital has been Paris for a long time. There's no recent change in that, right? I don't remember any news about France changing their capital. Also, in history, Paris has always been the center of political power in France. The government, the president's residence, and major institutions are located there. So yes, Paris is definitely the capital. I should also mention a bit more to provide context, like its location along the Seine River and maybe some cultural significance. That way, the answer is informative and helpful.\n"
            }
          ],
          "files": [],
          "sources": [],
          "toolCalls": [],
          "toolResults": [],
          "finishReason": "stop",
          "usage": {
            "promptTokens": 12,
            "completionTokens": 299,
            "totalTokens": 311
          },
          "warnings": [],
          "request": {
            "body": "{\"model\":\"deepseek-r1-250120\",\"temperature\":0,\"messages\":[{\"role\":\"user\",\"content\":\"What is the capital of France?\"}]}"
          },
          "response": {
            "id": "0217428319286510a5d9f34e21d7d2bd90e08865e68380774e793",
            "timestamp": "2025-03-24T15:58:57.000Z",
            "modelId": "deepseek-r1-250120",
            "headers": {
              "content-length": "1873",
              "content-type": "application/json; charset=utf-8",
              "date": "Mon, 24 Mar 2025 15:58:57 GMT",
              "server": "istio-envoy",
              "x-client-request-id": "unknown-20250324235848-MIorXAFO",
              "x-envoy-upstream-service-time": "8753",
              "x-request-id": "0217428319286510a5d9f34e21d7d2bd90e08865e68380774e793"
            },
            "body": {
              "choices": [
                {
                  "finish_reason": "stop",
                  "index": 0,
                  "logprobs": null,
                  "message": {
                    "content": "\n\nThe capital of France is **Paris**. Known for its cultural landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral, Paris has been the political and cultural heart of France for centuries. It is situated in the northern part of the country, along the Seine River.",
                    "reasoning_content": "Okay, the user is asking, \"What is the capital of France?\" Let me think about how to approach this. First, I need to recall the correct answer. I know that France is a country in Europe, and its capital is a well-known city. Wait, is it Paris? Yes, that's right. Paris is famous for landmarks like the Eiffel Tower and the Louvre Museum. But wait, maybe I should double-check to make sure I'm not mixing it up with another country. Sometimes people confuse capitals, like how some might think Sydney is the capital of Australia, but it's actually Canberra.\n\nLet me confirm. France's capital has been Paris for a long time. There's no recent change in that, right? I don't remember any news about France changing their capital. Also, in history, Paris has always been the center of political power in France. The government, the president's residence, and major institutions are located there. So yes, Paris is definitely the capital. I should also mention a bit more to provide context, like its location along the Seine River and maybe some cultural significance. That way, the answer is informative and helpful.\n",
                    "role": "assistant"
                  }
                }
              ],
              "created": 1742831937,
              "id": "0217428319286510a5d9f34e21d7d2bd90e08865e68380774e793",
              "model": "deepseek-r1-250120",
              "service_tier": "default",
              "object": "chat.completion",
              "usage": {
                "completion_tokens": 299,
                "prompt_tokens": 12,
                "total_tokens": 311,
                "prompt_tokens_details": {
                  "cached_tokens": 0
                },
                "completion_tokens_details": {
                  "reasoning_tokens": 238
                }
              }
            },
            "messages": [
              {
                "role": "assistant",
                "content": [
                  {
                    "type": "reasoning",
                    "text": "Okay, the user is asking, \"What is the capital of France?\" Let me think about how to approach this. First, I need to recall the correct answer. I know that France is a country in Europe, and its capital is a well-known city. Wait, is it Paris? Yes, that's right. Paris is famous for landmarks like the Eiffel Tower and the Louvre Museum. But wait, maybe I should double-check to make sure I'm not mixing it up with another country. Sometimes people confuse capitals, like how some might think Sydney is the capital of Australia, but it's actually Canberra.\n\nLet me confirm. France's capital has been Paris for a long time. There's no recent change in that, right? I don't remember any news about France changing their capital. Also, in history, Paris has always been the center of political power in France. The government, the president's residence, and major institutions are located there. So yes, Paris is definitely the capital. I should also mention a bit more to provide context, like its location along the Seine River and maybe some cultural significance. That way, the answer is informative and helpful.\n"
                  },
                  {
                    "type": "text",
                    "text": "\n\nThe capital of France is **Paris**. Known for its cultural landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral, Paris has been the political and cultural heart of France for centuries. It is situated in the northern part of the country, along the Seine River."
                  }
                ],
                "id": "msg-maOEhlZXyDr439VdiPCbyflp"
              }
            ]
          },
          "isContinued": false
        }
      ],
      "sources": []
    }
    const generation = trace.generation({
      ...JSON.parse(generateResult.request.body),
    })
    await new Promise(resolve => setTimeout(resolve, 2000));
    generation.end({
      output: generateResult.response.body,
    });
    expect(trace.id).toBeDefined();
  }, 100000);
});
