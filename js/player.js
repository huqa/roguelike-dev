Game.Player = function() {
	
	this.hp = 100;
	this.maxHp = 100;
	this.speed = 50;
	this.level = 1;
	
	// Energy must be gained from food
	this.energy = 100;

	var props = Game.PlayerTemplate;
	Game.Entity.call(this, props);

	// Status modifiers
	
	this.poisoned = false;
	this.poisonDamage = 0;

	this.actions = 0;

};

Game.Player.extend(Game.Entity);

Game.Player.prototype.getHP = function() {
	return this.hp;
};

Game.Player.prototype.getSpeed = function() {
	return this.speed;
};

Game.Player.prototype.getStatus = function() {
	return this.actions;
};


