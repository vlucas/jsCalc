/**
 * Jasmine 2.0 tests
 */

describe('Calculator Equations', function() {
  var calc;

  beforeEach(function() {
    calc = new oseCalc();
  });

  it('should calculate multiple addition', function() {
    calc.display('3+4+5');
    expect(calc.calculate()).toBe(12);
  });

  it('should calculate multiple operators', function() {
    calc.display('3*4/5');
    expect(calc.calculate()).toBe(2.4);
  });

  it('should follow order of operations', function() {
    calc.display('48 / 3 + 5');
    expect(calc.calculate()).toBe(21);
  });

  it('should follow more complex order of operations', function() {
    calc.display('12 / 3 + 4 -24 / 3 * 8');
    expect(calc.calculate()).toBe(-56);
  });

  it('should handle large number input with exponential notation', function() {
    calc.display('99999999999 * 999999999999');
    expect(calc.calculate()).toBe(9.99999999989e+22);
  });

  it('should handle eval parsing errors', function() {
    calc.display('hurrr durrr');
    expect(calc.calculate()).toBe('ERROR: Bad Input');
  });

});

