/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-typeahead',

  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/bootstrap-tokenfield/dist/bootstrap-tokenfield.js');
    app.import(app.bowerDirectory + '/bootstrap-tokenfield/dist/css/bootstrap-tokenfield.css');
    app.import(app.bowerDirectory + '/typeahead.js/dist/typeahead.bundle.js');
  }
};
