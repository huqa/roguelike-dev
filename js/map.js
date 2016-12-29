Game.Map = function(tiles) {
	this.tiles = tiles;
	this.height = this.tiles.length;
	this.width = this.tiles[0].length;
	
	this.days = 0;

	// Time of day goes from 0 to 3600
	this.timeOfDay = 0;
	this.timesOfDay = ['Morning', 'Afternoon', 'Evening', 'Night'];

	this.entities = [];
	this.scheduler = new ROT.Scheduler.Simple();
	this.engine = new ROT.Engine(this.scheduler);
};

Game.Map.prototype.getWidth = function() {
	return this.width;
};

Game.Map.prototype.getHeight = function() {
	return this.height;
};

Game.Map.prototype.getTile = function(x, y) {
	if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
		return Game.Tile.T.VOID;
	} else {
		return this.tiles[y][x] || Game.Tile.T.GROUND;
	}
};

Game.Map.prototype.exchangeTile = function(x, y, newTile) {
	var tile = this.getTile(x, y);
	this.tiles[y][x] = newTile;
};

Game.Map.prototype.getScheduler = function() {
	return this.scheduler;
};

Game.Map.prototype.getEngine = function() {
	return this.engine;
};

Game.Map.prototype.tickTime = function() {
	this.timeOfDay += 1;
	if(this.timeOfDay >= 3600) {
		this.timeOfDay = 0;
		this.days += 1;
	}
},

Game.Map.prototype.getTimeOfDay = function() {
	return this.timeOfDay;
};

Game.Map.prototype.getTimeOfDayString = function() {
	if(this.timeOfDay >= 0 && this.timeOfDay < 900) {
		return this.timesOfDay[0];
	} else if (this.timeOfDay >= 900 && this.timeOfDay < 1800) {
		return this.timesOfDay[1];
	} else if (this.timeOfDay >= 1800 && this.timeOfDay < 2700) {
		return this.timesOfDay[2];
	} else if (this.timeOfDay >= 2700 && this.timeOfDay < 3600) {
		return this.timesOfDay[3];
	}
};

Game.Map.prototype.addEntity = function(entity) {
	var ex = entity.getX();
	var ey = entity.getY();
	if(ex < 0 || ex >= this.width || ey < 0 || ey >= this.height) {
		throw new Error("Trying to add entity out of bounds");
	}

	entity.setMap(this);
	this.entities.push(entity);
	
	// Automagically add actors to the scheduler
	if(entity.hasMixin('Actor')) {
		this.scheduler.add(entity, true);
	}
};

Game.Map.prototype.removeEntity = function(entity) {
	for(var i = 0; i < this.entities.length; i++) {
		if(this.entities[i] == entity) {
			this.entities.splice(i, 1);
			break;
		}
	}
	if(entity.hasMixin('Actor')) {
		this.scheduler.remove(entity);
	}
};

Game.Map.prototype.getEntities = function() {
	return this.entities;
};

Game.Map.prototype.getEntitiesForRendering = function() {
	var renderEntities = [];
	for(var i = 0; i < this.entities.length; ++i) {
		var entity = this.entities[i];
		if(entity.hasMixin('Pickupable')) {
			if(!entity.isPicked()) {
				this.renderEntities.push(entity);
			} 
		} else {
			this.renderEntities.push(entity);
		}
	}
	return renderEntities;
};

Game.Map.prototype.getEntitiesAt = function(x, y) {
	var entityList = [];
	for(var i = 0; i < this.entities.length; i++) {
		if(this.entities[i].getX() == x && this.entities[i].getY() == y) {
			if(!this.entities[i].hasMixin('PlayerActor')) {
				entityList.push(this.entities[i]);
			}
		}
	}
	if(entityList.length > 0) {
		return entityList;
	} else {
		return false;
	}
};

Game.Map.prototype.setTile = function(tile, x, y) {
	if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
		throw new Error('Trying to set tile out of bounds!');
	}
	this.tiles[y][x] = tile;
};

Game.Map.prototype.findEntitiesWithinRadius = function(cx, cy, radius) {
	var leftX = cx - radius;
	var topY = cy - radius;
	var rightX = cx + radius;
	var bottomY = cy + radius;
	var ex = 0;
	var ey = 0;
	var results = [];
	for(var i = 0; i < this.entities.length; i++) {
		ex = this.entities[i].getX();
		ey = this.entities[i].getY();
		if(ex >= leftX && ex <= rightX && ey >= topY && ey <= bottomY) {
			results.push(this.entities[i]);
		}
	}
	return results;
};

Game.Map.prototype.findEntitiesWithMixinWithinRadius = function(cx, cy, radius, mixin) {
        var leftX = cx - radius;
        var topY = cy - radius;
        var rightX = cx + radius;
        var bottomY = cy + radius;
        var ex = 0;
        var ey = 0;
        var results = [];
        for(var i = 0; i < this.entities.length; i++) {
                ex = this.entities[i].getX();
                ey = this.entities[i].getY();
                if(ex >= leftX && ex <= rightX && ey >= topY && ey <= bottomY) {
			if(this.entities[i].hasMixin(mixin)) {
                        	results.push(this.entities[i]);
			}
                }
        }
        return results;
};

Game.Map.prototype.findTargetEntitiesWithinRadius = function(cx, cy, radius) {
	//console.log(radius);
        var leftX = cx - radius;
        var topY = cy - radius;
        var rightX = cx + radius;
        var bottomY = cy + radius;
	//console.log(leftX, rightX, topY, bottomY);
        var ex = 0;
        var ey = 0;
        var results = [];
	//var ch = 97;
	//var ch_end = 121;
	var ch = 65;
	var ch_end = 90;
        for(var i = 0; i < this.entities.length; i++) {
		var entity = this.entities[i];
                ex = entity.getX();
                ey = entity.getY();
                if(ex >= leftX && ex <= rightX && ey >= topY && ey <= bottomY) {
			if(!entity.hasMixin('PlayerActor')) {
                        	if(entity.hasMixin('Combat') || entity.hasMixin('Destructible')) {
                                	results.push({"key": String.fromCharCode(ch), "entity": entity });
					ch++;
                        	}
			}
                }
        }
        return results;
};

Game.Map.prototype.getEntitiesForPickup = function(x, y) {
	var ch = 65;
	var ch_end = 90;
	var entityList = [];
	for(var i = 0; i < this.entities.length; i++) {
		var entity = this.entities[i];
		if(entity.getX() === x && entity.getY() === y && !entity.hasMixin('PlayerActor')) {
			entityList.push({"key": String.fromCharCode(ch), "entity": entity});
			ch++;
		}
	}
	return entityList;
};


Game.Map.prototype.findTilesWithinRadius = function(cx, cy, radius, tileName) {
        var ex = cx - radius;
        var ey = cy - radius;

	if(ey < 0) { ey = 0; }
	if(ex < 0) { ex = 0; }

        var results = [];
	var t;
        for(var y = ey; y < cy+radius; y++) {
		for(var x = ex; x < cx+radius; x++) {
			t = this.getTile(x, y);
			if(tileName === t.name) {
				results.push({"x": x, "y": y, "tile": t});
			}
		}
        }
        return results;
};

Game.Map.prototype.findTilesWithMixinWithinRadius = function(cx, cy, radius, tileMixin) {
        var diameter = radius * 2;
        var ex = cx - radius;
        var ey = cy - radius;
        var results = [];
        var t;
        for(var y = ey; y < cy+radius; y++) {
                for(var x = ex; x < cx+radius; x++) {
                        t = this.getTile(x, y);
                        if(t.hasMixin(tileMixin)) {
                                results.push({"x": x, "y": y, "tile": t});
                        }
                }
        }
        return results;
};

