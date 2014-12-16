var debug = require('debug')('Dao');

function Dao(db) {
  this.db = db;
}

module.exports = Dao;

Dao.prototype.add = function (table, object, callback) {
  console.log('INSERT INTO ' + table + ' VALUES ' + object);
  callback();
};

Dao.prototype.delete = function (table, selection, callback) {
  console.log('DELETE from ' + table + ' WHERE ' + selection);
  callback();
};

Dao.prototype.update = function (table, selection, updateMsgs, options, callback) {
  console.log('UPDATE ' + table + ' WHERE ' + selection + ' ' + updateMsgs);
  console.log('MAYBE OTHER OPTIONS: ', options);
  callback();
};

Dao.prototype.find = function (table, selection, fields, sort, limit, callback, dynamoOptions) {
  console.log('SELECT ' + fields + ' FROM ' + table + ' WHERE ' + selection + ' ORDER BY ' + sort + ' LIMIT' + limit);
  console.log('MAYBE OTHER OPTIONS: ', dynamoOptions);
  callback();
};