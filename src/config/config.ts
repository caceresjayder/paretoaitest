const API_URL = process.env.NEXT_PUBLIC_API_URL;
const config = {
    public: {
        api: {
            register: `${API_URL}/auth/register`,
            login: `${API_URL}/auth/login`,
            chats: `${API_URL}/chats`,
            chat_messages: `${API_URL}/chats/:chatSlug`,
            messages: `${API_URL}/chats/:chatSlug/messages`,
        }
    },
    server: {
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
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
        If the user asks for a code, you should generate a code block with the code.
        If you are asked to generate a non supported type of content, you should say that you are not able to do that.
        `
    },
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    }
}

export default config;