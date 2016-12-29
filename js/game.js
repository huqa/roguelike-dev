var Game = {

	display: null,
	currentScreen: null,

	fontSize: 17,

	screenX: 90,
	screenY: 42,
	
	scheduler: null,
	engine: null,

	wizardMode: true,

	getDisplay: function() {
		return this.display;
	},

	init: function() {
		this.display = new ROT.Display({
                        width: this.screenX,
                        height: this.screenY,
                        fontFamily: "monospace",
                        spacing: 1,
			border: true
		});
		this.bindInputEvent('keydown');
	},

	changeScreen: function(screen) {
		if(this.currentScreen !== null) {
			this.currentScreen.finalize();
		}
		this.getDisplay().clear();
		this.currentScreen = screen;
		if(this.currentScreen !== null) {
			this.currentScreen.init(this.getDisplay());
			this.refresh();
		}
	},

	bindInputEvent: function(event) {
		var self = this;
		window.addEventListener(event, function(e) {
			if(self.currentScreen !== null) {
				self.currentScreen.handleInput(event, e);
			}
		});
	},

	refresh: function() {
		this.display.clear();
		this.currentScreen.render();
	},

	getScreenX: function() {
		return this.screenX;
	},
	getScreenY: function() {
		return this.screenY;
	},
	getScreen: function() {
		return this.currentScreen;
	},
};

Game.Screens = {
	startScreen: new StartScreen(),
	gameScreen: new GameScreen()
};

window.onload = function() {
	if(!ROT.isSupported()) {
		document.body.appendChild("The rot.js library is not supported by your browser.");	
	} else {
		Game.init();
		document.body.appendChild(Game.getDisplay().getContainer());
		Game.changeScreen(Game.Screens.startScreen);
	}
}
