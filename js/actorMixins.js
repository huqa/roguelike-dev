Game.Mixins.PlayerActor = {
        name: 'PlayerActor',
        groupName: 'Actor', 
	init: function(template) {
		this.energyCoefficient = template['energyCoefficient'] || 16;
		this.waterCoefficient = template['waterCoefficient'] || 14;
		this.energyCounter = 0;
		this.waterCounter = 0;
	},
        act: function() {


                Game.refresh();
                // lock the engine and wait for player input
                this.getMap().getEngine().lock();
        },       
}; 

Game.Mixins.RabbitActor = {
        name: 'RabbitActor',
        groupName: 'Actor',
        init: function() {
		this.foodPath = null;
		this.fp = [];
		this.hasFoodTarget = false;
		this.foodTargetX = 0;
		this.foodTargetY = 0;

		this.drinkPath = null;
		this.dp = [];
		this.hasDrinkTarget = false;
		this.drinkTargetX = 0;
		this.drinkTargetY = 0;

		this.energyCoefficient = 16;
		this.energyCounter = 0;

		this.waterCoefficient = 14;
		this.waterCounter = 0;
	},
        act: function() {

		this.energyCounter += 1;
		if(this.energyCounter % this.energyCoefficient === 0) {
			this.energy -= 1;
			this.energyCounter = 0;
		}

		this.waterCounter += 1;
		if(this.waterCounter % this.waterCoefficient === 0) {
			this.water -= 1;
			this.waterCounter = 0;
		}
		
                // Basic rabbit AI
                // 1) Avoid danger - Ie. monsters and the player
                // 2) If not hungry -> find other rabbit to fuck with
                // 3) if hungry -> find food
                // REPEAT
                var map = this.getMap();
		// find nearby entities
		var nearbyEntities = map.findEntitiesWithinRadius(this.getX(), this.getY(), 6);
		var hostiles = [];
		// check if they creatures, if they are, check if they are hostile, or the player
		for(var i = 0; i < nearbyEntities.length; i++) {
			var e = nearbyEntities[i];
			if(e.hasMixin('PlayerActor')) {
				hostiles.push(e);
			} else if (e.hasMixin('Creature')) {
				if(e.isHostile()) {
					hostiles.push(e);
				}
			}
		}
		if(hostiles.length > 0) {
			this.setDanger(true);
		} else {
			this.setDanger(false);
		}

		if(this.inDanger()) {
			if(this.isInCombat()) {
				// Attack last attacker - with teeth of course
				var adj = map.findEntitiesWithinRadius(this.getX(), this.getY(), 1);
				for(var i = 0; i < adj.length; i++) {
					// Check if target is adjacent
					if(this.getLastCombatTarget() == adj[i]) {
						this.attackTarget(this.getLastCombatTarget(), this.meleeWeapon);	
						return;
					}
				}
				//target mustve been shooting at me :(
				//run away!!!
			}
			var escapeX = 0;
			var escapeY = 0;
			for (var i = 0; i < hostiles.length; i++) {
				var h = hostiles[i];
				if(h.getX() > this.getX()) {
					escapeX = -1;
				} else if(h.getX() < this.getX()) {
					escapeX = 1;
				}

				if(h.getY() > this.getY()) {
					escapeY = -1;
				} else if (h.getY() < this.getY()) {
					escapeY = 1;
				}
			}
			this.move(this.getX()+escapeX, this.getY()+escapeY, map);
		} else {
			// Thirst comes first, a mammal can survive without food for a long time, but not without water
			if(this.isHungry() && this.hasFoodTarget === false && !this.isThirsty()) {
				
				// Check nearby entities for food
				/*for(var i = 0; i < nearbyEntities.length; i++) {
					var e = nearbyEntities[i];
					if(e.hasMixin('Eatable')) {
						this.hasFoodTarget = true;
						this.foodTargetX = e.getX();
						this.foodTargetY = e.getY();
						this.foodPath = new ROT.Path.Dijkstra(this.foodTargetX, this.foodTargetY, map.pathfinderCallback);
						break;
					}
				}*/
				
			        var foodTiles = map.findTilesWithMixinWithinRadius(this.getX(), this.getY(), 6, "CreatureEatable");
				for(var i = 0; i < foodTiles.length; i++) {
					var t = foodTiles[i];
					if(t) {
						this.hasFoodTarget = true;
						this.foodTargetX = t.x;
						this.foodTargetY = t.y;
						this.foodPath = new ROT.Path.Dijkstra(this.foodTargetX, this.foodTargetY, function(x, y) {
							return map.getTile(x, y).isPassable();
						});
						break;
					}
				}


			}
                        if(this.isThirsty() && this.hasDrinkTarget === false) {
                                // Check nearby entities for drink
				/*
                        	for(var i = 0; i < nearbyEntities.length; i++) {
                                        var e = nearbyEntities[i];
                                        if(e.hasMixin('Potable')) {
                                                this.hasDrinkTarget = true;
                                                this.drinkTargetX = e.getX();
                                                this.drinkTargetY = e.getY();
						this.drinkPath = new ROT.Path.Dijkstra(this.drinkTargetX, this.drinkTargetY, map.pathfinderCallback);
                                                break;
                                        }

                                }*/
				var drinkTiles = map.findTilesWithMixinWithinRadius(this.getX(), this.getY(), 6, "Potable");
                                for(var i = 0; i < drinkTiles.length; i++) {
                                        var t = drinkTiles[i];
                                        if(t) {
                                                this.hasDrinkTarget = true;
                                                this.drinkTargetX = t.x;
                                                this.drinkTargetY = t.y;
                                                this.drinkPath = new ROT.Path.Dijkstra(this.drinkTargetX, this.drinkTargetY, function(x, y) {
							return map.getTile(x, y).isPassable();
						});
                                                break;
                                        }
                                }

                        }
			/*if(this.isThirsty() || this.isHungry()) {
				// No targets found but still thirsty/hungry :( -> go somewhere
				if(this.hasDrinktarget === false || this.hasFoodTarget === false) {
					this.move(this.getX()+Tools.getRandomMoveInt(), this.getY()+Tools.getRandomMoveInt(), map);
				}
			}*/
			if(this.hasDrinkTarget === true) {
				var self = this;
				if(this.dp.length <= 0 && this.drinkPath !== null) {
					this.drinkPath.compute(this.getX(), this.getY(), function(x,y) {
						//self.move(x, y, map);
						self.dp.push({"x": x, "y": y});
					});	
				} else {
					if(this.dp.length > 0) {
						var step = this.dp.shift();
						this.move(step.x, step.y, map);
					} else {
						// Cant get to my drink target, find another
						if(this.getX() != this.drinkTargetX && this.getY() != this.drinkTargetY) {
							this.hasDrinkTarget = false;
						}
					}
				}
                                if(this.getX() == this.drinkTargetX && this.getY() == this.drinkTargetY) {
                                        var e = map.getTile(this.drinkTargetX, this.drinkTargetY);
					if(e.hasMixin('Potable')) {
                                        	this.drink(e);
						if(Game.wizardMode === true) {
							console.log("A rabbit is drinking.");
						}
						this.drinkPath = null;
						// Keep drinking if thirsty
						if(!this.isThirsty()) {
							this.hasDrinkTarget = false;
							this.dp = [];
						}
						//Game.getScreen().pushMessage("The rabbit is drinking the water.");
						//this.dp = [];
					}
                                }

			}
			if(this.hasFoodTarget === true) {
				var self = this;
				if(this.fp.length <= 0 && this.foodPath !== null) {
					this.foodPath.compute(this.getX(), this.getY(), function(x,y) {
						//self.move(x, y, map);
						self.fp.push({"x": x, "y": y});
					});
				} else {
					if(this.fp.length > 0) {
                                        	var step = this.fp.shift();
                                        	this.move(step.x, step.y, map);
					} else {
						if(this.getX() != this.drinkTargetX && this.getY() != this.drinkTargetY) {
							this.hasFoodTarget = false;
						}
					}
				}
				if(this.getX() == this.foodTargetX && this.getY() == this.foodTargetY) {
					var e = map.getTile(this.foodTargetX, this.foodTargetY);
					if(e.hasMixin('CreatureEatable')) {
						this.eat(e);
						if(Game.wizardMode === true) {
							console.log("Rabbit is eating.");
						}
						map.exchangeTile(this.getX(), this.getY(), Game.Tile.T.GROUND);
						this.foodPath = null;
						if(!this.isHungry()) {
							this.hasFoodTarget = false;
							this.fp = [];
						}
					}
				}
			}
			// If nothing, do rabbit stuff
			if(!this.isThirsty() && !this.isHungry()) {
				this.move(this.getX()+Tools.getRandomMoveInt(), this.getY()+Tools.getRandomMoveInt(), map);
			}
                        if(this.isThirsty() || this.isHungry()) {
                                // No targets found but still thirsty/hungry :( -> go somewhere
                                if(this.hasDrinktarget === false || this.hasFoodTarget === false) {
                                        this.move(this.getX()+Tools.getRandomMoveInt(), this.getY()+Tools.getRandomMoveInt(), map);
                                }
                        }

		}
        },

};


