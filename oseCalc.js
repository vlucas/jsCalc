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
  this.displayText = '';
  this.onLoadCallbacks = [];
}

oseCalc.prototype.ajaxLoad = function(url, callback, errorCallback) {
  var xmlhttp;
  var obj = this;
  // compatible with IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function(e) {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        var templateContent = xmlhttp.responseText
        callback.call(obj, templateContent);
      } else {
        errorCallback.call(obj);
      }
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
};

/**
 * Initialize calculator at given CSS selector
 */
oseCalc.prototype.init = function(rootId) {
  // Browser must have "document.querySelectorAll" support
  this.supportedBrowser = true;
  if(!document.querySelectorAll) {
    this.display('ERROR: Upgrade Browser');
    this.supportedBrowser = false;
    return;
  }

  // Fix retarded IE 10 issues like this b/c conditional comments were removed
  var doc = document.documentElement;
  doc.setAttribute('data-useragent', navigator.userAgent);

  // Save root element
  this.rootElement = document.getElementById(rootId);
  if(!this.rootElement) {
    alert('oseCalc ERROR: Root element not found via given element ID: ' + rootId);
    return;
  }

  if(this.options.debug) {
    this.log('setDomRoot(' + rootId + ')');
  }

  this.rootElement.innerHTML = '[ Loading calculator... ]';
  this.ajaxLoad('oseCalc.html', function(html) {
    // Success
    this.rootElement.innerHTML = html;

    if(this.supportedBrowser) {
      // Bindings for numbers and functions
      this.bindElements('button.ocNum', this.onClickNumber);
      this.bindElements('button.ocFunc', this.onClickFunction);

      // Equals and Clear operations are special
      this.rootElement.querySelector('.ocEquals').addEventListener('click', this.calculate.bind(this));
      this.rootElement.querySelector('.ocClear').addEventListener('click', this.reset.bind(this));

      // Call all onLoadCallbacks
      var cbLen = this.onLoadCallbacks.length;
      for(var i = 0; i < cbLen; i++) {
        this.onLoadCallbacks[i].call(this);
      }
    }
  }, function() {
    // Error
    this.rootElement.innerHTML = '[ ERROR: Bad response from server ]';
  });
};

/**
 * Bind DOM elements to given curry function
 */
oseCalc.prototype.bindElements = function(selector, fn) {
  var i;
  var el;
  var numbers = this.rootElement.querySelectorAll(selector);
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
      this.log('Number: ' + value);
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
      this.log('Function: ' + value);
    }
    this.displayAppend(value);
  }.bind(this);
};

/**
 * Add function operator button
 */
oseCalc.prototype.addButtonOperator = function(label, operator) {
  this.onLoadCallbacks.push(function() {
    // Add button to HTML page
    var el = this.rootElement.querySelector('.ocCustomOperations');
    el.innerHTML = el.innerHTML + "\n" + '<button data-value="'+operator+'" class="ocFunc">'+label+'</button>';
    // Bind button to click handler
    el.addEventListener('click', this.onClickFunction.call(this));
  });
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
  if(typeof result == "undefined") {
    return this.displayText;
  }
  this.displayText = result;
  if (this.rootElement) {
    var el = this.rootElement.querySelector('.ocDisplayText');
    if(el !== null) {
      el.innerHTML = this.displayText;
    }
  }
  return this.displayText;
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
  if (this.rootElement) {
    var el = this.rootElement.querySelector('.ocDisplayEquation');
    if(el !== null) {
      el.innerHTML = result;
    }
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

