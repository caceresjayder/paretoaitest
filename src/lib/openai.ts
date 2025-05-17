import OpenAI from "openai";
import config from "@/config/config";
import { ResponsesModel } from "openai/resources/shared.mjs";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
    apiKey: config.openai.apiKey,
});

export async function OpenAIResponse(instructions: string, history:  ChatCompletionMessageParam[],question: string) {
    const response = await openai.chat.completions.create({
        model: config.openai.model as ResponsesModel,
        temperature: config.openai.temperature ? parseInt(config.openai.temperature) : 0.5,
        messages: [{ role: 'system', content: instructions }, ...history, { role: 'user', content: question }],
    });

    return response.choices[0].message.content;
}



export default openai;