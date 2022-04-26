// This object represent the waveform generator
var WaveformGenerator = {
    // The generateWaveform function takes 4 parameters:
    //     - type, the type of waveform to be generated
    //     - frequency, the frequency of the waveform to be generated
    //     - amp, the maximum amplitude of the waveform to be generated
    //     - duration, the length (in seconds) of the waveform to be generated
    generateWaveform: function (type, frequency, amp, duration) {
        var nyquistFrequency = sampleRate / 2; // Nyquist frequency
        var totalSamples = Math.floor(sampleRate * duration); // Number of samples to generate
        var result = []; // The temporary array for storing the generated samples

        switch (type) {
            case "sine-time": // Sine wave, time domain
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    result.push(amp * Math.sin(2.0 * Math.PI * frequency * currentTime));
                }
                break;

            case "square-time": // Square wave, time domain
                /**
                * TODO: Complete this generator
                **/
                var WholeCycle = sampleRate / frequency;
                let HalfCycle = WholeCycle / 2;
                for (let i = 0; i < totalSamples; i++) {
                    let NowWhere = i % parseInt(WholeCycle);
                    if (NowWhere < HalfCycle) {
                        result.push(amp * 1);
                    }
                    else {
                        result.push(amp * -1);
                    }
                }
                break;

            case "square-additive": // Square wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                for (let i = 0; i < totalSamples; i++) {
                    let t = i / sampleRate;
                    let sample = 0;
                    let k = 1;
                    while (k * frequency < nyquistFrequency) {
                        if (k >= 500)
                            break;
                        sample += (1.0 / k) * Math.sin(2 * Math.PI * k * frequency * t);
                        k += 2;

                    }
                    result.push(amp * sample * 4 / Math.PI);
                }
                break;

            case "sawtooth-time": // Sawtooth wave, time domain
                /**
                * TODO: Complete this generator
                **/
                var WholeCycle = sampleRate / frequency;
                for (let i = 0; i < totalSamples; i++) {
                    let NowWhere = i % parseInt(WholeCycle);
                    let Fraction = NowWhere / WholeCycle;
                    result.push(amp * (2 * (1.0 - Fraction) - 1));
                }
                break;

            case "sawtooth-additive": // Sawtooth wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                for (let i = 0; i < totalSamples; i++) {
                    let t = i / sampleRate;
                    let sample = 0;
                    var k = 1;
                    while (k * frequency < nyquistFrequency) {
                        if (k > 250)
                            break;
                        sample += (1.0 / k) * Math.sin(2 * Math.PI * k * frequency * t);
                        k += 1;
                    }
                    
                    result.push(amp * sample * 2 / Math.PI);
                }
                break;

            case "triangle-additive": // Triangle wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                for (let i = 0; i < totalSamples; i++) {
                    let t = i / sampleRate;
                    let sample = 0;
                    let k = 1;
                    let sign = 1;
                    var basis = $("#triangle-additive-basis>option:selected").val();
                    if (basis == "cosine") {
                        while (k * frequency < nyquistFrequency) {
                            if (k >= 500)
                                break;
                            sample += (1.0 / (k * k)) * Math.cos(2 * Math.PI * k * frequency * t);
                            k += 2;
                        }
                    }

                    else if (basis == "sine") {
                        while (k * frequency < nyquistFrequency) {
                            if (k >= 500)
                                break;
                            sample += (1.0 / (k * k)) * Math.sin(2 * Math.PI * k * frequency * t) * sign;
                            k += 2;
                            sign = -sign;
                        }
                    }
                    result.push(amp * sample * 8 / (Math.PI * Math.PI));
                }
                break;

            case "karplus-strong": // Karplus-Strong algorithm
                /**
                * TODO: Complete this generator
                **/

                // Obtain all the required parameters
                var base = $("#karplus-base>option:selected").val();
                var b = parseFloat($("#karplus-b").val());
                var delay = parseInt($("#karplus-p").val());
                var useFreq = $("#karplus-use-freq").prop("checked");
                //white-noise, sawtooth


                if (useFreq) {
                    delay = parseInt(sampleRate / frequency);
                }

                if (base == "white-noise") {
                    for (var i = 0; i < totalSamples; i++) {
                        if (i <= delay) {
                            result.push(2 * Math.random() - 1);
                        }
                        else {
                            var probi = Math.floor(Math.random() * 100);
                            if ((probi + 1) > (100 - b * 100)) {
                                result.push(0.5 * (result[i - delay] + result[i - delay - 1]));
                            }

                            else {
                                result.push(-0.5 * (result[i - delay] + result[i - delay - 1]));
                            }
                        }
                    }
                }

                else if (base == "sawtooth") {
                    var WholeCycle = delay;
                    for (var i = 0; i < totalSamples; i++) {
                        if (i <= delay) {
                            var NowWhere = i % parseInt(WholeCycle);
                            var Fraction = NowWhere / WholeCycle;
                            result.push(amp * (2 * (1.0 - Fraction) - 1));
                        }
                        else {
                            var probi = Math.floor(Math.random() * 100);
                            if ((probi + 1) > (100 - b * 100)) {
                                result.push(0.5 * (result[i - delay] + result[i - delay - 1]));
                            }
                            else {
                                result.push(-0.5 * (result[i - delay] + result[i - delay - 1]));
                            }
                        }
                    }
                }
                break;

            case "white-noise": // White noise
                /**
                * TODO: Complete this generator
                **/
                for (var i = 0; i < totalSamples; i++) {
                    result.push(amp * (Math.random() * 2 - 1));
                }
                break;

            case "customized-additive-synthesis": // Customized additive synthesis
                /**
                * TODO: Complete this generator
                **/

                // Obtain all the required parameters
                var harmonics = [];
                for (var h = 1; h <= 10; ++h) {
                    harmonics.push($("#additive-f" + h).val());
                }

                for (let i = 0; i < totalSamples; i++) {
                    let t = i / sampleRate;
                    let sample = 0;
                    let k = 1;
                    while (k < 10 && k * frequency < nyquistFrequency) {
                        sample += harmonics[k - 1] * Math.sin(2 * Math.PI * k * frequency * t);
                        k += 1;
                    }
                    result.push(amp * sample);
                }

                break;

            case "fm": // FM
                /**
                * TODO: Complete this generator
                **/
                // Obtain all the required parameters
                var carrierFrequency = parseInt($("#fm-carrier-frequency").val());
                var carrierAmplitude = parseFloat($("#fm-carrier-amplitude").val());
                var modulationFrequency = parseInt($("#fm-modulation-frequency").val());
                var modulationAmplitude = parseFloat($("#fm-modulation-amplitude").val());
                var useADSR = $("#fm-use-adsr").prop("checked");
                var useFreq = $("#fm-use-freq-multiplier").prop("checked");

                if (useFreq) {
                    carrierFrequency = parseFloat(carrierFrequency) * frequency;
                    modulationFrequency = parseFloat(modulationFrequency) * frequency;
                }

                for (var i = 0; i < totalSamples; i++) {
                    var t = i / sampleRate;
                    var modulator = modulationAmplitude * Math.sin(2 * Math.PI * modulationFrequency * t);
                    result.push(amp * carrierAmplitude * Math.sin(2 * Math.PI * carrierFrequency * t + modulator));
                }

                if (useADSR) { // Obtain the ADSR parameters
                    var tempdecay = decayDuration;
                    var attackDuration = parseFloat($("#fm-adsr-attack-duration").val()) * sampleRate;
                    var decayDuration = parseFloat($("#fm-adsr-decay-duration").val()) * sampleRate;
                    var releaseDuration = parseFloat($("#fm-adsr-release-duration").val()) * sampleRate;
                    var sustainLevel = parseFloat($("#fm-adsr-sustain-level").val()) / 100.0;

                    for (var i = 0; i < totalSamples; ++i) {
                        // TODO: Complete the ADSR postprocessor
                        // Hinst: You can use the function lerp() in utility.js
                        // for performing linear interpolation
                        var t = i / sampleRate;
                        var modulator = modulationAmplitude * Math.sin(2 * Math.PI * modulationFrequency * t);

                        if (i <= attackDuration) {
                            var multiplier = i / attackDuration;
                            result[i] = amp * carrierAmplitude * Math.sin(2 * Math.PI * carrierFrequency * t + modulator * multiplier);
                        }

                        else if (i > attackDuration && i <= (attackDuration + decayDuration)) {
                            var amt = (i - attackDuration) / decayDuration;
                            var multiplier = lerp(1, sustainLevel, amt);
                            result[i + tempdecay] *= amp * carrierAmplitude * Math.sin(2 * Math.PI * carrierFrequency * t + modulator * multiplier);
                            tempdecay -= 2;
                        }

                        else if (i > (attackDuration + decayDuration) && i <= (totalSamples - releaseDuration)) {
                            result[i] = amp * carrierAmplitude * Math.sin(2 * Math.PI * carrierFrequency * t + modulator * sustainLevel);
                        }

                        else {
                            var multiplier = sustainLevel * (totalSamples - 1 - i) / releaseDuration;
                            result[i] = amp * carrierAmplitude * Math.sin(2 * Math.PI * carrierFrequency * t + modulator * multiplier);
                        }
                    }
                }

                break;

            case "repeating-narrow-pulse": // Repeating narrow pulse
                var cycle = Math.floor(sampleRate / frequency);
                for (var i = 0; i < totalSamples; ++i) {
                    if (i % cycle === 0) {
                        result.push(amp * 1.0);
                    } else if (i % cycle === 1) {
                        result.push(amp * -1.0);
                    } else {
                        result.push(0.0);
                    }
                }
                break;

            default:
                break;
        }

        return result;
    }
};
