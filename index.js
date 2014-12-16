var daoImplements = {
  mongo: require('./lib/dao/dao-mongo'),
  dynamo: require('./lib/dao/dao-dynamo')
};

module.exports = function (options) {
  return daoImplements[options.dbType];
};