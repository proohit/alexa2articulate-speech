let recognition = null;

function startSTT() {
    console.log("Start STT");
    let player = GetPlayer();
    let finalTranscript = '';

    if (!('webkitSpeechRecognition' in window)) {
    } else if (recognition == null) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'de-de';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = function (event) {
            var interim_transcript = '';

            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                try {
                    finalTranscript = finalTranscript.toLowerCase();
                    console.log(finalTranscript);
                    const res = peg$parse(finalTranscript);
                    console.log(res);
                    res.execute();
                } finally {
                    finalTranscript = '';
                }
            }
        };

        recognition.onerror = function (event) {
            console.log(event);
            //This prevents stopping of the recognition
            player.GetVar('sttEnabled') ? recognition.start() : stopSTT();
        };
        
        recognition.onend = function (event) {
            //This prevents stopping of the recognition
            player.GetVar('sttEnabled') ? recognition.start() : stopSTT();
        };

        recognition.start();
    }
}

function stopSTT() {
    console.log("Stop STT");
    recognition.abort();
    recognition = null;
}