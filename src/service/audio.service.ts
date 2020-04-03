import { Injectable } from "@angular/core";
import * as pitchfinder from "pitchfinder";
@Injectable({
  providedIn: "root"
})
export class AudioService {
  context: AudioContext;
  input: any;
  analyser: any;
  loaded: boolean;
  YINDetector = pitchfinder.YIN({ sampleRate: 48000 });

  constructor() {
    this.loaded = false;
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(stream => {
        this.context = new AudioContext();
        this.input = this.context.createMediaStreamSource(stream);
        this.analyser = this.context.createAnalyser();
        this.input.connect(this.analyser);
        this.loaded = true;
      });
  }

  getLevel() {
    if (this.loaded) {
      const result = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(result);
      return result.reduce((a, b) => Math.max(a, b));
    }
    return 0;
  }

  getFrequency(): number {
    const float32Array = new Float32Array(2048);
    this.analyser.getFloatTimeDomainData(float32Array);
    return this.YINDetector(float32Array);
  }
  close() {
    this.context.close();
  }
}
