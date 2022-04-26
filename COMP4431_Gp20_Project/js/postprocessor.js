// This object represent the postprocessor
Postprocessor = {
    // The postprocess function takes the audio samples data and the post-processing effect name
    // and the post-processing stage as function parameters. It gathers the required post-processing
    // paramters from the <input> elements, and then applies the post-processing effect to the
    // audio samples data of every channels.
    postprocess: function (channels, effect, pass) {
        switch (effect) {
            case "no-pp":
                // Do nothing
                break;

            case "reverse":
                /**
                * TODO: Complete this function
                **/

                // Post-process every channels
                for (var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    // Apply the post-processing, i.e. reverse
                    audioSequence.data.reverse();
                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "boost":
                // Find the maximum gain of all channels
                var maxGain = -1.0;
                for (var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    var gain = audioSequence.getGain();
                    if (gain > maxGain) {
                        maxGain = gain;
                    }
                }

                // Determin the boost multiplier
                var multiplier = 1.0 / maxGain;

                // Post-process every channels
                for (var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    // For every sample, apply a boost multiplier
                    for (var i = 0; i < audioSequence.data.length; ++i) {
                        audioSequence.data[i] *= multiplier;
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "adsr":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var totalSamples = Math.floor(sampleRate * duration);
                var attackDuration = parseFloat($("#adsr-attack-duration").data("p" + pass)) * sampleRate;
                var decayDuration = parseFloat($("#adsr-decay-duration").data("p" + pass)) * sampleRate;
                var releaseDuration = parseFloat($("#adsr-release-duration").data("p" + pass)) * sampleRate;
                var sustainLevel = parseFloat($("#adsr-sustain-level").data("p" + pass)) / 100.0;

                for (var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    var tempdecay = decayDuration;

                    for (var i = 0; i < audioSequence.data.length; ++i) {
                        // TODO: Complete the ADSR postprocessor
                        // Hinst: You can use the function lerp() in utility.js
                        // for performing linear interpolation
                        if (i <= attackDuration) {
                            var multiplier = i / attackDuration;
                            audioSequence.data[i] *= multiplier;
                        }

                        else if (i > attackDuration && i <= (attackDuration + decayDuration)) {
                            var amt = (i - attackDuration) / decayDuration;
                            var multiplier = lerp(1, sustainLevel, amt);
                            audioSequence.data[i] *= multiplier;
                            tempdecay -= 2;
                        }

                        else if (i > (attackDuration + decayDuration) && i <= (totalSamples - releaseDuration)) {
                            audioSequence.data[i] *= sustainLevel;
                        }

                        else {
                            var multiplier = sustainLevel * (totalSamples - 1 - i) / releaseDuration;
                            audioSequence.data[i] *= multiplier;
                        }
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "tremolo":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var tremoloFrequency = parseFloat($("#tremolo-frequency").data("p" + pass));
                var wetness = parseFloat($("#tremolo-wetness").data("p" + pass));

                // Post-process every channels
                for (var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    // For every sample, apply a tremolo multiplier
                    for (var i = 0; i < audioSequence.data.length; ++i) {
                        var currentTime = i / sampleRate;
                        var multiplier = (Math.sin(2.0 * Math.PI * tremoloFrequency * currentTime + 1.5 * Math.PI) + 1) / 2;
                        multiplier = multiplier * wetness + (1 - wetness);
                        audioSequence.data[i] *= multiplier;
                    }
                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "echo":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var delayLineDuration = parseFloat($("#echo-delay-line-duration").data("p" + pass));
                var multiplier = parseFloat($("#echo-multiplier").data("p" + pass));

                // Post-process every channels
                for (var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    // Create a new empty delay line
                    var delayLineSize = parseInt(delayLineDuration * sampleRate);
                    var delayLine = [];
                    for (var i = 0; i < delayLineSize; i++)
                        delayLine.push(0);
                    var delayLineOutput;


                    // Get the sample data of the channel
                    for (var i = 0; i < audioSequence.data.length; ++i) {
                        // Get the echoed sample from the delay line
                        delayLineOutput = delayLine[i % delayLineSize];
                        // Add the echoed sample to the current sample, with a multiplier
                        audioSequence.data[i] = audioSequence.data[i] + delayLineOutput * multiplier;
                        // Put the current sample into the delay line
                        delayLine[i % delayLineSize] = audioSequence.data[i];
                    }

                    // Update the sample data with the post-processed data

                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "ahdsr":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var totalSamples = Math.floor(sampleRate * duration);
                var attackDuration = parseFloat($("#ahdsr-attack-duration").data("p" + pass)) * sampleRate;
                var holdDuration = parseFloat($("#ahdsr-hold-duration").data("p" + pass)) * sampleRate;
                var decayDuration = parseFloat($("#ahdsr-decay-duration").data("p" + pass)) * sampleRate;
                var releaseDuration = parseFloat($("#ahdsr-release-duration").data("p" + pass)) * sampleRate;
                var sustainLevel = parseFloat($("#ahdsr-sustain-level").data("p" + pass)) / 100.0;


                var attackForm = $("#ahdsr-attack-form").val();
                var decayForm = $("#ahdsr-decay-form").val();
                var releaseForm = $("#ahdsr-release-form").val();

                var attackExponent = parseFloat($("#attack-exponent").data("p" + pass));
                var decayExponent = parseFloat($("#decay-exponent").data("p" + pass));
                var releaseExponent = parseFloat($("#release-exponent").data("p" + pass));
                console.log(attackExponent);


                console.log(attackForm)
                //linear exponential
                for (var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    var tempdecay = decayDuration;

                    for (var i = 0; i < audioSequence.data.length; ++i) {
                        // TODO: Complete the ADSR postprocessor
                        // Hinst: You can use the function lerp() in utility.js
                        // for performing linear interpolation
                        if (i <= attackDuration) {
                            if (attackForm == "linear") {
                                var multiplier = i / attackDuration;
                            }
                            else {
                                var multiplier = Math.pow((i / attackDuration), attackExponent);
                            }
                            audioSequence.data[i] *= multiplier;
                            var holdmultiplier = multiplier;
                        }

                        else if (i > attackDuration && i <= (attackDuration + holdDuration)) {
                            audioSequence.data[i] *= holdmultiplier;
                        }

                        else if (i > holdDuration && i <= (attackDuration + holdDuration + decayDuration)) {
                            if (decayForm == "linear") {
                                var amt = (i - (attackDuration + holdDuration)) / decayDuration;
                            }
                            else {
                                var amt = Math.pow(((i - (attackDuration + holdDuration)) / decayDuration), decayExponent);
                                //if <1 then \,else down on RHS 
                            }
                            var multiplier = lerp(1, sustainLevel, amt);
                            audioSequence.data[i] *= multiplier;
                            tempdecay -= 2;
                        }

                        else if (i > (attackDuration + decayDuration) && i <= (totalSamples - releaseDuration)) {
                            audioSequence.data[i] *= sustainLevel;
                        }

                        else {
                            if (releaseForm == "linear") {
                                var multiplier = sustainLevel * (totalSamples - 1 - i) / releaseDuration;
                            }
                            else {
                                var amt = Math.pow(((totalSamples - 1 - i) / releaseDuration), releaseExponent) ;
                                var multiplier = lerp(0, sustainLevel, amt);
                            }
                            
                            audioSequence.data[i] *= multiplier;
                        }
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            default:
                // Do nothing
                break;
        }
        return;
    }
}
