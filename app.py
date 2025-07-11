from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)

# --- DATA: All questions and topics are stored here ---
topics_data = [
    {
        "title": "1. Your Neighborhood",
        "questions": [
            "Do you currently live in an apartment or a house? How long have you lived there?",
            "Do you live in an environment where it is easy to get along with your neighbors?",
            """Which of the following do you think should be improved to make your neighborhood a more convenient place to live?
    - Public transportation
    - Restaurants
    - Shopping venue"""
        ]
    },
    {
        "title": "2. Giving and Receiving Gifts",
        "questions": [
            "When was the last time you bought a gift for someone? Who was it for?",
            "Of all the gifts you've received, which one is the most memorable to you? Why?",
            """Which of the following do you consider most important when choosing a gift for someone?
    - Purpose
    - Creativity
    - Usefulness"""
        ]
    },
    {
        "title": "3. Purchasing Toys for Children",
        "questions": [
            "When was the last time you bought a children's toy? What did you buy?",
            "Where do people usually go to buy toys for children in your area?",
            """What do you think is the most important consideration when buying toys for children?
    - Educational value
    - Age appropriateness
    - Safety""",
            "Bonus Question: In your opinion, should toys for kids be educational or entertaining? Why?"
        ]
    },
    {
        "title": "4. Weather Preferences",
        "questions": [
            "Between TV and smartphone, which do you prefer for getting weather updates?",
            "On a rainy day, do you prefer to use an umbrella or wear a raincoat?",
            """While traveling, which of the following is most important for you to fully enjoy your experience?
    - Nice weather that allows you to enjoy activities as scheduled
    - A tour guide who can adjust the itinerary based on weather changes"""
        ]
    },
    {
        "title": "5. Clothes Shopping / Clothing",
        "questions": [
            "How often do you go shopping for clothes?",
            "Who do you usually go shopping with? Why do you like shopping with that person?",
            """Which of the following do you consider most when choosing clothes to buy?
    - Fit & Size
    - Comfort
    - Quality"""
        ]
    },
    {
        "title": "6. Flight Experiences",
        "questions": [
            "Have you ever traveled by plane? Where did you go on your most recent flight?",
            "What kind of transportation do you use to get to the airport for your flight?",
            """What is the most important factor you consider when choosing a flight?
    - In-flight dining options
    - Flight time
    - Friendly service"""
        ]
    },
    {
        "title": "7. Books",
        "questions": [
            "Which bookstore is nearest to your house? What do you usually buy there?",
            "What are some advantages of receiving a book as a gift?",
            """What types of books would make a good gift for someone?
    - Cookbooks
    - Novels
    - Essays"""
        ]
    },
    {
        "title": "8. Bakery Products",
        "questions": [
            "Do you enjoy eating desserts after every meal?",
            "Are there any bakeries near your home? Which one do you visit most often?",
            "Would you prefer to bake bread for friends visiting your house or buy it from a bakery? Why?"
        ]
    },
    {
        "title": "9. Mobile Apps",
        "questions": [
            "When did you most recently use a mobile app, and what did you use it for?",
            "Which app do you find most helpful on your mobile device?",
            """What kinds of apps do you use the most?
    - Gaming Apps
    - Social Media Apps
    - Online Shopping Apps"""
        ]
    },
    {
        "title": "10. Travel & Transportation",
        "questions": [
            "Do you prefer to drive to your travel destination or take a bus to get there?",
            """Which of the following activities would you enjoy the most while traveling?
    - Sightseeing
    - Outdoor activities
    - Eating local food""",
            "What is one thing you always do to prepare before a trip?"
        ]
    },
    {
        "title": "11. Making Donations",
        "questions": [
            "Do you think it's a good idea to use celebrities as spokespeople for charities or organizations to talk about making donations?",
            "Would you consider making donations online instead of giving the money in person?",
            "Do you think it's a good idea to give a small gift to people who donate?"
        ]
    },
    {
        "title": "12. Cooking",
        "questions": [
            "When was the last time you cooked? What dish did you make, and how long did it take to prepare?",
            "What are your thoughts on using video tutorials to learn how to cook new dishes?",
            """Which of the following types of dishes are you most interested in cooking?
    - Desserts
    - Seafood
    - Vegetarian dishes"""
        ]
    },
    {
        "title": "13. Convenience Stores",
        "questions": [
            "How often do you go to a convenience store? What do you usually buy at a convenience store?",
            "When was the last time you purchased something at a convenience store?",
            """What would be the major reason for you to choose a convenience store to buy something?
    - Location
    - Product choices
    - Special offers"""
        ]
    },
    {
        "title": "14. Your Best Friend",
        "questions": [
            "Who is your best friend? How did you two meet?",
            "Do you see your best friend more often than you did five years ago?",
            """What is one quality your best friend has that you truly admire?
    - Shared interests or values
    - Supportiveness
    - Sense of humor"""
        ]
    },
    {
        "title": "15. Furniture",
        "questions": [
            "When was the last time you bought furniture? What did you buy?",
            "Where do you usually purchase your furniture?",
            "Do you think giving furniture as a gift is a good idea? Why or why not?"
        ]
    },
    {
        "title": "16. Free-time Activities",
        "questions": [
            "Do you usually have free time in the morning or the afternoon?",
            "Do you still enjoy the same free-time activities as you did five years ago?",
            "If you were to spend your free time with friends, would you prefer to spend time with just one friend or several friends? Why?"
        ]
    },
    {
        "title": "17. News",
        "questions": [
            "Do you read news every day? Why?",
            "Do you prefer to read news in the morning or in the evening?",
            """What is the most important factor that you consider when choosing a news outlet for information?
    - Reliability of the information
    - Frequency of updates
    - Quality of the information"""
        ]
    },
    {
        "title": "18. Technology in Daily Life",
        "questions": [
            "Do you think it is important for older people to learn how to use new technologies?",
            "What kind of technology do you use on a daily basis?",
            "What are some of the advantages of using technology in daily life?"
        ]
    },
    {
        "title": "19. Public Speaking",
        "questions": [
            "What kind of public speaking experience have you had?",
            "What do you think are the challenges of public speaking?",
            """Which of the following do you think is most important for a good public speaker?
    - A strong, clear voice
    - Confidence
    - Good sense of humor"""
        ]
    },
    {
        "title": "20. Learning a New Skill",
        "questions": [
            "Is there a skill you are interested in learning?",
            "What are some of the benefits of learning new skills?",
            "What are some of the challenges of learning new skills?"
        ]
    }
]

@app.route('/')
def index():
    return render_template('index.html', topics=topics_data)

@app.route('/api/topics')
def get_topics():
    return jsonify(topics_data)

@app.route('/api/topic/<int:topic_index>')
def get_topic(topic_index):
    if 0 <= topic_index < len(topics_data):
        return jsonify(topics_data[topic_index])
    return jsonify({"error": "Topic not found"}), 404

if __name__ == '__main__':
    # Use environment variable for port (for deployment)
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port) 