var exec = require('child_process').exec;
var _ = require('lodash');
var Guid = require('guid');
var fs = require('fs');

var configuration = require('./configuration');

module.exports = {
	// cb(error, pathToOutput)
	convertToBroadbandWav: function(pathToSource, cb) {
		// Create a tmp directory if needed
		if(!fs.existsSync(configuration.PATH_TO_TEMP)) {
			fs.mkdirSync(configuration.PATH_TO_TEMP);
		};

		// Make sure the path is set
		if(_.isNull(pathToSource) || _.isUndefined(pathToSource) || pathToSource.length <= 0) {
			return cb("Invalid source file", null);
		};

		// Build the command
		var pathToInput = '"' + pathToSource + '"';
		var pathToOutput = configuration.PATH_TO_TEMP + '/' + Guid.raw() + '.wav';
		var commandToRun = 'sox ' + pathToInput + ' -r 16k ' + pathToOutput;

		// Run the command and handle output
		exec(commandToRun, function(error, stdout, stderr) {
			// Handle error case
			if(error) {
				return cb(error, null);
			};

			// Otherwise success
			cb(null, pathToOutput);
		});

	}
};
