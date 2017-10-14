'use strict';
var Alexa = require("alexa-sdk");

// For detailed tutorial on how to making a Alexa skill,
// please visit us at http://alexa.design/build


exports.handler = function(event, context) {
    console.log("====================");
    console.log("REQUEST: "+JSON.stringify(event));
    console.log("====================");
    var alexa = Alexa.handler(event, context);
    // alexa.dynamoDBTableName = 'petMatchTable';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const MODE = (process.env.mode !== undefined && process.env.mode !== '') ? process.env.mode : 'test' ;

var questions = [
  {'answer':'Thomas Edison', 'question':'Who is credited with suggesting the word "hello" be used when answering the telephone?', 'synonyms':["Edison","Menlo Park"]},
  {'answer':'North America','question':'The Passenger Pigeon, now extinct, was endemic to which continent?', 'synonyms':["Northern America", "Canada", "Mexico", "America"]},
  {'answer':'Auguste Rodin','question':'Which artist created the sculpture "The Thinker"?', 'synonyms':["Rodin","Auguste", "august", "august rodin"]},
  {'answer':'The Canary Islands','question':'What is the name of the Spanish islands that lie off the Northwest coast of Africa?', 'synonyms':["Canary Islands","Canary Island", "the Canaries"]}
];

function nextQuestion (preface){
  //get a question
  let data = randomPhrase(questions);
  this.attributes["currentQuestion"]=data.index;

  //ask the question
  this.response.speak(preface + data.text.question);
  this.response.listen("Here's your question again "+data.text.question);
  this.emit(':responseReady');

}

function checkAnswer(givenAnswer) {
  if(this.attributes.currentQuestion) {
    let correctAnswer = questions[this.attributes.currentQuestion].answer;
    if(correctAnswer.toUpperCase()==givenAnswer.toUpperCase()){
      //correct
      nextQuestion.call(this, getSpeechCon(true)+" you got it "+givenAnswer+" was right. "+ " here's another, ");
    }else{
      //incorrect
      nextQuestion.call(this, getSpeechCon(false)+" the answer was "+correctAnswer+ " let's try again, ");
    }

  }else{
    //no currentQuestion
    nextQuestion.call(this,"Here's a new question ");
  }

}

var handlers = {
    'LaunchRequest': function () {
        //ask a new question
        nextQuestion.call(this,"Welcome, ");
    },
    'AnswerIntent': function () {
        //get the Answer
        let slotValues=getSlotValues(this.event.request.intent.slots);

        //check the Answer
        //where answer is my slot name
        //what synonym the person said - slotValues.answer.synonym
        //what that resolved to - slotValues.answer.resolved
        checkAnswer.call(this, slotValues.answer.resolved);

        //report the results and ask a new quesiton
    },
    'NewGameIntent':function(){
      this.emit('LaunchRequest');
    },

    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: let's play a game");
        this.response.listen("You can try: let's play a game");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.emit('AMAZON.HelpIntent');
    }
};



// Helper functions
function getSpeechCon(type)
{
    var speechCon = "";
    if (type) return "<say-as interpret-as='interjection'>" + speechConsCorrect[getRandom(0, speechConsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + speechConsWrong[getRandom(0, speechConsWrong.length-1)] + " </say-as><break strength='strong'/>";
}

function getRandom(min, max)
{
    return Math.floor(Math.random() * (max-min+1)+min);
}
//This is a list of positive speechcons that this skill will use when a user gets a correct answer.  For a full list of supported
//speechcons, go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
var speechConsCorrect = ["Booya", "All righty", "Bam", "Bazinga", "Bingo", "Boom", "Bravo", "Cha Ching", "Cheers", "Dynomite",
"Hip hip hooray", "Hurrah", "Hurray", "Huzzah", "Oh dear.  Just kidding.  Hurray", "Kaboom", "Kaching", "Oh snap", "Phew",
"Righto", "Way to go", "Well done", "Whee", "Woo hoo", "Yay", "Wowza", "Yowsa"];

//This is a list of negative speechcons that this skill will use when a user gets an incorrect answer.  For a full list of supported
//speechcons, go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
var speechConsWrong = ["Argh", "Aw man", "Blarg", "Blast", "Boo", "Bummer", "Darn", "D'oh", "Dun dun dun", "Eek", "Honk", "Le sigh",
"Mamma mia", "Oh boy", "Oh dear", "Oof", "Ouch", "Ruh roh", "Shucks", "Uh oh", "Wah wah", "Whoops a daisy", "Yikes"];



function getSlotValues (filledSlots) {
    //given event.request.intent.slots, a slots values object so you have
    //what synonym the person said - .synonym
    //what that resolved to - .resolved
    //and if it's a word that is in your slot values - .isValidated
    let slotValues = {};

    console.log(JSON.stringify(filledSlots));

    Object.keys(filledSlots).forEach(function(item) {
        //console.log("item in filledSlots: "+JSON.stringify(filledSlots[item]));
        var name=filledSlots[item].name;
        //console.log("name: "+name);
        if(filledSlots[item]&&
           filledSlots[item].resolutions &&
           filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
           filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
           filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code ) {

            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case "ER_SUCCESS_MATCH":
                    slotValues[name] = {
                        "synonym": filledSlots[item].value,
                        "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        "isValidated": filledSlots[item].value == filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name
                    };
                    break;
                case "ER_SUCCESS_NO_MATCH":
                    slotValues[name] = {
                        "synonym":filledSlots[item].value,
                        "resolved":filledSlots[item].value,
                        "isValidated":false
                    };
                    break;
                }
            } else {
                slotValues[name] = {
                    "synonym": filledSlots[item].value,
                    "resolved":filledSlots[item].value,
                    "isValidated": false
                };
            }
        },this);
        //console.log("slot values: "+JSON.stringify(slotValues));
        return slotValues;
}


function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return({'text':array[i],'index':i}); // If you like one liners this will also do: return(array[Math.floor(Math.random() * array.length)]);
}
