// Ranged weapons
Game.PistolTemplate = {
	name: 'Pistol (Semi-Automatic)',
	char: 'l',
	fg: "#999966",
	bg: "#000000",
	x: 2,
	y: 2,
	weaponName: 'Pistol',
	attackModifier: 3,
	ranged: true,
	radius: 7,
	mixins: [Game.Mixins.Weapon, Game.Mixins.Pickupable, Game.Mixins.Wieldable]
};
