Game.Mixins = {};

Game.Mixins.Moveable = {
        name: 'Moveable',
        move: function(x, y, map) {
                var tile = map.getTile(x, y);
                var t = map.getEntitiesAt(x, y);
                if (t.length > 0) {
			return false;
                }
                if (tile.isPassable()) {
                        this.x = x;
                        this.y = y;
                        return true;
                } // Continue with else if (tile.isDiggable()) etc.
                return false;
        },
};

Game.Mixins.CreatureEatable = {
	name: 'CreatureEatable',
	groupName: 'Eatable',
	init: function(template) {
		this.sustainAmount = template['sustainAmount'] || 10;
	},
	sustains: function(target) {
		target.energy += this.sustainAmount;
	},
};

Game.Mixins.Eatable = {
	name: 'Eatable',
	init: function(template) {
		this.sustainAmount = template['sustainAmount'] || 10;
	},
	sustains: function(target) {
		target.energy += this.sustainAmount;
	},
};

Game.Mixins.PoisonEatable = {
	name: 'PoisonEatable',
	groupName: 'Eatable',
	init: function(template) {
		this.sustainAmount = template['sustainAmount'] || 5;
	},
	sustains: function(target) {
		target.energy += Math.floor(this.sustainAmount/2);
		target.poisoned = true;
		target.poisonDamage = this.sustainAmount;
	},
};

Game.Mixins.Potable = {
	name: 'Potable',
	init: function(template) {
		this.hydrateAmount = template['hydrateAmount'] || 10;
	},
	hydrates: function(target) {
		target.water += this.hydrateAmount;
	},
};

Game.Mixins.PoisonPotable = {
	name: 'PoisonPotable',
	groupName: 'Potable',
	init: function(template) {
		this.hydrateAmount = template['hydrateAmount'] || 5;
	},
	hydrates: function(target) {
		target.water += Math.floor(this.hydrateAmount/2);
		target.poisoned = true;
		target.poisonDamage = this.hydrateAmount;
	},
};

Game.Mixins.PlayerMoveable = {
	name: 'PlayerMoveable',
	groupName: 'Moveable',
	move: function(x, y, map) {
		var tile = map.getTile(x, y);
		var t = map.getEntitiesAt(x, y);
		if (t) {
			for(var i = 0; i < t.length; i++) {
				var e = t[i];
				if(e.hasMixin('Combat')) {
					this.attackTarget(e, this.meleeWeapon);
				}
				if(e.hasMixin('Pickupable')) {
					if(t.length > 1) {
						Game.getScreen().pushMessage("You see multiple items on the ground.");
					} else {
						Game.getScreen().pushMessage("You see on the ground: " + e.getName());
					}
					this.x = x;
					this.y = y;
					return true;
				}
			}
			return false;
		}
		if(tile.isPassable()) {
			this.x = x;
			this.y = y;
		} else if(tile.isDoor()) {
			if(tile.isOpen()) {
				this.x = x;
				this.y = y;
			} else {
				// Open the door
				Game.getScreen().pushMessage("You open the door.");
				map.setTile(Game.Tile.T.DOOR_OPEN, x, y);
			}
		}
		return false;
	},
};

Game.Mixins.Creature = {
	name: 'Creature',
	init: function(template) {
		this.hp = template['hp'] || 10;
		this.energy = template['energy'] || 100;
		this.water = template['water'] || 100;
		this.level = template['level'] || 1;
		this.poisoned = template['poisoned'] || false;
		this.poisonDamage = template['poisonDamage'] || 0;
		// Is this creature hostile to other creatures. Like a beast.
		this.hostile = template['hostile'] || false;
		// Is in danger?
		this.danger = false;
	},
	getHP: function() {
		return this.hp;
	},
	setHP: function(hp) {
		this.hp = hp;
	},
	isHungry: function() {
		return (this.energy < 40) ? true : false;
	},
	isThirsty: function() {
		return (this.water < 40) ? true : false;
	},
	setDanger: function(d) {
		this.danger = d;
	},
	inDanger: function() {
		return this.danger === true;
	},
	isHostile: function() {
		return this.hostile === true;
	},
	setHostile: function(h) {
		this.hostile = h;
	},
	eat: function(item) {
		if(item.hasMixin('Eatable')) {
			item.sustains(this);
			return true;
		} else {
			return false;
		}
	},
	drink: function(item) {
		if(item.hasMixin('Potable')) {
			item.hydrates(this);
			return true;
		} else {
			return false;
		}
	}
};

Game.Mixins.RabbitMoveable = {
        name: 'RabbitMoveable',
        groupName: 'Moveable',
        move: function(x, y, map) {
                var tile = map.getTile(x, y);
                var t = map.getEntitiesAt(x, y);
                if (t.length > 0) {
			for(var i = 0; i < t.length; i++) {
				if(!t[i].hasMixin('Pickupable')) {
                        		return false;
				}
			}
                }
                if(tile.isPassable()) {
                        this.x = x;
                        this.y = y;
                }
                return false;
        },
};

Game.Mixins.Inventory = {
	name: 'Inventory',
	init: function() {
		this.inventory = [];
	},
	getInventory: function() {
		return this.inventory;
	},
	addToInventory: function(entity) {
		if(entity.hasMixin('Pickupable')) {
			entity.pickedUp();
			this.inventory.push(entity);
			this.getMap().removeEntity(entity);
		}
	},
	removeFromInventory: function(entity) {
		for(var i = 0; i < this.inventory.length; i++) {
			if(this.inventory[i] === entity) {
				delete this.inventory[i];
			}
		}
	},
};

Game.Mixins.PlayerInventory = {
	name: 'PlayerInventory',
        groupName: 'Inventory',
	init: function() {
		this.inventory = [];
	},
        getInventory: function() {
		var ch = 65;
		var ch_end = 90;
		var entityList = [];
		var weps = [];
		var armors = [];
		for(var i = 0; i < this.inventory.length; i++) {
			var entity = this.inventory[i];
			entityList.push({"key": String.fromCharCode(ch), "entity": entity});
			ch++;
		}
                return entityList;
        },
	pickUp: function(entity) {
		if(entity.hasMixin('Pickupable')) {
			entity.pickedUp();
			this.addToInventory(entity);
			Game.getScreen().pushMessage("Picked up " + entity.getName());
			this.getMap().removeEntity(entity);
		}
	},
        addToInventory: function(entity) {
                this.inventory.push(entity);
        },
        removeFromInventory: function(entity) {
                for(var i = 0; i < this.inventory.length; i++) {
                        if(this.inventory[i] === entity) {
                                delete this.inventory[i];
                        }
                }
        },
};

Game.Mixins.Equipment = {
	name: 'Equipment',
	init: function(template) {
		this.meleeWeapon = null;
		this.rangedWeapon = null;
		this.armor = null;
	},
	equip: function(entity) {	
		if(entity.hasMixin('Wieldable')) {
			if(entity.isRanged()) {
				this.rangedWeapon = entity;
				Game.getScreen().pushMessage("Equipped " + entity.getName() + " as ranged weapon.");
			} else {
				this.meleeWeapon = entity;
				Game.getScreen().pushMessage("Equipped " + entity.getName() + " as melee weapon.");
			}
		}
		if(entity.hasMixin('Wearable')) {
			this.armor = entity;
			Game.getScreen().pushMessage("Equipped " + entity.getName() + ".");
		}
	},
	unequip: function(entity) {
		if(entity.hasMixin('Wieldable')) {
			if(entity === this.meleeWeapon) {
				this.meleeWeapon = null;
			}
			if(entity === this.rangedWeapon) {
				this.rangedWeapon = null;
			}
			Game.getScreen().pushMessage("Unequipped " + entity.getName());
		}
		if(entity.hasMixin('Wearable')) {
			if(this.armor === entity) {
				this.armor = null;
			}
			Game.getScreen().pushMessage("Unequipped " + entity.getName());
		}
	},
	isEquipped: function(entity) {
		if(entity === this.meleeWeapon || entity === this.rangedWeapon || entity === this.armor) {
			return true;
		} else {
			return false;
		}
	},
};

Game.Mixins.Combat = {
	name: 'Combat',
	init: function(template) {
		this.attack = template['attack'] || 0;
		this.defense = template['defense'] || 0;
		this.armorRating = template['armorRating'] || 0;
		//this.meleeWeapon = template['meleeWeapon'] || null;
		//this.rangedWeapon = template['rangedWeapon'] || null;
		this.inCombat = false;
		this.lastCombatTarget = null;
	},
	attackTarget: function(target, weapon) {
		var mod = 0;
		if(weapon !== null && typeof weapon !== 'undefined') {
			mod = weapon.getAttackModifier();
		}
		if(target.hasMixin('Combat')) {
			this.setLastCombatTarget(target);
			target.setLastCombatTarget(this);
			this.setInCombat(true);
			target.setInCombat(true);
			// formula is: (attack + modifier) * random(1-2) - (defense+armor rating) / (255 / (attack * level) + 1)
			var damage = (this.attack + mod) * (Math.round(Math.random() * 2)) - (target.defense + target.armorRating) / (255 / ((this.attack * this.level) +1));
			if(target.hasMixin('Destroyable')) {
				if(Math.floor(damage) > 0) {
					Game.getScreen().pushMessage(this.getName() + " hits " + target.getName() + " with " + Math.floor(damage) + " damage!");
					target.takeDamage(this, damage);
				} else {
					Game.getScreen().pushMessage(this.getName() + " tries to hit " + target.getName() +" but misses!");
				}
			}
		}
		
	},
        isInCombat: function() {
                return this.inCombat === true;
        },
        setInCombat: function(c) {
                this.inCombat = c;
        },
	setLastCombatTarget: function(target) {
		this.lastCombatTarget = target;
	},
	getLastCombatTarget: function() {
		return this.lastCombatTarget;
	},
};

Game.Mixins.Weapon = {
	name: 'Weapon',
	init: function(template) {
		this.weaponName = template['weaponName'] || 'Fists';
		this.attackModifier = template['attackModifier'] || 0;
		//possibly add durability
		this.ranged = template['ranged'] || false;
		this.weaponRadius = template['radius'] || 1;
	},
	isRanged: function() {
		return this.ranged === true;
	},
	getAttackModifier: function() {
		return this.attackModifier;
	},
};

Game.Mixins.Destroyable = {
	name: 'Destroyable',
	init: function(template) {
		this.defense = template['defense'] || 0;
	},
	takeDamage: function(attacker, damage) {
		this.hp -= Math.floor(damage);
		if(this.hp <= 0) {
			if(attacker.hasMixin('PlayerActor')) {
				Game.getScreen().pushMessage("You kill the " + this.getName() + "!");
			} else {
				if(this.hasMixin('PlayerActor')) {
					Game.getScreen().pushMessage("You die.....");
				} else {
					Game.getScreen().pushMessage(attacker.getName() + " killed" + this.getName() + "!");
				}
			}
			this.getMap().removeEntity(this);
		}	
	},
};

Game.Mixins.Pickupable = {
	name: 'Pickupable',
	init: function(template) {
		this.picked = false;
		this.weight = template['weight'] || 0.1;	
	},
	isPicked: function() {
		return this.picked;
	},
	pickedUp: function() {
		this.picked = true;
	},
};

Game.Mixins.Wieldable = {
	name: 'Wieldable',
	init: function(template) {
		this.twoHander = template['twoHander'] || false;
	},
	isTwoHander: function() {
		return this.twoHanded;
	},
};

Game.Mixins.Wearable = {
	name: 'Wearable',
	init: function(template) {
		this.rating = template['rating'] || 0;
	},
	getArmorRating: function() {
		return this.rating;
	},
};
