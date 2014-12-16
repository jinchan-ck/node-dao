var debug = require('debug')('BaseDao');

var DaoHelper = require('./dao-helper');

function BaseDao(db) {
  this.db = db;
}

module.exports = BaseDao;

BaseDao.prototype.add = function (table, entity, callback) {
  var newItem = DaoHelper.transformEntity(entity);
  var params = {
    Item: newItem,
    TableName: table,
    ReturnConsumedCapacity: 'TOTAL',
    ReturnValues: 'ALL_OLD'
  };
  this.db.putItem(params, callback);
};

BaseDao.prototype.delete = function (table, selection, callback) {
  var condition = DaoHelper.transformEntity(selection);
  var params = {
    Key: condition,
    TableName: table,
    ReturnConsumedCapacity: 'TOTAL',
    ReturnValues: 'ALL_OLD'
  };
  debug('params: ', JSON.stringify(params, null, 2));
  this.db.deleteItem(params, function (err, data) {
    var result;
    if (data) {
      debug('resp data: ', JSON.stringify(data.Attributes, null, 2));
      result = DaoHelper.parseResponse(data.Attributes);
    }
    callback(err, result);
  });
};

BaseDao.prototype.update = function (table, selection, updateMessage, callback) {
  var condition = DaoHelper.transformEntity(selection);
  var updateAttr = DaoHelper.generateUpdateAttr(updateMessage);
  var params = {
    Key: condition,
    TableName: table,
    AttributeUpdates: updateAttr,
    ReturnConsumedCapacity: 'TOTAL',
    ReturnValues: 'UPDATED_OLD'
  };
  debug('params: ', JSON.stringify(params, null, 2));
  this.db.updateItem(params, function (err, data) {
    var result;
    if (data) {
      debug('resp data: ', JSON.stringify(data.Attributes, null, 2));
      result = DaoHelper.parseResponse(data.Attributes);
    }
    callback(err, result);
  });
};

BaseDao.prototype.find = function (table, selection, field, callback, index) {
  if (field === 'all') {
    field = null;
  }
  var newItem = DaoHelper.transformConditions(selection);
  var params = {
    "TableName": table,
    "IndexName": index,
    "ConsistentRead": true,
    "AttributesToGet": field,
    "KeyConditions": newItem,
    "ReturnConsumedCapacity": "TOTAL"
  };
  if (!field) {
    delete params.AttributesToGet;
    params.Select = 'ALL_ATTRIBUTES';
  }
  if (!index) {
    delete params.IndexName;
  }
  debug('[BaseDao -> find]', JSON.stringify(params, null, 2));
  this.db.query(params, function (err, data) {
    var result;
    if (err) {
      console.error(err, err.stack);
    }
    if (data) {
      debug('resp data: ', JSON.stringify(data, null, 2));
      result = DaoHelper.parseResponse(data.Items);
    }
    callback(err, result);
  });
};

BaseDao.prototype.findAll = function (table, callback, ExclusiveStartKey, preResults) {
  var self = this;
  var params = {
    'TableName': table,
    'ExclusiveStartKey': ExclusiveStartKey
  };
  if (!ExclusiveStartKey) {
    delete params.ExclusiveStartKey;
  }
  debug('[BaseDao -> findAll]', JSON.stringify(params, null, 2));
  this.db.scan(params, function (err, data) {
    var result = preResults || [];
    if (err) {
      console.error(err, err.stack);
    }
    if (data) {
      debug('resp data: ', JSON.stringify(data, null, 2));
      if (data.Count) {
        console.log('count: ', data.Count);
      }
      result = result.concat(DaoHelper.parseResponse(data.Items) || []);
      if (data.LastEvaluatedKey) {
        setTimeout(function () {
          self.findAll(table, callback, data.LastEvaluatedKey, result);
        }, 2000);
      } else {
        callback(err, result);
      }
    } else {
      callback(err, result);
    }
  });
};