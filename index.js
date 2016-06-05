var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var async = require('async');

var soxUtilities = require('./soxUtilities');
var speechToText = require('./speechToText');
var configuration = require('./configuration');
var translatedContentRepository = require('./translatedContentRepository');




// Returns all wav files in a folder
// cb(files, err)
var _getAudioInFolder = function(pathToFolder, cb) {
	fs.readdir(pathToFolder, function(err, files) {
		if(err) {
			cb(null, err);
			return;
		} else {
			cb(files, null);
		}
	})
};

// Writes text to a file in a folder
// cb(err)
var _writeTextToFile = function(pathToFile, textToWrite, cb) {
	fs.writeFile(pathToFile, textToWrite, function(err) {
		cb(err);
	});
};

// Removes the extension from a file name
var _getExtensionlessName = function(fileName) {
	var ext = path.extname(fileName);
	return fileName.replace(ext, "");
};


// Processes a single entry and fires async callback when done
var _processSingleFile = function(curRecord, callback) {
	// Holds a path to the temp file that is created
	var pathToTempFile = "";

	// Mark the file as being processed
	translatedContentRepository.edit(curRecord.autokey, translatedContentRepository.statuses.InProgress, null, function(error, recordSet) {
		if(error) {
			return callback(error);
		};

		// Convert the file to broadband
		soxUtilities.convertToBroadbandWav(curRecord.VoxPath, function(error, tmpFilePath) {
			if(error) {
				return callback(error);
			};


			// Save off the temp file path
			pathToTempFile = tmpFilePath;

			// Run the translator on the 16Hz file
			speechToText.getTextFromAudio(pathToTempFile, function(error, text) {

				if(error) {
					return callback(error);
				};

				// Write the text to the db
				translatedContentRepository.edit(curRecord.autokey, translatedContentRepository.statuses.Success, text, function(error, recordSet) {
					if(error) {
						return callback(error);
					};

					// Clean up the temp file and continue to the next file
					fs.stat(pathToTempFile, function(error, stats) {
						if(error) {
							console.log('WARNING Unable to remove temp file: ' + pathToTempFile);
							return callback(); // done processing.
						};

						// Remove the temp file
						fs.unlink(pathToTempFile, function(error) {
							if(error) {
								console.log('WARNING Unable to remove temp file: ' + pathToTempFile);
							};

							return callback(); // continue to next file
						});
					});
				});

			});
		});		
	});
};

// Adds work to the queue
var _addWorkToQueue = function(queue) {
	translatedContentRepository.getUnprocessed(function(error, recordSet) {
		if(error) {
			console.log('ERROR ' + error);
			return;
		};

		// Go through and add each item to be processed
		_.each(recordSet, function(curRecord) {
			queue.push(curRecord, function(error) {
				if(error) {
					console.log('ERROR ' + error);

					// update the database on an error
					translatedContentRepository.edit(curRecord.autokey, translatedContentRepository.statuses.Failure, null, function(error, recordSet) {
						if(error) {
							console.log('ERROR ' + error);
						};
					});
					return;
				};

				console.log('SUCCESS ' + curRecord.autokey);
			});
		});
	});
};

/* ** Main application** */

// Setup a queue to run multiple tasks at a time
var workerQueue = async.queue(function(task, callback) {
	_processSingleFile(task, callback);
}, configuration.MAX_WORKER_THREADS);

workerQueue.drain = function() {
	console.log('All input complete!');
};


// Pull in data as needed
setInterval(function() {
	console.log('BEGIN ADD WORK');
	_addWorkToQueue(workerQueue);
}, 10000);



