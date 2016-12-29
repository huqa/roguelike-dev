/**
 * Some useful tools.
 *
 */
var Tools = {
	inheritPrototype: function(childObject, parentObject) {
		var copyOfParent = Object.create(parentObject.prototype);
		copyOfParent.constructor = childObject;
		childObject.prototype = copyOfParent;
	},
	getRandomMoveInt: function() {
		var m = Math.random();
		if(m <= 0.33) {
			return -1;
		} else if(m > 0.33 && m <= 0.66) {
			return 0;
		} else {
			return 1;
		}
	},
	getBaseLog: function(base, y) {
		return Math.log(y) / Math.log(base);
	},
};
