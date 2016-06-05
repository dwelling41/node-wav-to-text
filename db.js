var sql = require('mssql');
var configuration = require('./configuration');
 

// Setup the database configuration
var dbConfig = {
    user: configuration.DB_USERNAME,
    password: configuration.DB_PASSWORD,
    server: configuration.DB_SERVER,
    database:  configuration.DB_DATABASE,

    options: {
        encrypt: configuration.DB_ENCRYPT 
    }
};

// Holds the current db connection
var _dbConnection = null;


// cb(error, connection)
var _getConnection = function(cb) {
	// Handle the case where the connection is already set
	if(_dbConnection) {
		return cb(null, _dbConnection);
	};

	// Otherwise get the connection
	_dbConnection = sql.connect(dbConfig, function(error) {
		cb(error);
	});
};


module.exports = {
	getConnection: _getConnection
};