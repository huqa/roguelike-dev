
var GameScreen = function() {

	this.centerX = 0;
	this.centerY = 0;

        this.worldWidth = 150;
        this.worldHeight = 150;

	this.statsX = 25;
	this.statsY = 20;

	this.logX = 70;
	this.logY = 15;

	this.logBuffer = [];

	this.tiles = [];
	this.map = null;

	this.worldFactory = null;
	this.display = null;

	this.player = null;
	
	// Screen modes
	// log viewer mode - not yet implemented
	this.logViewMode = false;
	// targeting mode
	this.targetingMode = false;
	// pickup mode for choosing multiple entities
	this.pickupMode = false;
	// inventory mode
	this.inventoryMode = false;
	this.wieldMode = false;
	this.equipMode = false;

	// Mode specific entity lists
	this.targetEntities = [];
	this.pickupEntities = [];
	this.inventoryEntities = [];
};

GameScreen.prototype = {

	init: function(display) {
		console.log("Game screen init.");
		this.display = display;
		this.worldFactory = new WorldFactory(this.worldWidth, this.worldHeight);
		this.initWorld();
		this.map = new Game.Map(this.tiles);
		this.addEntities();
                this.pushMessage("Welcome to huqas roguelike development platform!");
                this.pushMessage("The time is: " + new Date());
		this.map.getEngine().start();
	},

	finalize: function() { console.log("Finalized game screen"); },

	render: function() {
		//this.drawDisplay();
		var width = Game.getScreenX() - this.statsX;
		var height = Game.getScreenY() - this.logY;

		var topLeftX = Math.min(Math.max(0, this.player.getX() - Math.floor((width / 2))), this.map.getWidth() - width);
		var topLeftY = Math.min(Math.max(0, this.player.getY() - Math.floor((height / 2))), this.map.getHeight() - height);
		// Dont render the map if in pickup-mode
		if(this.pickupMode === false && this.inventoryMode === false) { 
			for(var y = topLeftY; y < topLeftY + height; y++) {
				for(var x = topLeftX; x < topLeftX + width; x++) {
					var tile = this.map.getTile(x,y);
					this.display.draw(
						x - topLeftX,
						y - topLeftY,
						tile.getChar(),
						tile.getFg(),
						tile.getBg()
					);
				}
			}
		
			// Render entities
			var entities = this.map.getEntities();
			for(var i = 0; i < entities.length; i++) {
				var entity = entities[i];
				if(!entity.hasMixin('PlayerActor') && entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
					entity.getX() < topLeftX + width &&
					entity.getY() < topLeftY + height) {
					this.display.draw(entity.getX() - topLeftX,
							 entity.getY() - topLeftY,
							 entity.getChar(),
							 entity.getFg(),
							 entity.getBg()
					);
				}
			}
			this.display.draw(this.player.getX() - topLeftX, this.player.getY() - topLeftY, this.player.getChar(), this.player.getFg(), this.player.getBg());
		} else if(this.pickupMode === true && this.inventoryMode === false) {
			// list items to pick up
			this.display.drawText(1,1, 'Select items to pick up. ESC to cancel.');
			var entities = this.pickupEntities;
			for(var i = 0; i < entities.length; i++) {
				var text = entities[i].key.toLowerCase() + " - " + entities[i].entity.getName();
				this.display.drawText(1,2+i, text);
			}
		} else if(this.pickupMode === false && this.inventoryMode === true) {
			if(this.wieldMode === false && this.equipMode === false) {
				this.display.drawText(1,1, 'Inventory');
				this.display.drawText(1,2, 'Press "w" to equip weapons, "e" to equip clothes/armor. ESC to quit/cancel.', width);
				for(var i = 0; i < this.inventoryEntities.length; i++) {
					var text = this.inventoryEntities[i].entity.getName();
					if(this.player.isEquipped(this.inventoryEntities[i].entity)) { text += " (Equipped)"; }	
					this.display.drawText(1,5+i, text);
				}
			}
			if(this.wieldMode === true) {
                                this.display.drawText(1,1, 'Inventory - equip');
                                this.display.drawText(1,2, 'Press key to equip weapon. ESC to cancel.');
                                for(var i = 0; i < this.inventoryEntities.length; i++) {
					var e = this.inventoryEntities[i];
					if(e.entity.hasMixin('Wieldable')) {
                                        	this.display.drawText(1,4+i, e.key.toLowerCase() + " - " + e.entity.getName());
					}
                                }
			}
			if(this.equipMode === true) {
                                this.display.drawText(1,1, 'Inventory - equip');
                                this.display.drawText(1,2, 'Press key to equip clothes/armor. ESC to cancel.');
                                for(var i = 0; i < this.inventoryEntities.length; i++) {
                                        var e = this.inventoryEntities[i];
                                        if(e.entity.hasMixin('Wearable')) {
                                                this.display.drawText(1,4+i, e.key.toLowerCase() + " - " + e.entity.getName());
                                        }
                                }
			}
		}
		if(this.targetingMode === true) {
			if(this.targetEntities.length > 0) {
				this.pushMessage('Select target:');
				for(var i = 0; i < this.targetEntities.length; i++) {
					var target = this.targetEntities[i];
					this.display.draw(target.entity.getX() - topLeftX,
							 target.entity.getY() - topLeftY,
							 target.key.toLowerCase(),
							 'black',
							 'white');
					this.pushMessage(target.key.toLowerCase() + " - " + target.entity.getName());
				}
			} else {
				this.pushMessage("No targets in range.");
				this.targetingMode = false;
			}
		}
		this.drawBorders();
		this.drawStatus();
		this.drawLog();
	
	},

	handleInput: function(type, data) {
		if(type === 'keydown') {
			if(this.targetingMode === false && this.logViewMode === false 
			   && this.pickupMode === false && this.inventoryMode === false) {
                		switch(data.keyCode) {
                        		case ROT.VK_UP:
	                                	this.move(0,(-1));
						this.map.tickTime();
						this.map.getEngine().unlock();
                        			break;
                        		case ROT.VK_DOWN:
                                		this.move(0, 1);
						this.map.tickTime();
						this.map.getEngine().unlock();
	                        		break;
	                        	case ROT.VK_LEFT:
	                                	this.move((-1), 0);
						this.map.tickTime();
						this.map.getEngine().unlock();
	                               		break;
                        		case ROT.VK_RIGHT:
	                                	this.move(1, 0);
						this.map.tickTime();
						this.map.getEngine().unlock();
                        			break;
					case ROT.VK_F:
						// Fire -- targeting
						if(this.player.rangedWeapon !== null) {
							this.targetingMode = true;
							
							this.targetEntities = this.map.findTargetEntitiesWithinRadius(this.player.getX(), this.player.getY(), this.player.rangedWeapon.weaponRadius);
							
							this.pushMessage("Targeting Mode - press ESC to cancel");
							this.pushMessage("Using " + this.player.rangedWeapon.getName());
							this.map.getEngine().unlock();
							break;
						}
						this.pushMessage("You don't have ranged weapons to fire.");
						this.map.getEngine().unlock();
						break;
					case ROT.VK_COMMA:
						var x = this.player.getX();
						var y = this.player.getY();
						var ents = this.map.getEntitiesAt(x, y);
						if(!ents) {
							// No items on ground
							this.pushMessage('Nothing to pickup');
							this.drawLog();
							break;
						} else {
							if(ents.length > 1) {
								this.pickupEntities = this.map.getEntitiesForPickup(x, y);
								this.pickupMode = true;	
								this.map.getEngine().unlock();
								break;
							}
							for(var i = 0; i < ents.length; i++) {
								var ent = ents[i];
								if(ent.hasMixin('Pickupable')) {
									this.player.pickUp(ent);
									this.map.tickTime();
									this.map.getEngine().unlock();
									break;
								}
							}
						}
						break;
					case ROT.VK_I:
						this.inventoryEntities = this.player.getInventory();
						this.inventoryMode = true;
						this.map.getEngine().unlock();
						break;
                		}
			} else if (this.targetingMode === true) {
				if(data.keyCode === ROT.VK_ESCAPE) {
					this.targetingMode = false;
					this.pushMessage('Ok then');
					this.drawLog();
				}
				// Press ESC to leave targeting mode, or select target
				if (this.targetEntities.length > 0) {
					for(var i = 0; i < this.targetEntities.length; i++) {
						var target = this.targetEntities[i];
						if(data.keyCode === target.key.charCodeAt(0)) {
							// fire weapon
							this.player.attackTarget(target.entity, this.player.rangedWeapon);
							this.targetingMode = false;
							this.map.tickTime();
							this.map.getEngine().unlock();
							break;
						}
					}
					//this.pushMessage("That's not correct...");
				}
			} else if (this.pickupMode === true) {
				if(data.keyCode === ROT.VK_ESCAPE) {
					this.pickupMode = false;
					this.map.getEngine().unlock();
				}
				for(var i = 0; i < this.pickupEntities.length; i++) {
					if(data.keyCode === this.pickupEntities[i].key.charCodeAt(0)) {
						this.player.pickUp(this.pickupEntities[i].entity);
						this.pickupMode = false;
						this.map.tickTime();
						this.map.getEngine().unlock();
					}
				}
			} else if (this.inventoryMode === true) {
				if(this.wieldMode === false && this.equipMode === false) {
					if(data.keyCode === ROT.VK_W) {
						this.wieldMode = true;
						this.map.getEngine().unlock();
					} else if (data.keyCode === ROT.VK_E) {
						this.equipMode = true;
						this.map.getEngine().unlock();
					} else if (data.keyCode === ROT.VK_ESCAPE) {
						this.inventoryMode = false;
						this.map.getEngine().unlock();
					}
				}
				if(this.wieldMode === true) {
					for(var i = 0; i < this.inventoryEntities.length; i++) {
						if(data.keyCode === this.inventoryEntities[i].key.charCodeAt(0)) {
							var e = this.inventoryEntities[i].entity;
							this.player.equip(e);
							this.wieldMode = false;
							this.map.getEngine().unlock();
						}
					}
					if (data.keyCode === ROT.VK_ESCAPE) {
                                                this.wieldMode = false;
						this.map.getEngine().unlock();
                                        }
				} else if (this.equipMode === true) {
					for(var i = 0; i < this.inventoryEntities.length; i++) {
                                                if(data.keyCode === this.inventoryEntities[i].key.charCodeAt(0)) {
                                                        var e = this.inventoryEntities[i].entity;
                                                        this.player.equip(e);
							this.equipMode = false;
							this.map.getEngine().unlock();
                                                }
                                        }
					if (data.keyCode === ROT.VK_ESCAPE) {
                                                this.equipMode = false;
						this.map.getEngine().unlock();
                                        }
				}
			}
		}
	},

	initWorld: function() {
		this.tiles = this.worldFactory.generate();
	},

	drawBorders: function() {
		// vertical line
                var vStartX = Game.getScreenX() - this.statsX;
		var vEndY = Game.getScreenY() - this.logY;
		for(var y = 0; y < vEndY; y++) {
			this.display.draw(vStartX, y, '║', "#FFFFFF");
		}
		// horizontal line
		for(var x = 0; x < vStartX; x++) {
			this.display.draw(x, vEndY, '═', '#FFFFFF');
		}
		// corner piece
		this.display.draw(vStartX, vEndY, '╝', "#FFFFFF");
		
	},

	drawLog: function() {
		var k = this.logBuffer.length -1;
		var startY = Game.getScreenY() - this.logY + 1;
		var logToDraw = this.logBuffer.slice(-13);
		for(var l = 0; l < logToDraw.length; l++) {
			this.display.drawText(0, startY+l, logToDraw[l], Game.getScreenX());
			
		}
	},

	pushMessage: function(msg) {
		if(this.logBuffer.length > 50) {
			this.logBuffer = this.logBuffer.slice(1);
		}
		this.logBuffer.push(msg);
	},

	drawStatus: function() {
		//var status = this.player.getStatus();
		this.display.drawText(Game.getScreenX() - this.statsX+2, 1, "Time of day: " + this.map.getTimeOfDayString());
		this.display.drawText(Game.getScreenX() - this.statsX+2, 3, "Hitpoints: " + this.player.getHP() + "/" + this.player.maxHp);
		this.display.drawText(Game.getScreenX() - this.statsX+2, 4, "Speed: " + this.player.getSpeed());
		this.display.drawText(Game.getScreenX() - this.statsX+2, 5, "Energy: " + this.player.energy);
	},

	move: function(mx, my) {
		var cx = this.player.getX() + mx;
		var cy = this.player.getY() + my;
		this.player.move(cx, cy, this.map);
	},

	addEntities: function() {
		// Add entities
                this.player = new Game.Player();
                this.map.addEntity(this.player);

		var entities = this.worldFactory.getEntities();
		for(var i = 0; i < entities.length; i++) {
			this.map.addEntity(entities[i]);
		}
	},

};


