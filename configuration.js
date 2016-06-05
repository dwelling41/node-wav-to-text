module.exports = {
	MAX_WORKER_THREADS: 5,			// Number of files to process at the same time
	PATH_TO_OUTPUT: 'output',		// Relative path to the location of outputs folder. No trailing slash
	PATH_TO_TEMP: 'tmp',			// Relative path to the location of temp folder. No trailing slash

	SPEECH_TO_TEXT_ENDPOINT: "https://stream.watsonplatform.net/speech-to-text/api/v1/recognize?continuous=true",	// Path to Watson Speech To Text endpoint
	SPEECH_TO_TEXT_USERNAME: "		",												// Watson Speech To Text API Username
	SPEECH_TO_TEXT_PASSWORD: "		",																		// Watson Speech To Text API Password 


    DB_USERNAME: '		',
    DB_PASSWORD: '		',
    DB_SERVER: '		', 
    DB_DATABASE: '		',
    DB_ENCRYPT: true 								// Try setting to false if connection fails
}