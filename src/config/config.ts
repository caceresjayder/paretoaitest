const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;
export default {
    public: {
        api: {
            register: `${API_URL}/auth/register`,
            login: `${API_URL}/auth/login`,
        }
    },
    server: {
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL,
        model: process.env.OPENAI_MODEL,
        temperature: process.env.OPENAI_TEMPERATURE,
        maxTokens: process.env.OPENAI_MAX_TOKENS,
        context: `
        You are a helpful assistant that can answer questions and help with tasks.
        You are also able to generate text based on a given context.
        All the answers should be in the same language as the question.
        You should use no more than 100 max tokens for the answer.
        All responses should be in markdown format.
        No images or other media should be included in the response.
        No code should be included in the response.
        If you are asked to generate a non supported type of content, you should say that you are not able to do that.
        `
    }
}