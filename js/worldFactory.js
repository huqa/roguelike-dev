var WorldFactory = function(width, height) {

	this.worldWidth = width;
	this.worldHeight = height;

	this.map = [];

	this.entityList = [];

	this.rabbitCount = 7;
};

WorldFactory.prototype = {

	init: function() {
		for(var y = 0; y < this.worldHeight; ++y) {
			var row = [];
			for(var x = 0; x < this.worldWidth; ++x) {
				row.push(Game.Tile.T.GROUND);
			}
			this.map.push(row);
		}
                this.generateForests();
                this.generateLakes();
                this.generatePlants();
                this.generateHouses();
                this.generateCreatures();
                this.generateItems();
	},

	/**             
	 * Generates house with dimension width and height. sx and sy are the starting indices.
	 */     
	generateHouse: function(width, height, sx, sy) {
		for(var y = sy-height; y < sy+height; y++) {
			for(var x = sx-width; x < sx+width; x++) {
				this.map[y][x] = Game.Tile.T.HOUSE_FLOOR;
				// first row of the house
				if(y === (sy-height) && x === (sx-width)) {
					this.map[y][x] = Game.Tile.T.HOUSE_ULC_WALL;
				} else if (y === (sy-height) && x !== (sx+width-1)) {
					this.map[y][x] = Game.Tile.T.HOUSE_H_WALL;
				} else if (y === (sy-height) && x === (sx+width-1)) {
					this.map[y][x] = Game.Tile.T.HOUSE_URC_WALL;
				}

				if(y > (sy-height) && y < (sy+height-1)) {
					if(x === sx-width || x === (sx+width-1)) {
						this.map[y][x] = Game.Tile.T.HOUSE_V_WALL;
					}
				}

				if(y === (sy+height-1) && x === sx-width) {
					this.map[y][x] = Game.Tile.T.HOUSE_LLC_WALL;
				} else if (y === (sy+height-1) && x !== (sx+width-1)) {
					this.map[y][x] = Game.Tile.T.HOUSE_H_WALL;
				} else if (y === (sy+height-1) && x === (sx+width-1)) {
					this.map[y][x] = Game.Tile.T.HOUSE_LRC_WALL;
				}
			}
		}
		var side = Math.random();
		var ym = this.getRandomInt(1,5);
		var xm = this.getRandomInt(1,5);
		if(side >= 0 && side < 0.25) {
			this.map[(sy-height)][(sx-width+xm)] = Game.Tile.T.DOOR_CLOSED;
		} else if(side >= 0.25 && side < 0.50) {
			this.map[(sy-height+ym)][(sx-width)] = Game.Tile.T.DOOR_CLOSED;
		} else if(side >= 0.50 && side < 0.75) {
			this.map[(sy+height-1)][(sx-width+xm)] = Game.Tile.T.DOOR_CLOSED;
		} else if(side >= 0.75 && side <= 1) {
			this.map[(sy-height+ym)][(sx+width-1)] = Game.Tile.T.DOOR_CLOSED;
		}
	},

	generate: function() {
		this.init();
		/*this.generateForests();
		this.generateLakes();
		this.generatePlants();
		this.generateHouses();
		this.generateCreatures();
		this.generateItems();*/
		return this.map;
	},

	generateHouses: function() {
		var hx = this.worldWidth / 2;
		var hy = this.worldHeight / 2;
		for(var i = 0; i < 360; i = i + 72) {
			var kx = hx + Math.floor((22 * Math.sin(i * (Math.PI / 180))));
			var ky = hy + Math.floor((22 * Math.cos(i * (Math.PI / 180))));
			this.generateHouse(this.getRandomInt(3,10), this.getRandomInt(3,10), kx, ky);
		}               
	},

	generateLakes: function() {
		//var halfWidth =	Math.floor(this.worldWidth/2);
		//var halfHeight = Math.floor(this.worldHeight/2);
		
		var lakeZones = [];
		
			var rx = 0;
			var ry = 0;
			var w = this.worldWidth;
			var h = this.worldHeight;
			lakeZones.push({x: rx, y: ry, width: w, height: h});

		for(var i = 0; i < lakeZones.length; i++) {
			var zone = lakeZones[i];
			var area = this.generateRandomArea(Game.Tile.T.GROUND, Game.Tile.T.WATER, zone.x, zone.y, zone.width, zone.height, 0.61);
			area = this.smoothArea(area, 12, zone.x, zone.y, zone.width, zone.height, Game.Tile.T.WATER, Game.Tile.T.GROUND);
			this.mergeAreaToMap(area);
		}

	},

	smoothArea: function(area, iterations, sx, sy, width, height, glyph1, glyph2) {
		for(var it = 0; it < iterations; it++) {
			for(var y = sy; y < height+sy; y++) {
				for(var x = sx; x < width+sx; x++) {
					var g1 = 0;
					var g2 = 0;
					for(var oy = -1; oy < 2; oy++) {
						for(var ox = -1; ox < 2; ox++) {
							if(x + ox < 0 || x + ox >= width+sx || y + oy < 0 || y + oy >= height+sy) {
								continue;
							}
							if (y+oy >= 0 && y+oy <= (this.worldHeight-1) && x+ox >= 0 && x+ox <= (this.worldWidth-1)) {
	
								if(area[y+oy][x+ox].getName() == glyph1.getName()) {
									g1++;
								} else {
									g2++;
								}
							}
						}
					}
					if (y >= 0 && y <= (this.worldHeight-1) && x >= 0 && x <= (this.worldWidth-1)) {
						area[y][x] = g1 >= g2 ? glyph1 : glyph2;
					}
				}
			}
		}
		return area;
	},

	generateRandomArea: function(glyph1, glyph2, sx, sy, width, height, prob) {
		var area = [];
		if(typeof prob === 'undefined') {
			prob = 0.5;
		}
		for(var y = sy; y < sy+height; y++) {
			var row = [];
			for(var x = sx; x < sx+width; x++) {
				if (y >= 0 && y <= (this.worldHeight-1) && x >= 0 && x <= (this.worldWidth-1)) {
					row.push(Math.random() < prob ? glyph1 : glyph2);
				}
			}
			area.push(row);
		}
		return area;
	},

	generateForests: function() {
		var area = this.generateRandomArea(Game.Tile.T.GROUND, Game.Tile.T.TREE, 0, 0, this.worldWidth, this.worldHeight, 0.595);
		area = this.smoothArea(area, 8, 0, 0, this.worldWidth, this.worldHeight, Game.Tile.T.TREE, Game.Tile.T.GROUND);
		this.mergeAreaToMap(area);
	},

	generatePlants: function() {
		for(var y = 0; y < this.worldHeight; y++) {
			for(var x = 0; x < this.worldWidth; x++) {
				if(this.map[y][x].getName() === Game.Tile.T.GROUND.getName()) {
					if (Math.random() < 0.8) {
						this.map[y][x] = Math.random() < 0.8 ? Game.Tile.T.GROUND : Game.Tile.T.SHRUB;
					} else {
						this.map[y][x] = Math.random() < 0.95 ? Game.Tile.T.GROUND : Game.Tile.T.FLOWER;
					}
				}
			}
		}
	},

	mergeAreaToMap: function(area) {
		for(var y = 0; y < this.worldHeight; y++) {
			for(var x = 0; x < this.worldWidth; x++) {
				if(area[y][x].getName() !== Game.Tile.T.GROUND.getName()) {
					this.map[y][x] = area[y][x];
				}
			}
		}
	},

	getEntities: function() {
		return this.entityList;
	},

	getMap: function() {            
		return this.map;
	},              

	getRandomInt: function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	},

	generateItems: function() {
		var gunCount = 4;
                var x = 1;
                var y = 1;
                for(var i = 0; i < gunCount; i++) {
                        var rt = new Game.Entity(Game.PistolTemplate);
                            do {
                                x = ROT.RNG.getUniformInt(1, this.worldWidth);
                                y = ROT.RNG.getUniformInt(1, this.worldHeight);
                            } while(!this.map[y][x].isPassable());
                        
                            rt.x = x;
                            rt.y = y;
			    var pt = new Game.Entity(Game.PistolTemplate);
			    pt.x = x;
			    pt.y = y;
                            this.entityList.push(rt);
			    this.entityList.push(pt);
                }		
	},	

	generateCreatures: function() {
		this.generateRabbits();		
	},

	generateRabbits: function() {
		this.rabbitCount = this.getRandomInt(2, 7);
		var x = 0;
		var y = 0;
		for(var i = 0; i < this.rabbitCount; i++) {
			var rt = new Game.Entity(Game.RabbitTemplate);
			do {
				x = ROT.RNG.getUniformInt(1, this.worldWidth);
				y = ROT.RNG.getUniformInt(1, this.worldHeight);
			} while(!this.map[y][x].isPassable());
			rt.x = x;
			rt.y = y;
			rt.energy = ROT.RNG.getUniformInt(50, 120);
			rt.water = ROT.RNG.getUniformInt(50, 120);
			this.entityList.push(rt);
		}
	},

}; 
