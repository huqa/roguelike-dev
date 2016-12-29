Game.Glyph = function(properties) {
	properties = properties || {};
	this.char = properties['char'] || ' ';
	this.bg = properties['bg'] || '#000000';
	this.fg = properties['fg'] || '#FFFFFF';	
};

Game.Glyph.prototype.getChar = function() {
	return this.char;
};
Game.Glyph.prototype.setChar = function(char) {
	this.char = char;
};
Game.Glyph.prototype.getBg = function() {
	return this.bg;
};
Game.Glyph.prototype.getFg = function() {
	return this.fg;
};

