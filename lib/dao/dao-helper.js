var debug = require('debug')('DaoHelper');

function _generateUpdateAttr(updateMessage) {
  var updateAttr = {}, key, opt, value, action;
  for (opt in updateMessage) {
    if (updateMessage.hasOwnProperty(opt)) {
      value = updateMessage[opt];
      action = 'PUT';
      switch (opt) {
      case '$set':
        action = 'PUT';
        break;
      case '$push':
        action = 'ADD';
        break;
      default:
        console.error('do not support %s update action', opt);
        break;
      }
      for (key in value) {
        if (value.hasOwnProperty(key)) {
          updateAttr[key] = {Action: action, Value: {}};
          if (typeof value[key] === 'string') {
            updateAttr[key].Value.S = value[key];
          } else if (typeof value[key] === 'number') {
            updateAttr[key].Value.N = value[key].toString();
          } else if (typeof value[key] === 'boolean') {
            updateAttr[key].Value.N = (value[key] ? 1 : 0).toString();
          } else {
            if (value[key] && Array.isArray(value[key]) && value[key].length) {
              updateAttr[key].Value.SS = value[key];
            } else {
              delete updateAttr[key];
            }
          }
        }
      }
    }
  }
  return updateAttr;
}

function _transformResponse(item) {
  var key, contentType;
  for (key in item) {
    if (item.hasOwnProperty(key)) {
      contentType = Object.keys(item[key])[0];
      switch (contentType) {
      case 'N':
        item[key] = parseInt(item[key][contentType], 10);
        break;
      default:
        item[key] = item[key][contentType];
        break;
      }
    }
  }
}

function _parseResponse(datas) {
  if (typeof datas === 'object' && !Array.isArray(datas)) {
    _transformResponse(datas);
  }
  if (datas && datas.length) {
    datas.forEach(function (item) {
      _transformResponse(item);
    });
  }
  return datas;
}

function _transformEntity(entity) {
  var newItem = {}, key;
  for (key in entity) {
    if (entity.hasOwnProperty(key)) {
      newItem[key] = {};
      switch (typeof entity[key]) {
      case 'string':
        newItem[key].S = entity[key] || 'unknow string';
        break;
      case 'number':
        newItem[key].N = (entity[key] || 0).toString();
        break;
      case 'boolean':
        newItem[key].N = (entity[key] ? 1 : 0).toString();
        break;
      default:
        newItem[key].SS = entity[key] || ['unknow set member'];
        break;
      }
    }
  }
  return newItem;
}

function _transformConditions(selection) {
  var newItem = {}, key;
  for (key in selection) {
    if (selection.hasOwnProperty(key)) {
      newItem[key] = {
        "AttributeValueList": [{}],
        "ComparisonOperator": "EQ"
      };
      switch (typeof selection[key]) {
      case 'string':
        newItem[key].AttributeValueList[0].S = selection[key] || 'unknow string';
        break;
      case 'number':
        newItem[key].AttributeValueList[0].N = (selection[key] || 0).toString();
        break;
      case 'boolean':
        newItem[key].AttributeValueList[0].N = (selection[key] ? 1 : 0).toString();
        break;
      default:
        newItem[key].AttributeValueList[0].SS = selection[key] || ['unknow set member'];
        break;
      }
    }
  }
  return newItem;
}

exports.parseResponse = _parseResponse;
exports.transformEntity = _transformEntity;
exports.generateUpdateAttr = _generateUpdateAttr;
exports.transformConditions = _transformConditions;