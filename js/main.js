var keycodes = {}
for (charCode = 97; charCode < 123; charCode++){
	key = String.fromCharCode(charCode)
	value = charCode - 32
	keycodes[key] = value
}
var remainingGuesses = 6;
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
	methods: {
		toggle: function(e) {
			if (e.keyCode == keycodes[this.cont] && !this.open) {
				this.open = true;
				vm.incrementGuesses(1);
				vm.incrementScore(1);
				vm.incrementGuessed();
			}
		},
		reset: function(event) {
			if (event.type == 'win') {
				this.won = true;
			} else {
				this.lost = true;
			}
		}
	},
	mounted() {
		window.addEventListener('keydown', this.toggle);
	}
})

Vue.component('indicator', {
	template: `
		<li 
			class='indicator' 
			:class='{guessed:guessed, pressgood:pressGood, pressbad:pressBad}'
			@click='guess'>
			<p>{{cont}}</p>
		</li>
	`,
	props: {
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
	methods: {
		guess: function(){
			console.log(this.inWord);
			if (this.inWord) {
				this.pressGood = true;
				setTimeout(() => {
					this.pressGood = false;
					this.guessed = true;
				},200);
			} else {
				this.pressBad = true;
				setTimeout(() => {
					this.pressBad = false;
					this.guessed = true;
				},200);
			}
			// this.guessed = true;
			vm.incrementGuesses(-1);
			if (!vm.begun) {
				vm.beginDiscount();
			}
			// pressBad = false;
			// pressGood = false;
		},
		reset: function() {
			this.guessed = false;
		}
	}
})

var initGuesses = 6;
var vm = new Vue({
	el: '#hangman',
	data: {
		score: 0,
		remaining: initGuesses,
		word: 'frances',
		keycodes: keycodes,
		discountRate: 0.0, //points taken off per second
		begun: false,
		guessed: 0,
		won: false,
		lost: false
	},
	computed: {
		toGuess: function() {
			return this.word.length - this.guessed;
		}
	},
	watch: {
		toGuess: function(value) {
			if (value == 0) {
				this.won = true;
			}
		},
		remaining: function(value) {
			if (value == 0) {
				this.lost = true;
			}
		}
	},
	methods: {
		incrementScore: function(amt) {
			this.score = this.score + amt;
		},
		discountScore: function() {
			setInterval(function(that) {
				// console.log('whoops');
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
		}
	}
})

window.addEventListener('keydown', function(e){
	var kC = String.fromCharCode(e.keyCode + 32);
	vm.$refs[kC][0].$el.click();

});

