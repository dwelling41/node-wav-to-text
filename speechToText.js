var request = require('request');
var fs = require('fs');
var _ = require('lodash');

var configuration = require('./configuration');


module.exports = {
	// cb: function(error, text)
	getTextFromAudio: function(pathToInput, cb) {
		// Setup all options to endpoint
		var options = {
			url: configuration.SPEECH_TO_TEXT_ENDPOINT,
			headers: {
				'Content-Type': 'audio/wav',
				'Transfer-Encoding': 'chunked'
			},
			auth: {
				'user': configuration.SPEECH_TO_TEXT_USERNAME,
				'pass': configuration.SPEECH_TO_TEXT_PASSWORD
			}
		};

		// Pipe the file to the endpoint
		var stream = fs.createReadStream(pathToInput).pipe(
			request.post(options, function(err, response, body) {
				if(err) {
					return cb(err, null);
				};

				// Parse out the first transcript
				var bodyJSON = JSON.parse(body);
				var transcript = _.get(bodyJSON, 'results[0].alternatives[0].transcript');
				cb(null, transcript); 

			})
		);

		// Hadle stream reading errors
		stream.on('error', function(err) {
			return cb(err, null);
		});	
	}
}