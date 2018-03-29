document.addEventListener('DOMContentLoaded', function () {
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
        //generate random card layout
        cardLayoutGenerator();
        // myNewShuffle();
    }


    //this fuction operates with any amount of cards from HTML, because it shuffle live HTMLCollection, but it less perfomance. 
    //It cause big amount of page repaints
    // function myNewShuffle() {
    // const startingTime = performance.now();
    //     let tempIndex = 0;
    //     let tempItem = '';
    //     for (let i = 0; i < deck.children.length; i++) {
    //         tempIndex = Math.floor(Math.random() * (deck.children.length - i) + i);
    //         tempItem = deck.children[tempIndex].innerHTML;
    //         deck.children[tempIndex].innerHTML = deck.children[i].innerHTML;
    //         deck.children[i].innerHTML = tempItem;
    //     }
    // const endingTime = performance.now();
    // console.log('This code took ' + (endingTime - startingTime) + ' milliseconds.');
    // }


    //this function does only one repaint and generate random layout of cards from any amount of cards
    function cardLayoutGenerator() {
        // array of cards classes
        const starterArray = [];
        for (let i = 0; i < deck.children.length; i++) {
            starterArray.push(deck.children[i].firstElementChild.classList.value);
        }
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
        //checking if timer is running or not
        if (!timerOnOf) {
            //if it wasn't lunched - setInterval and assign it to timerID (we can use clearInterval only on timerID)
            timerID = setInterval(function () {
                seconds++;
                document.querySelector('#timer').textContent = seconds;
            }, 1000);
            //set timer switch to ON (it means that timer is runing now)
            timerOnOf = true;
        }
        //checking if targeted (clicked) element is a card and it haven't been matched with another card before  and it haven't been opened and its only two cards opened at one time
        if (!event.target.classList.contains('match') && event.target.tagName === 'LI' && !event.target.classList.contains('open') && deckArray.length < 2) {
            //add this element to array and use function 'cardOpener' to flip <li>
            deckArray.push(cardOpener(event));
            // check how much elements in temporary array, if just one - do nothing and wating for another card to be clicked
            if (deckArray.length == 2) {
                // if thereis 2 elements in temporary array do next:
                // assign result of function areTheyMatch to variable (true or false)
                const matchCheck = areTheyMatch(deckArray[0], deckArray[1]);
                if (matchCheck) {
                    //if true, then call function 'makeMatch' with delay 350ms and pass in our current <li> elements
                    setTimeout(makeMatch, 350, deckArray[0], deckArray[1]);
                } else {
                    //if false, then call function 'shakerFunc' and 'hideCards' with delay 200ms and 900ms (to let them stay a little bit longer,
                    // so user can memorize position of cards in the game
                    //and pass in our current <li> elements
                    setTimeout(shakerFunc, 200, deckArray[0], deckArray[1]);
                    setTimeout(hideCards, 900, deckArray[0], deckArray[1]);
                }
                //increasing our move counter;
                movesCounter++
                //check if stars should be removed
                starRemover();
            }
        }
        //displaying current move counter
        document.querySelector('.moves').textContent = movesCounter;
    }

    //function for flipping cards
    function cardOpener(event) {
        // adding class 'open' to clicked <li>
        event.target.classList.add('open');
        // adding class 'show' to clicked <li> with small 150ms delay, so it will make smooth flipping effect,
        // and card will not be displayed immidiately
        setTimeout(function () {
            event.target.classList.add('show');
        }, 150);
        //returning current <li> element that was clicked and flipped
        return event.target;
    }

    //function checks if the two passed in <li> elements are match or not
    function areTheyMatch(a, b) {
        // if class lists of inner <i> tags matches then return true, othewise return false
        if (a.firstElementChild.classList.value === b.firstElementChild.classList.value) {
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
        //checking for win condition
        winCondition();
        //reseting temporary array that holds 2 cards (2 <li>)
        setTimeout(resetDeckArray, 900);

    }

    function winCondition() {
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
    }

    // function shake cards if they don't match, make them red
    function shakerFunc(a, b) {
        a.classList.add('shaking');
        a.style.background = '#c7484e';
        b.classList.add('shaking');
        b.style.background = '#c7484e';
    };

    // if cards are not match this function hide them back by removing 'open', 'show' and 'shaking' classes and red background
    function hideCards(a, b) {
        a.classList.remove('open', 'show', 'shaking');
        a.removeAttribute('style');
        b.classList.remove('open', 'show', 'shaking');
        b.removeAttribute('style');
        //reseting temporary array that holds 2 cards (2 <li>)
        resetDeckArray();
    }

    //timer stop function 
    function timerStop(clear) {
        //clear setInterval for timer
        clearInterval(timerID);
        //reseting timerOnOf (timer isn't running)
        timerOnOf = false;
        //convert seconds to (h:m:s)
        timeConverter(seconds);
        //reseting seconds
        seconds = 0;
        //if 'clear' is true - reset timer to 0 otherwise keep it
        if (clear) {
            document.querySelector('#timer').textContent = seconds;
        }
    }

    //reset temporary array functionn
    function resetDeckArray() {
        deckArray = [];
    }

    //function converts seconds to H:M:S format.
    function timeConverter(finalSeconds) {
        const winHours = Math.floor(finalSeconds / 3600);
        finalSeconds = finalSeconds - winHours * 3600;
        const winMinutes = Math.floor(finalSeconds / 60);
        finalSeconds = finalSeconds - winMinutes * 60;
        document.querySelector('#time-hr').textContent = winHours;
        document.querySelector('#time-min').textContent = winMinutes;
        document.querySelector('#time-sec').textContent = finalSeconds;
    }

    //function that remove stars base on movesCounter and starIndex
    function starRemover() {
        //if moves = 17 and there are 3 stars displayed
        if (movesCounter === 17 && starIndex === 3) {
            //remove one star
            document.querySelector('.stars').lastElementChild.remove();
            // change starIndex to 2 (it means that now only two stars displayed)
            starIndex = 2;
            //if moves = 20 and there are 2 stars displayed
        } else if (movesCounter === 20 && starIndex == 2) {
            //remove one star
            document.querySelector('.stars').lastElementChild.remove();
            // change starIndex to 1 (it means that now only one star displayed)
            starIndex = 1;
        } // I don't remove lats star so player could earn at least one card at the end of the game
    };

});