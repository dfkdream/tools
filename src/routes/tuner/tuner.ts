function rms(data: Float32Array): number {
    let rms = 0;

    for (let i = 0; i < data.length; i++) {
        rms += data[i] * data[i];
    }

    return Math.sqrt(rms / data.length);
}

function autocorrelation(data: Float32Array, offset: number): number {
    const searchSize = Math.trunc(data.length / 2);
    let difference = 0;

    for (let i = 0; i < searchSize; i++) {
        difference += Math.abs(data[i] - data[i + offset]);
    }

    return difference / searchSize;
}

type strings = {
    [key: string]: number;
};

export type TunerConfig = {
    gain: number;
    fftsize: number;
    rmsMinimum: number;
    rmsAttackThreshold: number;
    attackDelay: number;
    assessmentDuration: number;
    strings: strings;
    bandpassFrequency: number;
    bandpassQ: number;
};

type stringCandidates = {
    [key: string]: stringAssessmentValues;
};

type stringAssessmentValues = {
    offset: number;
    difference: number;
};

export class Tuner {
    config: TunerConfig;
    rawDataCallback?: (data: Float32Array, rms: number) => void;
    resultCallback?: (assessedString: string, frequency: number) => void;
    mediaDevice: MediaDevices;

    audioContext: AudioContext;
    analyser: AnalyserNode;
    buffer: Float32Array;
    stream!: MediaStream;

    isActive: boolean;

    stringCandidates: stringCandidates = {};

    constructor(
        config: TunerConfig,
        callback?: (data: Float32Array, rms: number) => void,
        resultCallback?: (assessedString: string, frequency: number) => void,
    ) {
        this.config = config;
        this.rawDataCallback = callback;
        this.resultCallback = resultCallback;
        this.buffer = new Float32Array(config.fftsize);
        this.isActive = false;

        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.config.fftsize;
        this.analyser.smoothingTimeConstant = 0;

        this.mediaDevice = navigator.mediaDevices;
        if (!this.mediaDevice) {
            throw new Error("MediaDevices not supported");
        }

        this.populateStringCandidates();

        this.attachMicrophone();
    }

    populateStringCandidates() {
        for (const string in this.config.strings) {
            this.stringCandidates[string] = {
                offset: Math.round(
                    this.audioContext.sampleRate / this.config.strings[string],
                ),
                difference: 0,
            };
        }
    }

    resetStringCandidates() {
        for (const string in this.stringCandidates) {
            this.stringCandidates[string].difference = 0;
        }
    }

    rmsLast: number = 0;
    waitForStabilizationUntil: DOMHighResTimeStamp = 0;
    assessStringUntil: DOMHighResTimeStamp = 0;
    analyse(time: DOMHighResTimeStamp) {
        if (this.isActive) requestAnimationFrame(this.analyse.bind(this));

        this.analyser.getFloatTimeDomainData(this.buffer);
        const volume = rms(this.buffer);

        if (this.rawDataCallback) this.rawDataCallback(this.buffer, volume);

        if (volume < this.config.rmsMinimum) return;

        if (volume > this.rmsLast + this.config.rmsAttackThreshold) {
            this.waitForStabilizationUntil = time + this.config.attackDelay;
            this.assessStringUntil =
                this.waitForStabilizationUntil + this.config.assessmentDuration;

            this.resetStringCandidates();
        }

        this.rmsLast = volume;

        if (time < this.waitForStabilizationUntil) return;

        if (time > this.assessStringUntil) return;

        for (const stringName in this.stringCandidates) {
            const offset = this.stringCandidates[stringName].offset;
            const difference = autocorrelation(this.buffer, offset);
            this.stringCandidates[stringName].difference += difference * offset;
        }

        let assessedStringName = "";
        let minDifference = Number.POSITIVE_INFINITY;
        for (const stringName in this.stringCandidates) {
            const difference = this.stringCandidates[stringName].difference;
            if (difference < minDifference) {
                assessedStringName = stringName;
                minDifference = difference;
            }
        }

        let actualOffset = this.stringCandidates[assessedStringName].offset;
        const searchStart = actualOffset - 10;
        const searchEnd = actualOffset + 10;
        minDifference = Number.POSITIVE_INFINITY;

        for (let offset = searchStart; offset < searchEnd; offset++) {
            let difference = autocorrelation(this.buffer, offset);
            if (difference < minDifference) {
                minDifference = difference;
                actualOffset = offset;
            }
        }

        if (this.resultCallback)
            this.resultCallback(
                assessedStringName,
                this.audioContext.sampleRate / actualOffset,
            );
    }

    async attachMicrophone() {
        this.stream = await this.mediaDevice.getUserMedia({ audio: true });
        const source = this.audioContext.createMediaStreamSource(this.stream);

        const inputGain = this.audioContext.createGain();
        inputGain.gain.value = this.config.gain;

        const filter = new BiquadFilterNode(this.audioContext, {
            type: "bandpass",
            frequency: this.config.bandpassFrequency,
            Q: this.config.bandpassQ,
        });

        source.connect(inputGain);
        inputGain.connect(filter);
        filter.connect(this.analyser);

        this.isActive = true;

        requestAnimationFrame(this.analyse.bind(this));
    }

    async detatchMicrophone() {
        this.stream.getAudioTracks().forEach((track) => {
            track.stop();
        });

        this.isActive = false;
    }
}
