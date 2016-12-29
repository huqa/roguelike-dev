Game.Tile = function(properties) {
	properties = properties || {};

	Game.Glyph.call(this, properties);

	this.name = properties['name'] || 'none';

	this.passable = properties['isPassable'] || false;
	this.diggable = properties['isDiggable'] || false;
	this.swimmable = properties['isSwimmable'] || false;
	this.door = properties['door'] || false;
	this.open = properties['isOpen'] || false;

	this.attachedMixins = {};
	this.attachedMixinGroups = {};
	var mixins = properties['mixins'] || [];
        for(var i = 0; i < mixins.length; i++) {
                for(var key in mixins[i]) {
                        if(key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
                                this[key] = mixins[i][key];
                        }
                }
                this.attachedMixins[mixins[i].name] = true;

                if (mixins[i].groupName) {
                        this.attachedMixinGroups[mixins[i].groupName] = true;
                }

                // Call the mixins init
                if(mixins[i].init) {
                        mixins[i].init.call(this, properties);
                }
        }
};

Game.Tile.extend(Game.Glyph);

Game.Tile.prototype.getName = function() {
	return this.name;
};
Game.Tile.prototype.getGlyph = function() {
	return this.glyph;
};
Game.Tile.prototype.isPassable = function() {
	return this.passable;
};
Game.Tile.prototype.isDiggable = function() {
	return this.diggable;
};
Game.Tile.prototype.isSwimmable = function() {
	return this.swimmable;
};
Game.Tile.prototype.isDoor = function() {
	return this.door;
};
Game.Tile.prototype.isOpen = function() {
	return this.open;
};

Game.Tile.prototype.hasMixin = function(obj) {
        // Allow passing of object or string
        if(typeof obj === 'object') {
                return this.attachedMixins[obj.name];
        } else {
                return this.attachedMixins[obj] || this.attachedMixinGroups[obj];
        }       
};

