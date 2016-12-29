Game.PlayerTemplate = {
	name: 'Player',
	char: '@',
	fg: '#FFFFFF',
	bg: '#000000',
	level: 2,
	x: 1,
	y: 1,
        attack: 10, 
	defense: 10,
	armorRating: 1,
	equippedWeapon: null,
	mixins: [Game.Mixins.PlayerMoveable, Game.Mixins.PlayerActor, Game.Mixins.PlayerInventory, Game.Mixins.Equipment, Game.Mixins.Destroyable, Game.Mixins.Combat],
};

Game.RabbitTemplate = {
	name: 'Rabbit',
	char: 'r',
	fg: 'brown',
	bg: '#000000',
	x: 10,
	y: 10,
	attack: 1,
	defense: 1,
	armorRating: 0,
	equippedWeapon: null,
	mixins: [Game.Mixins.RabbitActor, Game.Mixins.RabbitMoveable, Game.Mixins.Creature, Game.Mixins.Destroyable, Game.Mixins.Combat]
};
