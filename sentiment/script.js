let sentiment;
let statusEl;
let submitBtn;
let inputBox;
let sentimentResult;

function setup() {
  noCanvas();
  // initialize sentiment
  sentiment = ml5.sentiment('movieReviews', modelReady);

  // setup the html environment

  submitBtn = createButton('submit');
  submitBtn.class("btn");
  sentimentResult = createP('Sentiment score:');

  // predicting the sentiment on mousePressed()
  submitBtn.mousePressed(getSentiment);
}

function getSentiment() {
  // get the values from the input
  const text = document.getElementById("input").value;

  // make the prediction
  const prediction = sentiment.predict(text);

  // display sentiment result on html page
  sentimentResult.html('Sentiment score: ' + prediction.score);
}

function modelReady() {
  // model is ready
  console.log("model loaded");
}
