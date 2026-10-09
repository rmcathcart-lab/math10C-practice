/* The course: units and lessons in booklet order. A lesson with a lesson file (HW.lessons[id]) is open;
 * the rest show as "coming soon". Titles match the revised booklets. */
(function (root) {
  'use strict';
  root.HW = root.HW || {};
  root.HW.CATALOG = [
    { unit: 1, title: 'Number', outcomes: 'AN1 · AN2', lessons: [
      { id: 'u1l1', num: '1', title: 'Prime Building Blocks of Numbers' },
      { id: 'u1l2', num: '2', title: 'Prime Factorization at Work: GCF, LCM, and Perfect Powers' },
      { id: 'u1l3', num: '3', title: 'Rational Numbers, Irrational Numbers, and Decimal Patterns' },
      { id: 'u1l4', num: '4', title: 'Classifying the Real Number System' },
      { id: 'u1l5', num: '5', title: 'Roots of Real Numbers' },
      { id: 'u1l6a', num: '6A', title: 'Entire and Mixed Radicals' },
      { id: 'u1l6b', num: '6B', title: 'Entire and Mixed Radicals: Index 3 and Higher' },
      { id: 'u1l7', num: '7', title: 'Cumulative Number Sense Check-Up' }] },
    { unit: 2, title: 'Exponents', outcomes: 'AN3', lessons: [
      { id: 'u2l1', num: '1', title: 'Understanding Powers and the Exponent Laws' },
      { id: 'u2l2', num: '2', title: 'Simplifying Expressions with Several Exponent Laws' },
      { id: 'u2l3', num: '3', title: 'Negative Exponents' },
      { id: 'u2l4', num: '4', title: 'Scientific Notation (Application / Extension)' },
      { id: 'u2l5a', num: '5A', title: 'Rational Exponents and Radicals' },
      { id: 'u2l5b', num: '5B', title: 'Simplifying with Rational Exponents' },
      { id: 'u2l6', num: '6', title: 'Exponent Laws in Review' }] },
    { unit: 3, title: 'Polynomial Operations', outcomes: 'AN4', lessons: [] },
    { unit: 4, title: 'Factoring Polynomial Expressions', outcomes: 'AN5', lessons: [] },
    { unit: 5, title: 'Relations and Functions', outcomes: 'RF1 · RF2 · RF8', lessons: [] },
    { unit: 6, title: 'Characteristics of Linear Relations', outcomes: 'RF3 · RF4 · RF5', lessons: [] },
    { unit: 7, title: 'Equations of Linear Relations', outcomes: 'RF6 · RF7', lessons: [] },
    { unit: 8, title: 'Systems of Linear Equations', outcomes: 'RF9', lessons: [] },
    { unit: 9, title: 'Trigonometry', outcomes: 'M4', lessons: [] },
    { unit: 10, title: 'Measurement', outcomes: 'M1 · M2 · M3', lessons: [] }
  ];
  root.HW.OUTCOMES = {
    AN1: 'Factors of whole numbers: prime factors, GCF, LCM, square roots and cube roots',
    AN2: 'Irrational numbers: representing, identifying and simplifying; ordering real numbers',
    AN3: 'Powers with integral and rational exponents',
    AN4: 'Multiplication of polynomial expressions',
    AN5: 'Common factors and trinomial factoring',
    RF1: 'Interpreting and explaining relations', RF2: 'Relations and functions', RF3: 'Slope', RF4: 'Linear relations',
    RF5: 'Characteristics of linear relations', RF6: 'Forms of linear equations', RF7: 'Equations of linear relations',
    RF8: 'Function notation', RF9: 'Systems of linear equations', M1: 'SI and imperial measurement', M2: 'Converting units',
    M3: 'Surface area and volume', M4: 'Trigonometry'
  };
})(window);
