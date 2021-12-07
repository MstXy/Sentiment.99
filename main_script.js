 let capture;
let padding = 50;
let videoWidth = 320;
let videoHeight = 240;
let VIDEO_FLAG = true;

// Options for the SpeechCommands18w model, the default probabilityThreshold is 0
const options = { probabilityThreshold: 0.7 };
let soundClassifier;
let sentiment;
var encoder;

var currentDataset;
var questionIdx = 1;
var answer;
let sentenceIdxLog = [];
let answerLog = [];
let tensorLog = [];
var prevent;
var end;

var sentenceIdx;
let sentenceText;
let sentenceSentimentTitle;
let sentenceSentiment;
let useResult;



var timer = 11;

var r,s,t,u;
var myp5_1, myp5_2, myp5_3, myp5_4;

function preload() {
  // Load SpeechCommands18w sound classifier model
  soundClassifier = ml5.soundClassifier('SpeechCommands18w', options);
  sentiment = ml5.sentiment('movieReviews');
}
function setup() {
  soundClassifierReady();
  currentDataset = shortcm;
  prevent = false;
}

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// question container
var r = function( p ) { // p could be any variable name
  p.setup = function() {
    // p.createCanvas(videoWidth,videoHeight);
    p.frameRate(50);
    // @@@@@@@@@@@@
    // get to the end button for testing
    // var nextButton = p.createButton("end");
    // nextButton.mousePressed(showEnd);
    // @@@@@@@@@@@@@@@@@@@
    p.question = p.createP("Is it Ethical or Not?");
      p.question.id("question");
    p.timerDigit = p.createP();
      p.timerDigit.id("timerDigit");

    setTimeout(function () {
      p.question.style("display", "block");
      p.timerDigit.style("display", "block");
    }, 1000);
  };

  p.draw = function() {
    // background(255);

    if (p.frameCount % 50 == 0 && timer >= 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
      timer --;
    }

    if (timer <= 10 && timer >= 0) {
      p.timerDigit.html(timer);
    }

    if (timer < 0) {
      // this question fails to answer (out of time)
      // update logs
      console.log("time's out");
      answerLog.push(null);
      tensorLog.push(useResult);
      sentenceIdxLog.push(sentenceIdx);
      showNext();
    }
  };


};
// var myp5 = new p5(s, 'question-container');

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// video container
var s = function( p ) { // p could be any variable name
  p.setup = function() {
    if (VIDEO_FLAG) {
      p.padding = 10;
      p.createCanvas(videoWidth+2*p.padding,videoHeight+2*p.padding);
      capture = p.createCapture(p.VIDEO);
      capture.size(videoWidth, videoHeight);
      capture.hide();
    }
  };

  p.draw = function() {
    // background(255);
    if (VIDEO_FLAG) {
      // frame
      p.noStroke();
      p.fill("#ffb31c");
      p.rect(0,0, p.width, p.height);
      p.push();
        //move image by the width of image to the left
        p.translate(videoWidth+2*p.padding, 0);
        //then scale it by -1 in the x-axis
        //to flip the image
        p.scale(-1, 1);
        //draw video capture feed as image inside p5 canvas
        p.image(capture, p.padding, p.padding, videoWidth, videoHeight);
        // p.filter(p.GRAY);
      p.pop();
    }
  };
};
// var myp5 = new p5(s, 'video-container');


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// text container
var t = function( p ) { // p could be any variable name
  p.setup = function() {
    sentenceIdx = Math.floor(p.random(0, currentDataset.length));
    sentenceText = p.createP(currentDataset[sentenceIdx].input);
      sentenceText.id("sentenceText");
    sentenceSentimentTitle = p.createP("Text Sentiment:");
      sentenceSentimentTitle.id("sentenceSentimentTitle");
    sentenceSentiment = p.createP(currentDataset[sentenceIdx].sentiment);
      sentenceSentiment.id("sentenceSentiment");
  };

  p.draw = function() {
    // background(255);

  };

  p.showText = function() {
    sentenceIdx = Math.floor(p.random(0, currentDataset.length));
    sentenceText.html(currentDataset[sentenceIdx].input);
    if (questionIdx >= 14) {
      sentenceText.style("font-size", "16pt");
    }
    sentenceSentiment.html(currentDataset[sentenceIdx].sentiment);
  }

};
// var myp5 = new p5(t, 'text-container');


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// tensor container
var u = function( p ) { // p could be any variable name
  let width;
  p.setup = function() {
    var canvasDiv = document.getElementById('tensor-container');
    width = canvasDiv.offsetWidth;
    p.createCanvas(width,width/2);
    p.colorMode(HSB);
    // // Load the model.
    // use.load().then(model => {
    //   encoder = model;
    //   // Embed an array of sentences.
    //   const sentences = [
    //     shortcm[sentenceIdx].input
    //   ];
    //   model.embed(sentences).then(embeddings => {
    //     useResult = embeddings.dataSync();
    //     p.drawTensor(useResult);
    //   });
    // });
    // Embed an array of sentences.
    const sentences = [
      currentDataset[sentenceIdx].input
    ];
    encoder.embed(sentences).then(embeddings => {
      useResult = embeddings.dataSync();
      p.drawTensor(useResult);
    });
  };

  p.draw = function() {
    // background(255);

  };

  p.drawTensor = function(tensor) { // [1,512]
    var line = 0;
    for (var i = 0; i < tensor.length; i++) {
      p.noStroke();
      let b = p.map(tensor[i], -0.05, 0.05, 0, 100);
      p.fill(40, 90, b);

      if (i % 32 == 0) {
        line++;
      }
      let rectWidth = width/32;
      p.rect(i%32*rectWidth, line*rectWidth, rectWidth, rectWidth);
    }
  }
};
// var myp5 = new p5(u, 'tensor-container');



function soundClassifierReady() {
  // classify sound
  soundClassifier.classify(gotSoundResult);
}

function gotSoundResult(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  // // log the result
  // console.log(result[0]);
  answer = result[0].label;
  if ((answer == "yes" || answer == "no") && timer <= 10 && timer >= 0) {
    // if (!prevent) {
    if (timer <= 10 && timer >= 0) {
      prevent = true;
      console.log(prevent);
      let label = (answer=="yes") ? 0:1; // convert answer to label: yes=0, no=1;
      // update logs
      console.log(answer);
      answerLog.push(label==currentDataset[sentenceIdx].label);
      tensorLog.push(useResult);
      sentenceIdxLog.push(sentenceIdx);

      showNext();
      setTimeout(function () {
        prevent = false;
      }, 1500);
    }

  }
}



function showNext() {
  // controller
  questionIdx++;
  console.log("question: " +questionIdx);
  if (questionIdx == 10) {
    currentDataset = medcm;
  } else if (questionIdx == 14) {
    currentDataset = longcm;
  }
  if (questionIdx == 16) { // reaches the end
    showEnd();
  } else {
    myp5_1.question.style("display", "none");
    myp5_1.timerDigit.style("display", "none");
    myp5_1.timerDigit.html("5");
    // reset timer
    timer = 11;
    setTimeout(function () {
      myp5_1.question.style("display", "block");
      myp5_1.timerDigit.style("display", "block");
    }, 1000);

    myp5_3.showText();

    myp5_4.clear();
    const sentences = [
      currentDataset[sentenceIdx].input
    ];
    encoder.embed(sentences).then(embeddings => {
      useResult = embeddings.dataSync();
      myp5_4.drawTensor(useResult);
    });
  }

}

function showEnd() {
  // remove all elements
  myp5_1.remove();
  myp5_2.remove();
  myp5_3.remove();
  myp5_4.remove();
  document.getElementById("text-container").style.display = "none";
  document.getElementById("tensor-container").style.display = "none";
  document.getElementById("video-container").style.display = "none";
  document.getElementById("question-container").style.display = "none";

  // show answer log, conclusion, and finally write your own text.
  showMissed();

}

function showMissed() {
  document.getElementById("result-container").style.display = "block";
  let missed = answerLog.slice(0, 15).filter(x => x === null).length;
  let finalScoreText = createP("You didn't answer: " + missed + "/15");
    finalScoreText.id("finalScoreText");
    finalScoreText.parent("result-container");
  if (missed == 0) {
    finalScoreText.style("color", "#00cc63");
    let message = createP("Congratulation! You kept your job."); // set to change
        message.id("message");
        message.parent("result-container");
  } else if (missed == 1) {
    finalScoreText.style("color", "#88cc00");
    let message = createP("Decent, you kept your job."); // set to change
        message.id("message");
        message.parent("result-container");
  } else if (missed >= 2 && missed <= 3) {
    finalScoreText.style("color", "#cc9c00");
    let message = createP("Ok, we might have to re-evaluate your ability."); // set to change
        message.id("message");
        message.parent("result-container");
  } else if (missed >= 4) {
    finalScoreText.style("color", "#cc9c00");
    let message = createP("Oops, you are fired."); // set to change
        message.id("message");
        message.parent("result-container");
  }

  let showScoreBtn = createButton("Next");
    showScoreBtn.class("btn");
    showScoreBtn.id("showScoreBtn");
    showScoreBtn.parent("result-container");
    showScoreBtn.mousePressed(showScore);
}

function showScore() {
  // remove btn & message
  document.getElementById("showScoreBtn").remove();
  document.getElementById("message").remove();

  let finalScore = answerLog.slice(0, 15).filter(x => x === true).length;
  document.getElementById("finalScoreText").innerHTML = "However, your accuracy is: " + finalScore + "/15"
  if (finalScore == 15) {
    document.getElementById("finalScoreText").style.color =  "#00cc63";
  } else if (finalScore < 15 && finalScore >= 13) {
    document.getElementById("finalScoreText").style.color = "#88cc00";
  } else if (finalScore < 13 && finalScore >= 9) {
    document.getElementById("finalScoreText").style.color = "#cc9c00";
  } else if (finalScore < 9) {
    document.getElementById("finalScoreText").style.color = "#cc0000";
  }
  let longMessage1 = createP("Working as a data labeler, your <i>speed</i> is more important, <br>rather than your <i>accuracy</i>.");
    longMessage1.class("longMessage");
    longMessage1.parent("result-container");
  let longMessage2 = createP("But SPEED DOES NOT MEAN EVERYTHING.");
    longMessage2.class("longMessage");
    longMessage2.parent("result-container");
  let showConclusionBtn = createButton("Next");
    showConclusionBtn.class("btn");
    showConclusionBtn.id("showConclusionBtn");
    showConclusionBtn.parent("result-container");
    showConclusionBtn.mousePressed(showConclusion);
}

// tensor container
var c = function( p ) { // p could be any variable name
  let divWidth, divHeight;
  let marginX, marginY;

  p.setup = function() {
    var canvasDiv = document.getElementById('conclusion2-container');
    divWidth = canvasDiv.offsetWidth;
    divHeight = canvasDiv.offsetHeight;
    marginX = 20;
    p.createCanvas(divWidth,divHeight);
    p.colorMode(HSB);
    p.clickBoxes = [];

    for (var i = 0; i < 15; i++) {
      let tensor = tensorLog[i];
      p.drawTensor(tensor, i);
      p.createClickableBox(i);
    }

  };

  p.draw = function() {
    // background(255);
  };

  p.drawTensor = function(tensor, idx) { // [1,512]
    var line = 0;
    for (var i = 0; i < tensor.length; i++) {
      p.noStroke();
      let b = p.map(tensor[i], -0.05, 0.05, 0, 100);
      p.fill(40, 90, b);

      if (i % 32 == 0) {
        line++;
      }
      let rectWidth = (divWidth-4*marginX)/5/32;
      let tensorWidth = rectWidth*32+marginX;
      let marginY = (divHeight-rectWidth*16*3)/2;
      let tensorHeight = rectWidth*16+marginY;
      p.rect(tensorWidth*(idx%5) + i%32*rectWidth, tensorHeight*floor(idx/5) + line*rectWidth, rectWidth, rectWidth);
    }
  }
  p.mouseClicked = function () {
    let rectWidth = (divWidth-4*marginX)/5/32;
    if (p.mouseButton === LEFT) {
      for (var i = 0; i < p.clickBoxes.length; i++) {
        if (p.mouseX >= p.clickBoxes[i].x && p.mouseX <= p.clickBoxes[i].x+rectWidth*32 &&
            p.mouseY >= p.clickBoxes[i].y && p.mouseY <= p.clickBoxes[i].y+rectWidth*16) {

          let idx = p.clickBoxes[i].idx;
          var newWin = window.open("sentence.html", '_blank');
          newWin.focus();
          var data = shortcm;
          if (idx < 10) {
            data = shortcm;
          } else if (idx < 13) {
            data = medcm;
          } else if (idx < 15) {
            data = longcm;
          }
          newWin.onload = function(){
            newWin.document.getElementById("sentiment").innerHTML = "Sentiment: " + data[sentenceIdxLog[idx]].sentiment;
            let label = data[sentenceIdxLog[idx]].label == 1 ? "Unethical":"Ethical"
            newWin.document.getElementById("label").innerHTML = "Label: " + label;
            newWin.document.getElementById("sentence").innerHTML = data[sentenceIdxLog[idx]].input;
          };
        }
      }
    }

  }
  p.createClickableBox = function(idx) {
    let rectWidth = (divWidth-4*marginX)/5/32;
    let tensorWidth = rectWidth*32+marginX;
    let marginY = (divHeight-rectWidth*16*3)/2;
    let tensorHeight = rectWidth*16+marginY;
    p.clickBoxes.push({x:tensorWidth*(idx%5), y:tensorHeight*floor(idx/5), idx:idx});
  }
};

function showConclusion() {
  console.log("run");
  document.getElementById("result-container").style.display = "none";
  document.getElementById("conclusion-container").style.display = "block";
  // texts
  let conclusionText1 = createP("Now let's see how the text differs from each other. Below is the visualization of the embedded texts in vector form. Click on each visualization to see its content, sentiment, and label.");
    conclusionText1.id("conclusionText1");
    conclusionText1.parent("conclusion1-container");
  let conclusionText2 = createP("The text are embeded using Universal Sentence Encoder by TensorFlow.js, note how differently each text is encoded and labelled, but they are all given the 0.99 sentiment score.")
    conclusionText2.id("conclusionText2");
    conclusionText2.parent("conclusion1-container");
  let conclusionText3 = createP("TEXT SENTIMENT DOES NOT MEAN EVERYTHING.")
    conclusionText3.id("conclusionText3");
    conclusionText3.parent("conclusion1-container");
  let finallyBtn = createP("> End");
    finallyBtn.id("finallyBtn");
    finallyBtn.parent("conclusion1-container");
    finallyBtn.mouseClicked(function () {
      window.open("sentiment/index.html", '_blank');
    })

  // tensors
  myp5_5 = new p5(c, 'conclusion2-container');
}



// @@@@@@@@@@@@@@@@
use.load().then(model => {
  encoder = model;
  myp5_1 = new p5(r, 'question-container');
  myp5_2 = new p5(s, 'video-container');
  myp5_3 = new p5(t, 'text-container');
  myp5_4 = new p5(u, 'tensor-container');
})
