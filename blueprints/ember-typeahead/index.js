module.exports = {
  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },
  afterInstall: function(options) {
    var packages = [
      { name: 'typeahead.js', target: '~0.11.1' },
      { name: 'bootstrap-tokenfield', target: '~0.12.1' },
      { name: 'handlebars', target: '~3.0.3' }
    ];
    return this.addBowerPackagesToProject(packages);
  }
};
