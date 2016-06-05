var db = require('./db');
var configuration = require('./configuration');
var sql = require('mssql');

// Status constants
var statuses = {
	Unprocessed: 0,
	InProgress: 1,
	Success: 2,
	Failure: 3
};


// cb(error, recordset)
var _getUnprocessed = function(cb) {
	db.getConnection(function(error, connection) {
		if(error) {
			return cb(error, null);
		};

		var query =	'SELECT * '  +
					'FROM TranslatedContent ' +
					'WHERE status = @status_id';

		var request = new sql.Request(connection)
			.input('status_id', statuses.Unprocessed)
			.query(query, function(error, recordSet) {
				if(error) {
					return cb(error, null);
				};

				cb(null, recordSet);
			});
	});
};

// cb(error, recordset)
var _edit = function(id, newStatus, newTextResult, cb) {
	db.getConnection(function(error, connection) {
		if(error) {
			return cb(error, null);
		};

		var query =	'UPDATE TranslatedContent ' + 
					'SET status = @new_status, ' +
					'TextResult = @new_text_result, ' +
					'LastModified = GETUTCDATE() ' +
					'WHERE autokey = @id ';

		console.log(query);

		var request = new sql.Request(connection)
			.input('new_status', newStatus)
			.input('new_text_result', newTextResult)
			.input('id', id)
			.query(query, function(error, recordSet, affected) {
				console.log(affected)
				if(error) {
					return cb(error, null);
				};

				cb(null, recordSet);
			});
	});
};



module.exports = {
	getUnprocessed: _getUnprocessed,
	statuses: statuses,
	edit: _edit
};


