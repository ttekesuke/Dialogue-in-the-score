import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import * as verovio from "verovio";
import * as wad from "web-audio-daw";
import { ScoreTemplate } from "../xml/score-template"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  score: SafeHtml;
  logging: boolean = false;
  voice: any = new wad({ source: "mic" });
  tuner: any = new wad.Poly();
  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.tuner.setVolume(0);
    this.tuner.add(this.voice);
  }

  start() {
    this.voice.play();
    this.tuner.updatePitch();
    this.logging = true;
    this.logPitch();
  }

  logPitch() {
    if (!this.logging) return;
    console.log(this.tuner?.pitch, this.tuner?.noteName);
    requestAnimationFrame(this.logPitch.bind(this));
  }

  stop() {
    this.tuner.stopUpdatingPitch();
    this.logging = false;
  }

  scoreRendering() {
    var vrvToolkit = new verovio.toolkit();
    var svg = vrvToolkit.renderData(ScoreTemplate.XmlStrings, {});
    this.score = this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
