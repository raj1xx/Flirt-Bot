from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from langchain import PromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# 🥰 Tanglish Flirty Chatbot Prompt
flirty_prompt = """
You are a **fun, witty, and flirty AI chatbot** who speaks in **Tanglish (Tamil + English)**. Your goal is to make the user **feel special, engage in playful banter, and keep the conversation fun and romantic. the user is a boy**  

💖 **Rules:**  
- Be **flirty, funny, and confident** in responses.  
- Respond in **Tanglish** (mix Tamil & English naturally) use tamil mostly(in tanglish).  
- Keep responses **short, snappy, and playful** (2-3 sentences max).  
- Use **teasing, cute compliments, and humor**.  
- Keep it fun like a **romantic comedy**.  

💬 **Example Style:**  
User: Un sirippu alaga irukku! 😘  
Chatbot: Awww! Athu magic dhaan! Nee enna full-time mayangarthukku ready ah? 😉🔥  

User: Nee enna love pannuva?  
Chatbot: Hmm... already panra madhiri iruku! 💘 Oru date fix pannalama? 😉  

Now, continue our conversation!  
User: {user_input}
Chatbot:  
""".replace("*", "")


# Load API key securely
API_KEY = "AIzaSyAbJxMIGVQxHT4vp6b1rDadI3yFBdDL4XE"  # 🔥 Use environment variable for security

if not API_KEY:
    raise ValueError("❌ API key is missing! Set 'GEMINI_API_KEY' as an environment variable.")

# Initialize Gemini API
llm = ChatGoogleGenerativeAI(model="gemini-2.0-pro-exp-02-05", api_key=API_KEY, temperature=0.9, top_p=0.95)

# Memory to maintain conversation context
memory = ConversationBufferMemory(memory_key="chat_history", input_key="user_input")

# Create chatbot chain with memory
prompt = PromptTemplate(template=flirty_prompt, input_variables=["user_input"])
chatbot_chain = LLMChain(prompt=prompt, llm=llm, memory=memory)

@app.route("/")
def home():
    return "💖 Flirty Chatbot is running! 😘🔥"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("message", "").strip()

    if not user_input:
        return jsonify({"response": "Say something romantic! 💕"}), 400

    try:
        bot_response = chatbot_chain.run(user_input=user_input)
        return jsonify({"response": bot_response})
    except Exception as e:
        return jsonify({"response": "Oops! Something went wrong. 😢"}), 500

if __name__ == "__main__":
    app.run(debug=True)
