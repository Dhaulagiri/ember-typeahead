import Ember from 'ember';

const {
  $,
  computed,
  get,
  run
} = Ember;

export default Ember.TextField.extend({
  classNames: ['form-control'],

  didInsertElement() {

    Ember.assert('typeahead.js has to be loaded', typeof this.$().typeahead === 'function');

    if (this.get('tokenized')) {
      Ember.assert('bootstrap-tokenfield has to be loaded', typeof this.$().tokenfield === 'function');

      this.$().tokenfield({
        typeahead: [
          {},
          {
            minLength: 0,
            displayKey: 'value',
            source: run.bind(this, (query, cb) => {
              const content = this.get('tokenContent');
              if (!query || query === '*') {
                return cb(content);
              }
              cb(this._filterContentToken(query));
            }),
            templates: {
              suggestion: Handlebars.compile(this.get('suggestionTemplate')),
              footer: run.bind(this, (object) => {
                var footerTemplate = this.get('footerTemplate');
                var emptyFooterTemplate = this.get('emptyFooterTemplate');

                if (object.isEmpty && emptyFooterTemplate) {
                  return Handlebars.compile(emptyFooterTemplate);
                }

                if (footerTemplate) {
                  return Handlebars.compile(footerTemplate);
                }
              }),
              empty: run.bind(this, () => {
                return Handlebars.compile(this.get('emptyTemplate'));
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
          displayKey: run.bind(this, (object) => {
            return get(object, this.get('displayKey'));
          }),
          source: run.bind(this, (query, cb) => {
            const content = this.get('content');
            if (!query || query === '*') {
              return cb(content);
            }
            cb(this._filterContent(query));
          }),
          templates: {
            suggestion: Handlebars.compile(this.get('suggestionTemplate')),
            footer: run.bind(this, (object) => {
              var footerTemplate = this.get('footerTemplate');
              var emptyFooterTemplate = this.get('emptyFooterTemplate');

              if (object.isEmpty && emptyFooterTemplate) {
                return Handlebars.compile(emptyFooterTemplate);
              }

              if (footerTemplate) {
                return Handlebars.compile(footerTemplate);
              }
            }),
            empty: run.bind(this, () => {
              return Handlebars.compile(this.get('emptyTemplate'));
            })
          }
        }
      ).on('typeahead:selected typeahead:autocompleted',
        run.bind(this, (e, obj) => {
          this.set('selection', obj);
        })
      ).on('typeahead:selected',
        run.bind(this, (e, obj) => {
          this.set('selection', obj);

          let name = this.get('selection.name');
          if (name) {
            this.sendAction('onSelectAction', name);
          }
        })
      );
    }
  },

  willDestroyElement() {
    if (this.get('tokenized')) {
      this.$().tokenfield('destroy');
    } else {
      this.$().typeahead('destroy');
    }
  },

  keyUp(event) {
    if (this.get('selectOnEnter') === true && event.which === 13){ // on RETURN key
      const $dropdownMenu = this.$().siblings('.tt-dropdown-menu');
      const $suggestions = $dropdownMenu.find('.tt-suggestion:not(.enter-suggest)');
      if ($suggestions.length === 1) { // when there is only ONE option
        $suggestions.first().click(); // trigger SELECTING that option
      } else {
        this.sendAction('onSelectWithoutMatchAction', this, this.$().val());
      }
    }
  },

  focusOut() {
    const query = this.$().typeahead('val');
    const results = this._filterContent(query);
    if ($.trim(query).length) {
      if (results.length) {
        this.set('selection', results[0]);
      } else {
        this.sendAction('onSelectWithoutMatchAction', this, query);
      }
    }
  },

  close: function() {
    this.$().typeahead('close');
  },

  _filterContent(query) {
    const regex = new RegExp(query, 'i');
    const valueKey = this.get('valueToken');
    return this.get('content').filter((thing) => {
      return regex.test(Ember.get(thing, valueKey));
    });
  },

  _filterContentToken(query) {
    const regex = new RegExp(query, 'i');
    const valueKey = 'value';
    return this.get('tokenContent').filter((thing) => {
      return regex.test(Ember.get(thing, valueKey));
    });
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
