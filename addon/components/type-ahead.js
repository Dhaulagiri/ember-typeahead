import { A } from '@ember/array';
import { assert } from '@ember/debug';
import TextField from '@ember/component/text-field';
import $ from 'jquery';
import { get, computed } from '@ember/object';
import { run } from '@ember/runloop';

export default TextField.extend({
  classNames: ['form-control'],
  limit: 5,
  didInsertElement() {

    assert('typeahead.js has to be loaded', typeof this.$().typeahead === 'function');

    if (this.get('tokenized')) {
      assert('bootstrap-tokenfield has to be loaded', typeof this.$().tokenfield === 'function');

      this.$().tokenfield({
        typeahead: [
          {},
          {
            minLength: 0,
            limit: this.get('limit'),
            displayKey: 'value',
            source: run.bind(this, (query, cb) => {
              const content = this.get('tokenContent');
              if (!query || query === '*') {
                return cb(content);
              }
              cb(this._filterContent(query, 'value', this.get('tokenContent')));
            }),
            templates: {
              suggestion: this.get('suggestionTemplate'),
              footer: run.bind(this, (object) => {
                var footerTemplate = this.get('footerTemplate');
                var emptyFooterTemplate = this.get('emptyFooterTemplate');

                if (object.isEmpty && emptyFooterTemplate) {
                  return emptyFooterTemplate;
                }

                if (footerTemplate) {
                  return footerTemplate;
                }
              }),
              empty: run.bind(this, () => {
                return this.get('emptyTemplate');
              })
            }
          }
        ]
      })
      .on('tokenfield:createtoken',
        run.bind(this, (event) => {
          // remove the token from the list
          const tokenContent = this.get('tokenContent');
          const token = tokenContent.findBy('value', event.attrs.value);
          tokenContent.removeObject(token);
        })
      ).on('tokenfield:removetoken',
        run.bind(this, (event) => {
          // add the token back to the list
          let tokenContent = this.get('tokenContent');
          const token = { value: event.attrs.value };
          tokenContent.addObject(token);
          tokenContent = tokenContent.sortBy('value');
          this.set('tokenContent', tokenContent);
        })
      );
    } else {
      this.$().typeahead(
        {},
        {
          minLength: 0,
          limit: this.get('limit'),
          displayKey: run.bind(this, (object) => {
            return get(object, this.get('displayKey'));
          }),
          source: run.bind(this, (query, cb) => {
            const content = this.get('content');
            if (!query || query === '*') {
              return cb(content);
            }
            cb(this._filterContent(query, this.get('valueToken'), this.get('content')));
          }),
          templates: {
            suggestion: this.get('suggestionTemplate'),
            footer: run.bind(this, (object) => {
              var footerTemplate = this.get('footerTemplate');
              var emptyFooterTemplate = this.get('emptyFooterTemplate');

              if (object.isEmpty && emptyFooterTemplate) {
                return emptyFooterTemplate;
              }

              if (footerTemplate) {
                return footerTemplate;
              }
            }),
            empty: run.bind(this, () => {
              return this.get('emptyTemplate');
            })
          }
        }
      ).on('typeahead:select typeahead:autocomplete',
        run.bind(this, (e, obj) => {
          this.set('selection', obj);
        })
      ).on('typeahead:select',
        run.bind(this, (e, obj) => {
          this.set('selection', obj);

          let valueToken = this.get('valueToken');
          let value = this.get(`selection.${valueToken}`);
          if (value) {
            this.sendAction('onSelectAction', value);
          }
        })
      );
    }
  },

  willDestroyElement() {
    if (this.get('tokenized')) {
      this.$().off('tokenfield:createtoken tokenfield:removetoken');
      this.$().tokenfield('destroy');
    } else {
      this.$().off('typeahead:select typeahead:autocomplete');
      this.$().off('typeahead:select');
      this.$().typeahead('destroy');
    }
  },

  keyUp(event) {
    if (this.get('selectOnEnter') === true && event.which === 13){ // on RETURN key
      const $dropdownMenu = this.$().siblings('.tt-menu');
      const $suggestions = $dropdownMenu.find('.tt-suggestion:not(.enter-suggest)');
      $suggestions.first().click(); // trigger SELECTING that option
    }
  },

  focusOut() {
    const query = this.$().typeahead('val');
    const results = this._filterContent(query, this.get('valueToken'), this.get('content'));
    if ($.trim(query).length) {
      this.set('selection', results[0]);
    }
  },

  close() {
    this.$().typeahead('close');
  },

  _filterContent(query, valueKey, content) {
    const exactRegex = new RegExp(`^${query}$`, 'i');
    const fuzzyRegex = new RegExp(query, 'i');

    const exactMatches = content.filter((thing) => {
      return exactRegex.test(get(thing, valueKey));
    });

    const fuzzyMatches =  A(content.filter((thing) => {
      return fuzzyRegex.test(get(thing, valueKey));
    }));

    return exactMatches.concat(fuzzyMatches.removeObject(exactMatches[0]));
  },

  // Massage the content of typeahead into a format
  // bootstrap-tokenfield can work woth
  // e.g. [{ value: 'foo'}, { value: 'bar'}]
  tokenContent: computed('content.[]', function() {
    const content = this.get('content');
    const valueToken = this.get('valueToken');

    let tokenContent = [];
    content.forEach((item) => {
      let object = {};
      object.value = item[valueToken];
      tokenContent.push(object);
    });

    // filter out any items that have already been selected and return that
    const selectedTokens = this.$().tokenfield('getTokensList');
    return tokenContent.reject((object) => selectedTokens.indexOf(object.value) > -1);
  })
});
