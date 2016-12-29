Game.Entity = function(properties) {
	properties = properties || {};
	Game.Glyph.call(this, properties);

	this.name = properties['name'] || '';
	this.x = properties['x'] || 0;
	this.y = properties['y'] || 0;

	// Create a mixin-object to store our mixins.
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
	this.map = null;
};

Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.setName = function(name) {
	this.name = name;
};

Game.Entity.prototype.setX = function(x) {
	this.x = x;
};
Game.Entity.prototype.setY = function(y) {
	this.y = y;
};
Game.Entity.prototype.getName = function() {
	return this.name;
};
Game.Entity.prototype.getX = function() {
	return this.x;
};
Game.Entity.prototype.getY = function() {
	return this.y;
};
Game.Entity.prototype.setMap = function(map) {
	this.map = map;
};
Game.Entity.prototype.getMap = function() {
	return this.map;
};

Game.Entity.prototype.hasMixin = function(obj) {
	// Allow passing of object or string
	if(typeof obj === 'object') {
		return this.attachedMixins[obj.name];
	} else {
		return this.attachedMixins[obj] || this.attachedMixinGroups[obj];
	}
};

Game.Entity.prototype.addMixin = function(mixin) {
	for(var key in mixin) {
		if(key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
			this[key] = mixin[key];
		}
	}
	this.attachedMixins[mixin.name] = true;

	if (mixin.groupName) {
		this.attachedMixinGroups[mixins.groupName] = true;
	}

	// Call the mixins init
	if(mixin.init) {
		mixin.init.call(this, properties);
	}
};
