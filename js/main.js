
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

var keycodes = {}
for (charCode = 97; charCode < 123; charCode++){
	key = String.fromCharCode(charCode)
	value = charCode - 32
	keycodes[key] = value
}
var words = [
	'tomorrow',
	'signature',
	'finale',
	'dispute',
	'helmet',
	'tinker',
	'nails',
	'banana',
	'penguin',
	'spatula',
	'plankton',
	'airport',
	'cathedral',
	'sunflower',
	'direction',
	'relation',
	'avalanche'
];
var words = shuffle(words);
var initGuesses = 6;
var score = 0



Vue.component('word',{
	props: {
		cont: ''
	},
	template:`
		<div id='word'>
			<ul id="letters">
				<li v-for='letter in cont'>
					<letter :cont='letter'></letter>
				</li>
			</ul>
		</div>
	`,
	computed:{
	
	}
})

Vue.component('letters-wrapper', {
	template: `
		<div id='letters-wrapper'>
			<slot></slot>
		</div>
	`
})

Vue.component('letter', {
	props: {
		cont: ''
	},
	data: function () {
		return {
			open: false,
			won: false,
			lost: false
		}
	},
	template: `
		<div class="letter_holder" :class='{guessed:open, won:won, lost:lost}'>
			<p v-if="open">{{cont}}</p>
		</div>
	`,
	watch: {
		cont: function() {
			this.reset();
		}
	},
	methods: {
		toggle: function(e) {
			if (e.key == this.cont && !this.open && vm.gameStateMsg !== 'paused') {
				this.open = true;
				vm.incrementGuesses(1);
				vm.incrementScore(1);
				vm.incrementGuessed();
			}
		},
		reset: function() {
			this.open = false;
		}
	},
	mounted() {
		window.addEventListener('keydown', this.toggle);
	},
	beforeDestroy() {
		window.removeEventListener('keydown', this.toggle);
	}
})

Vue.component('indicator', {
	template: `
		<li 
			class='indicator' 
			:class='{guessed:guessed, pressgood:pressGood, pressbad:pressBad}'
			@click='guess'>
			<p :id='cont'>{{cont}}</p>
		</li>
	`,
	props: {
		word: '',
		cont: '',
		keycode: ''
	},
	data: function() {
		return {
			guessed: false,
			pressBad: false,
			pressGood: false
		}
	},
	computed: {
		inWord: function() {
			return vm.word.indexOf(this.cont) !== -1;
		}
	},
	watch: {
		word: function() {
			this.reset();
		}
	},
	methods: {
		guess: function(){
			if (!this.guessed && vm.gameStateMsg !== 'paused'){
				if (this.inWord) {
					this.pressGood = true;
					setTimeout(() => {
						this.pressGood = false;
						this.guessed = true;
					},500);
				} else {
					this.pressBad = true;
					setTimeout(() => {
						this.pressBad = false;
						this.guessed = true;
					},500);
				}
				// this.guessed = true;
				vm.incrementGuesses(-1);
				if (!vm.begun) {
					vm.beginDiscount();
				}
			}
		},
		reset: function() {
			this.guessed = false;
		}
	}
}),

Vue.component('modal', {
  template: '#modal-template'
})

var vm = new Vue({
	el: '#hangman',
	data: {
		score: 0,
		remaining: initGuesses,
		word: '',
		words: words,
		keycodes: keycodes,
		discountRate: 0.0, //points taken off per second
		discountTimer: '',
		begun: false,
		guessed: 0,
		won: false,
		lost: false,
		showMenu: true,
		difficulty: 0,
		gameStateMsg: 'welcome'
	},
	computed: {
		toGuess: function() {
			return this.word.length - this.guessed;
		}
	},
	watch: {
		toGuess: function(value) {
			if (value == 0) {
				if (vm.gameStateMsg == 'pending') {
					vm.pause()
				}
				this.won = true;
				this.score = this.score + this.difficulty;
				var resetTimer;
				if (this.discountRate > 0) {
					resetTimer = 200;
				} else{
					resetTimer = 1500;
				}
				setTimeout(function() {
					vm.reset();
					vm.won = false;
				}, resetTimer);
			}
		},
		score: function(value) {
			if (0 > value) {
				clearInterval(this.discountTimer);
				this.discountTimer = '';
				this.begun = false;
				this.score = 0;
				this.lost = true;
				this.showMenu = true;
			}
		},
		remaining: function(value) {
			if (0 >= value) {
				this.lost = true;
				this.score = this.score - (10 + this.difficulty/2.0);
				this.gameStateMsg = 'game over';
				if (this.score >= 0) {
					setTimeout(function() {
						vm.reset();
						vm.lost = false;
					},250);
				}
			}
		}
	},
	methods: {
		incrementScore: function(amt) {
			this.score = this.score + amt;
		},
		discountScore: function() {
			this.discountTimer = setInterval(function(that) {
				vm.score = vm.score - (vm.discountRate/100.0);
			}, 10);
		},
		beginDiscount: function() {
			if (this.discountRate > 0) {
				this.begun = true;
				this.discountScore();
			}
		},
		setDiscountRate: function(rate) {
			this.discountRate = rate;
		},
		incrementGuessed: function() {
			this.guessed = this.guessed + 1
		},
		incrementGuesses: function(amt) {
			this.remaining = this.remaining + amt
		},
		resetGuesses: function() {
			this.remaining = initGuesses
		},
		getNextWord: function() {
			return words.pop();
		},
		reset: function() {
			this.word = this.getNextWord();
			this.guessed = 0;
			this.remaining = initGuesses;			
			
		},
		newGame: function(difficulty) {
			this.words = shuffle(words);//.push('frances');
			this.word = words.pop();
			this.guessed = 0;
			this.score = difficulty;
			this.remaining = initGuesses;
			this.discountRate = difficulty/25.0;
			this.lost = false;
			this.showMenu = false;
			this.gameStateMsg = 'playing';
		},
		pause: function() {
			clearInterval(this.discountTimer);
			this.discountTimer = '';
			this.begun = false;
			this.gameStateMsg = 'paused';
			this.showMenu = true;
		},
		unpause: function() {
			this.showMenu = false;
			this.beginDiscount();
			this.gameStateMsg = 'playing';
		}
	}
})

window.addEventListener('keydown', function(e){
	var key = e.key;
	if (/[a-z]/.test(key)) {
		console.log(key)
		vm.$refs[key][0].$el.click();
	}
	if (key == ' '){
		if (vm.gameStateMsg !== 'paused') {
			if (vm.discountRate > 0) {
				if (vm.gameStateMsg !== 'pending') {
					vm.gameStateMsg = 'pending';
				} else {
					vm.gameStateMsg = 'playing';
				}
			} else {
				vm.pause()
			}
		} else {
			vm.unpause()
		}
	}

});

