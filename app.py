from flask import Flask, render_template, request, jsonify
import os
import openai
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# MongoDB connection setup
uri = os.environ.get("MONGODB_URI")
client = MongoClient(uri)
db = client['database1']

# Fetch data from MongoDB
def fetch_data_from_mongo(query):
    collections = ['computer_vision', 'hardware', 'modelling_building', 'power_systems', 'rf_systems']
    data = []
    seen_titles = set()

    for collection_name in collections:
        collection = db[collection_name]
        results = collection.find({"$text": {"$search": query}})

        for result in results:
            title = result.get('title')
            if title in seen_titles:
                continue
            data.append({
                'title': title,
                'description': result.get('description'),
                'details': result.get('details'),
                'url': result.get('url'),
                'images': result.get('images'),
                'videos': result.get('videos')
            })
            seen_titles.add(title)
    return data

# Create OpenAI response
def get_openai_response(prompt):
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        # Log the error and return a generic error message
        print(f"Error in get_openai_response: {e}")
        return "I'm sorry, but I'm currently unable to process your request."

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_query = request.json.get('message')
    if not user_query:
        return jsonify({'reply': 'Please provide a message.'}), 400

    # Fetch data from MongoDB
    mongo_results = fetch_data_from_mongo(user_query)

    # Prepare prompt for OpenAI
    if not mongo_results:
        prompt = f"User asked: {user_query}\nBut no relevant data was found in the knowledge base."
    else:
        prompt = f"User asked: {user_query}\n"
        prompt += "Here is some information from the knowledge base:\n\n"
        for item in mongo_results:
            prompt += f"Title: {item['title']}\n"
            prompt += f"Description: {item['description']}\n"
            prompt += f"URL: {item['url']}\n"
            if item.get('images'):
                prompt += f"Images: {', '.join(item['images'])}\n"
            if item.get('videos'):
                prompt += f"Videos: {', '.join(item['videos'])}\n"
            prompt += "\n"

    # Get response from OpenAI
    bot_reply = get_openai_response(prompt)

    # Append MongoDB information after the OpenAI response
    if mongo_results:
        bot_reply += "\n\n--- Related Information from the Knowledge Base ---\n"
        for item in mongo_results:
            bot_reply += f"Title: {item['title']}\n"
            #bot_reply += f"Description: {item['description']}\n"
            bot_reply += f"URL: {item['url']}\n\n"

    # Return the bot's reply as JSON
    return jsonify({'reply': bot_reply})

if __name__ == '__main__':
    app.run(debug=True)
