import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('type-ahead', 'Integration | Component | type ahead', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{type-ahead suggestionTemplate=""}}`);

  assert.equal(this.$().text().trim(), '');

});

test('works if handlebars is not available in the global namespace and functions are passed', function(assert) {
  var Hbars = window.Handlebars;
  delete window.Handlebars;

  this.set('suggestionTemplate', function({name}) {
    return `<p>${name}!</p>`;
  });

  this.set('footerTemplate', function() {
    return `<div id='footer'>ZOMG A FOOTER</div>`;
  });

  this.set('emptyTemplate', function() {
    return `<div id='empty'><p>Empty :(</p></div>`;
  });

  this.set('content', ['abc', 'def', 'ghi'].map(val => ({name: val})));

  try {
    this.render(hbs`{{type-ahead displayKey='name' emptyTemplate=emptyTemplate footerTemplate=footerTemplate valueToken='name' suggestionTemplate=suggestionTemplate content=content}}`);

    run(() => {
      this.$('.tt-input').val('NO MATCHES!').trigger('input');
    });
    assert.equal(this.$().text(), 'Empty :(', 'renders empty template from function');

    run(() => {
      this.$('.tt-input').val('abc').trigger('input');
    });

    assert.equal(this.$('.tt-suggestion').length, 1, 'onlys shows relevant result');
    assert.equal(this.$('.tt-suggestion').text().trim(), 'abc!', 'renders suggestion template from function');

    assert.equal(this.$('#footer').text().trim(), 'ZOMG A FOOTER', 'renders footer template from function');
  } finally {
    window.Handlebars = Hbars;
  }
});

