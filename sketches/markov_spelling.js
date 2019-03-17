var all_words = [];
var words_to_spell = [];
var words_taught = [];
var markov = {};
var spelled_word = "";

function preload(){
  loadJSON("./../words/words.json", gotData);
}

function genCharArray(charA, charZ) {
    var a = [], i = charA.charCodeAt(0), j = charZ.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}


function gotData(data){
    all_words = data["words"];
}

function setup() {
  createCanvas(500, 500);

  words_to_spell = [randChoice(all_words)];

  console.log(words_to_spell);

  input = createInput();
  input.position(20, 60);

  teachButton = createButton('teach word');
  teachButton.position(220, 60);
  teachButton.mousePressed(addWord);

  spellButton = createButton('spell word');
  spellButton.position(220, 400);
  spellButton.mousePressed(guess);

}

function addWord(){
  var new_word = input.value();
  words_taught.push(new_word);
  for (var i = 0; i < new_word.length - 1; i ++) {
    var curr_char = new_word[i];
    var next_char = new_word[i + 1];
    if (Object.keys(markov).includes(curr_char)) {
      markov[curr_char].push(next_char);
    }
    else {
      markov[curr_char] = [next_char];
    }
  }

  input.value('');
}

function randChoice(arr) {
  rand_ind = int(random(arr.length));
  return arr[rand_ind];
}

function freqDict(arr) {
  var freq_dict = {};
  for (var x = 0; x < arr.length; x ++) {
    if (Object.keys(freq_dict).includes(arr[x])) {
      freq_dict[arr[x]] += 1;
    }
    else {
      freq_dict[arr[x]] = 1;
    }
  }

  return freq_dict;
}

function mostCommon(arr) {
  var freq_dict = freqDict(arr);

  var max_freq = 0;
  for (var key in freq_dict) {
    if (freq_dict[key] > max_freq) {
      max_freq = freq_dict[key];
    }
  }

  var most_common = [];
  for (var key in freq_dict){
    if (freq_dict[key] == max_freq) {
      most_common.push(key);
    }
  }
  return most_common;
}

function getNextChar(char) {
  if (Object.keys(markov).includes(char)) {
    return randChoice(mostCommon(markov[char]));
  }
  else {
    return randChoice(genCharArray('a', 'z'));
  }
}

function guess() {
  spelled_word = spellWord(words_to_spell[0]);
}

function spellWord(word) {
  var guess = [word[0]];
  while(guess.length < word.length){
    guess.push(getNextChar(guess[guess.length - 1]));
  }
  return guess.join("");
}

function draw() {
  background(51);

  fill(255);
  textSize(22);
  textFont('Calibri');
  text(words_to_spell[0], 20, 400);

  var markov_keys = Object.keys(markov);
  for (var i = 0; i < markov_keys.length; i ++) {
    textSize(14);
    var curr_char = markov_keys[i]
    text(curr_char + ":", 20, 100 + 14 * i);
    var next_chars = markov[curr_char]
    for (var j = 0; j < next_chars.length; j ++) {
      text(next_chars[j], 40 + 12 * j, 100 + 14 * i);
    }
  }

  if (spelled_word.length > 0) {
    textSize(22);
    text(spelled_word, 20, 420);
  }
}
