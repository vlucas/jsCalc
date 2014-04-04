/**
 * oseCalc
 *
 * An embeddable, extensible JavaScript calculator
 *
 * @author Vance Lucas <vance@vancelucas.com>
 * @license BSD 3-clause
 */

// oseCalc
function oseCalc(options) {
  // Options setup
  this.options = {
    debug: false
  };
  for(key in options) {
    this.options[key] = options[key];
  }

  // Variable setup
  this.rootSelector;
  this.displayText;
}

/**
 * Bind DOM elements to given curry function
 */
oseCalc.prototype.setDomRoot = function(rootSelector) {
  this.rootSelector = rootSelector;

  if(this.options.debug) {
    this.log('setDomRoot(' + rootSelector + ')');
  }

  // Browser must have "document.querySelectorAll" support
  if(!document.querySelectorAll) {
    this.display('ERROR: Upgrade Browser');
    return;
  }

  // Bindings for numbers and functions
  this.bindElements(rootSelector + ' button.ocNum', this.onClickNumber);
  this.bindElements(rootSelector + ' button.ocFunc', this.onClickFunction);

  // Equals and Clear operations are special
  document.getElementById('ocFuncEquals').addEventListener('click', this.calculate.bind(this));
  document.getElementById('ocClear').addEventListener('click', this.reset.bind(this));
};

/**
 * Bind DOM elements to given curry function
 */
oseCalc.prototype.bindElements = function(selector, fn) {
  var i;
  var el;
  var numbers = document.querySelectorAll(selector);
  var numLength = numbers.length;
  if(numLength > 0) {
    for(i = 0; i < numLength; i++) {
      el = numbers[i];
      el.addEventListener('click', fn.call(this, el));
    }
  }
};

/**
 * Handle number click events
 */
oseCalc.prototype.onClickNumber = function(el) {
  return function(e) {
    var value = e.target.innerHTML;
    if(this.options.debug) {
      this.log('Clicked Number: ' + value);
    }
    this.displayAppend(value);
  }.bind(this);
};

/**
 * Handle function click events
 */
oseCalc.prototype.onClickFunction = function(el) {
  return function(e) {
    var value = e.target.innerHTML;
    // Value override with 'data-value' attribute (for division)
    if(typeof e.target.attributes['data-value'] != "undefined") {
      value = e.target.attributes['data-value'].value;
    }
    if(this.options.debug) {
      this.log('Clicked Function: ' + value);
    }
    this.displayAppend(value);
  }.bind(this);
};

/**
 * Log messages (mostly for debugging purposes)
 */
oseCalc.prototype.log = function(msg) {
  if (typeof console != "undefined") {
    console.log(msg);
  }
};

/**
 * Get or set calculator display to the given text
 *
 * @return string
 */
oseCalc.prototype.display = function(result) {
  var el = document.getElementById('ocDisplayText');
  if(typeof result == "undefined") {
    if(el && el.length) {
      return el.innerHTML;
    }
    return this.displayText;
  }
  this.displayText = result;
  if(el && el.length) {
    el.innerHTML = this.displayText;
  }
  return result;
};

/**
 * Append text to the end of the current display
 */
oseCalc.prototype.displayAppend = function(result) {
  this.display(this.display() + '' + result);
};

/**
 * Set the equation display
 */
oseCalc.prototype.displayEquation = function(result) {
  var el = document.getElementById('ocDisplayEquation');
  if(el && el.length) {
    el.innerHTML = result;
  }
  return result;
};

/**
 * Calculate answer based on input formula
 */
oseCalc.prototype.calculate = function() {
  var equation = this.display();
  var result;
  try {
    result = eval(equation);
  } catch(e) {
    result = 'ERROR: Bad Input';
  }
  this.displayEquation(equation);
  this.display(result);
  return result;
};

/**
 * Reset calcultor state (clear memory)
 */
oseCalc.prototype.reset = function() {
  this.displayEquation('');
  this.display('');
};


// Module exports for node.js test runner
if(typeof module != "undefined" && typeof module.exports != "undefined") {
  module.exports.oseCalc = oseCalc;
}
