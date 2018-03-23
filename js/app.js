//global variables:
//timerOnOf validate if timer was lunched or not
let timerOnOf = false;
//second on timer
let seconds = 0;
//timerID need to use clearInterval()
let timerID;
//movesCounter used across many function to count moves, removing stars, detect win condition
let movesCounter;
// creating temporary card array to hold 2 cards of one move
let deckArray;
//starIndex indicates number of current stars
let starIndex;
//two stars panels
const starPanel = document.querySelector('.stars');
const starWinPanel = document.querySelector('#end-stars');
// hook up the deck
const deck = document.querySelector('.deck');

//end of global variables

//invoke Start NEw GAME function, 
startNewGame();

//function that start a new game and reset everything
function startNewGame() {
    //hook up all event listeners on page
    document.querySelector('.restart').addEventListener('click', startNewGame);
    document.querySelector('.newgame-style').addEventListener('click', startNewGame);
    deck.addEventListener('click', cardClick);
    //stars reset
    starPanel.innerHTML = '<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
    starWinPanel.innerHTML = '';
    // complete timer reset
    timerStop(true);
    //variables  and html page reset
    deckArray = [];
    movesCounter = 0;
    starIndex = 3;
    document.querySelector('#win').textContent = '0';
    document.querySelector('.win-popup').classList.remove('sh');
    document.querySelector('.moves').textContent = '0';
    cardLayoutGenerator();
}

//generate random layout of cards
function cardLayoutGenerator() {
    // array of card classes
    const starterArray = ['fa fa-diamond', 'fa fa-diamond', 'fa fa-paper-plane-o', 'fa fa-paper-plane-o',
        'fa fa-anchor', 'fa fa-anchor', 'fa fa-bolt', 'fa fa-bolt', 'fa fa-cube', 'fa fa-cube', 'fa fa-leaf', 'fa fa-leaf',
        'fa fa-bicycle', 'fa fa-bicycle', 'fa fa-bomb', 'fa fa-bomb'
    ];
    //shuffle created array
    shuffle(starterArray);
    // empty string to hold inner HTML text for future cards layout
    let htmlCardGrid = '';
    //loop that builds a HTML string of all cards from array
    for (let i = 0; i < starterArray.length; i++) {
        htmlCardGrid = htmlCardGrid + '<li class="card"><i class="' + starterArray[i] + '"></i></li>';
    }
    //inserting innerHTML to our <ul>
    deck.innerHTML = htmlCardGrid;
}

// Shuffle function 
function shuffle(array) {
    let loopIndex = array.length,
        tempVar, rndmIndex;
    while (loopIndex !== 0) {
        rndmIndex = Math.floor(Math.random() * loopIndex);
        loopIndex -= 1;
        tempVar = array[loopIndex];
        array[loopIndex] = array[rndmIndex];
        array[rndmIndex] = tempVar;
    }
    return array;
}

//on cards mouse click function
function cardClick(event) {
    //starting timer
    if (!timerOnOf) {
        timerID = setInterval(function () {
            seconds++;
            document.querySelector('#timer').textContent = seconds;
        }, 1000);
        timerOnOf = true;
    }
    //cheacking if targeted (clicked) element is a card and it havent been matched with another card before 
    if (!event.target.classList.contains('match') && event.target.tagName === 'LI' && !event.target.classList.contains('open') && deckArray.length < 2) {
        //add this element to array and use function 'cardOpener' to flip <li> and get it's index
        deckArray.push(cardOpener(event));
        // cheack how much elements in temporary array, if just one - do nothing and wating for another card to be clicked
        if (deckArray.length < 2) {} else {
            // else (if thereis 2 elements in temporary array) do next:
            // create an live HTML collection of all <li> inside <ul>
            const cardList = deck.children;
            // assign to variables <li> that was clicked by their indexes (indexes was returned from function 'cardOpener')
            const a = cardList[deckArray[0]];
            const b = cardList[deckArray[1]];
            // assign result of function areTheyMatch to variable (true or false)
            const matchCheck = areTheyMatch(a, b);
            if (matchCheck) {
                //if true, then call function 'makeMatch' with delay 350ms and pass in our current <li> elements
                setTimeout(makeMatch, 350, a, b);
            } else {
                //if false, then call function 'shakerFunc' and 'hideCards' with delay 200ms and 900ms (to let them stay a little bit longer,
                // so user can memorize position of cards in the game
                //and pass in our current <li> elements
                setTimeout(shakerFunc, 200, a, b);
                setTimeout(hideCards, 900, a, b);
            }
            //increasing our move counter;
            movesCounter++
            starRemover();
        }
    }
    //displaying current move counter
    document.querySelector('.moves').textContent = movesCounter;
    //removeing stars function
}

//function that remove stars base on movesCounter and starIndex
function starRemover() {
    if (movesCounter === 17 && starIndex === 3) {
        document.querySelector('.stars').lastElementChild.remove();
        starIndex = 2;
    } else if (movesCounter === 20 && starIndex == 2) {
        document.querySelector('.stars').lastElementChild.remove();
        starIndex = 1;
    }
};

//function for flipping cards
function cardOpener(event) {
    // assign HTML live collection of all <li>, who are childer of <ul>
    const cardList = deck.children;
    // adding class 'open' to clicked <li>
    event.target.classList.add('open');
    // adding class 'show' to clicked <li> with small 150ms delay, so it will make smooth flipping effect,
    // and card will not be displayed immidiately
    setTimeout(function () {
        event.target.classList.add('show');
    }, 150);
    //returning index of current <li> element that was clicked and flipped
    return Array.prototype.indexOf.call(cardList, event.target);
}

//function checks if the two passed in <li> elements match or not
function areTheyMatch(a, b) {
    //inside each <li> there is a <i> tag, so we assign each to the temporary variable
    let tempA = a.children;
    let tempB = b.children;
    // if class lists of inner <i> tags matches then return true, othewise return false
    if (tempA[0].classList.value === tempB[0].classList.value) {
        return true;
    } else {
        return false;
    }
}

//function is making two clicked <li> cards matched by removing 'open' and 'show' classes and adding 'match' and 'tada' classes
function makeMatch(a, b) {
    a.classList.add('match', 'tada');
    a.classList.remove('open', 'show');
    b.classList.add('match', 'tada');
    b.classList.remove('open', 'show');


    //live HTML collection of opend cards
    const matchedCards = document.getElementsByClassName('match');
    //checking win condition:
    if (matchedCards.length === deck.children.length) {
        document.querySelector('#win').textContent = movesCounter;
        const tempStar = document.querySelector('.stars').cloneNode(true);
        document.querySelector('#end-stars').appendChild(tempStar);
        //stop timer
        timerStop();
        // display pop up window with win message
        document.querySelector('.win-popup').classList.add('sh');
        //remove event listener from our deck, so user cannot manipulate on card elemenets anymore
        deck.removeEventListener('click', cardClick);
    }
    //reseting temporary array that holds 2 cards (2 <li>)
    setTimeout(resetDeckArray, 900);

}

// function shake cards if they don't match, make them red
function shakerFunc(a, b) {
    a.classList.add('shaking');
    a.style.background = '#c7484e';
    b.classList.add('shaking');
    b.style.background = '#c7484e';
};

// if cards are not match this function hide them back by removing 'open', 'show' and 'shaking' classes
function hideCards(a, b) {
    a.classList.remove('open', 'show', 'shaking');
    a.removeAttribute('style');
    b.classList.remove('open', 'show', 'shaking');
    b.removeAttribute('style');
    //reseting temporary array that holds 2 cards (2 <li>)
    resetDeckArray();
}





//timer stop function (if 'clear' is true - reset timer to 0 otherwise keep it)
function timerStop(clear) {
    clearInterval(timerID);
    timerOnOf = false;
    //convert seconds to (h:m:s)
    timeConverter(seconds);
    seconds = 0;
    if (clear) {
        document.querySelector('#timer').textContent = seconds;
    }

}

function resetDeckArray() {
    deckArray = [];
}

function timeConverter(finalSeconds) {
    const winHours = Math.floor(finalSeconds / 3600);
    finalSeconds = finalSeconds - winHours * 3600;
    const winMinutes = Math.floor(finalSeconds / 60);
    finalSeconds = finalSeconds - winMinutes * 60;
    document.querySelector('#time-hr').textContent = winHours;
    document.querySelector('#time-min').textContent = winMinutes;
    document.querySelector('#time-sec').textContent = finalSeconds;
}
