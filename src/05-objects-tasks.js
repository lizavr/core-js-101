/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => width * height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = Object.create(proto);
  const data = JSON.parse(json);
  Object.assign(obj, data);
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CssSelectorBuilder {
  constructor() {
    this.result = '';
    this.elementCount = 0;
    this.idCount = 0;
    this.pseudoElementCount = 0;
  }

  element(value) {
    this.validateOrder('element');
    if (this.elementCount > 0) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    const selector = new CssSelectorBuilder();
    selector.result = this.result + value;
    selector.elementCount = this.elementCount + 1;
    selector.idCount = this.idCount;
    selector.pseudoElementCount = this.pseudoElementCount;
    selector.previousPart = 'element';
    return selector;
  }

  id(value) {
    this.validateOrder('id');
    if (this.idCount > 0) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    const selector = new CssSelectorBuilder();
    selector.result = `${this.result}#${value}`;
    selector.elementCount = this.elementCount;
    selector.idCount = this.idCount + 1;
    selector.pseudoElementCount = this.pseudoElementCount;
    selector.previousPart = 'id';
    return selector;
  }

  class(value) {
    this.validateOrder('class');
    const selector = new CssSelectorBuilder();
    selector.result = `${this.result}.${value}`;
    selector.elementCount = this.elementCount;
    selector.idCount = this.idCount;
    selector.pseudoElementCount = this.pseudoElementCount;
    selector.previousPart = 'class';
    return selector;
  }

  attr(value) {
    this.validateOrder('attribute');
    const selector = new CssSelectorBuilder();
    selector.result = `${this.result}[${value}]`;
    selector.elementCount = this.elementCount;
    selector.idCount = this.idCount;
    selector.pseudoElementCount = this.pseudoElementCount;
    selector.previousPart = 'attribute';
    return selector;
  }

  pseudoClass(value) {
    this.validateOrder('pseudo-class');
    const selector = new CssSelectorBuilder();
    selector.result = `${this.result}:${value}`;
    selector.elementCount = this.elementCount;
    selector.idCount = this.idCount;
    selector.pseudoElementCount = this.pseudoElementCount;
    selector.previousPart = 'pseudo-class';
    return selector;
  }

  pseudoElement(value) {
    this.validateOrder('pseudo-element');
    if (this.pseudoElementCount > 0) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    const selector = new CssSelectorBuilder();
    selector.result = `${this.result}::${value}`;
    selector.elementCount = this.elementCount;
    selector.idCount = this.idCount;
    selector.pseudoElementCount = this.pseudoElementCount + 1;
    selector.previousPart = 'pseudo-element';
    return selector;
  }

  combine(selector1, combinator, selector2) {
    this.result = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this;
  }

  stringify() {
    const res = this.result;
    this.result = '';
    return res;
  }

  validateOrder(current) {
    const partsOrder = [
      'element',
      'id',
      'class',
      'attribute',
      'pseudo-class',
      'pseudo-element',
    ];

    if (
      this.previousPart
      && partsOrder.indexOf(current) < partsOrder.indexOf(this.previousPart)
    ) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
  }
}

const cssSelectorBuilder = new CssSelectorBuilder();

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
