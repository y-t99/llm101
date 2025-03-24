import 'dotenv/config'
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export enum ProviderEnum {
  Volcengine = "volcengine",
}

export const getOpenAICompatibleProvider = (provider: ProviderEnum) => {
  switch (provider) {
    case ProviderEnum.Volcengine:
      return createOpenAICompatible({
        name: ProviderEnum.Volcengine,
        apiKey: process.env.VOLCENGINE_API_KEY,
        baseURL: process.env.VOLCENGINE_BASE_URL,
      })
    default:
      throw new Error(`Provider ${provider} not supported`);
  }
};

export enum ModelEnum {
  DeepSeek_Reasoner = "DeepSeek_Reasoner",
}

export const getModelId = (model: ModelEnum, provider: ProviderEnum) => {
  switch (model) {
    case ModelEnum.DeepSeek_Reasoner:
      if (provider === ProviderEnum.Volcengine && process.env.VOLCENGINE_DEEPSEEK_REASONER_MODEL_ID) {
        return process.env.VOLCENGINE_DEEPSEEK_REASONER_MODEL_ID;
      }
      throw new Error(`Model ${model} not supported for provider ${provider}`);
    default:
      throw new Error(`Model ${model} not supported`);
  }
};

export const getDeepSeekReasoner = () => {
  const provider = getOpenAICompatibleProvider(ProviderEnum.Volcengine);
  const modelId = getModelId(ModelEnum.DeepSeek_Reasoner, ProviderEnum.Volcengine);
  return provider(modelId);
}