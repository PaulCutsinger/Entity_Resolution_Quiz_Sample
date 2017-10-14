# Enitity_Resolution_Quiz_Sample
This sample shows how to use entity resolution in a simple quiz.

Let's say Alexa asks, "Who is credited with suggesting the word "hello" be used when answering the telephone?"

The user can answer with, "Thomas Edison" or similar phrases like "Edison" or "Menlo Park".

If they say Edison, your code will get "Edison" as what they said as well as "Thomas Edison" which is what that resolves to.

To make this skill,
Build the fact skill (https://github.com/alexa/skill-sample-nodejs-fact) and replace the index.js and in the skill builder use the code editor to paste the interaction model.
