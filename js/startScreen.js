
var StartScreen = function() {
	this.display = null;
	this.msgBuffer = [];
};


StartScreen.prototype = {

	init: function(display) {
		this.display = display;
	},
	finalize: function() {},
	render: function() {
		this.display.drawText(10, 5, "Roguelike development platform v0011");
		this.display.drawText(10, 10, "Press [ENTER] to start");
		if(Game.wizardMode === true) {
			this.display.drawText(20, 20, "Wizard mode is ON");
		}
	},
	handleInput: function(type, data) {
		if(type === 'keydown') {
			switch(data.keyCode) {
				case ROT.VK_RETURN:
					Game.changeScreen(Game.Screens.gameScreen);
					break;
			}
		}	
	},
	pushMessage: function(msg) {},

};
