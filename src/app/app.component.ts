import { Component, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import * as verovio from "verovio";
import { MeiService, latestNoteElement } from "src/service/mei.service";
import { Note } from "src/score/note";
import { MeterList } from "src/score/meter-list";
import { Meter } from "src/score/meter";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Dropdown as IDropdown } from "src/interface/dropdown";
import { ConstantValue } from "src/constants/constant-value";
import { AudioService } from "src/service/audio.service";
import { Common } from "src/utility/common";
import { ScoreView } from "src/score/score-view";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  form: FormGroup;
  meterUnitList: IDropdown[] = MeterList.meterUnit;
  meterCountList: IDropdown[] = MeterList.meterCount;
  minTempo: number = ConstantValue.minTempo;
  maxTempo: number = ConstantValue.maxTempo;

  scoreViewData: SafeHtml;
  measureElementList: Element[] = [];
  meterList: Meter[] = [];
  numberOfMinDurationsInMeasure: number;
  noteCounterInMeasure: number = 0;
  vrvToolkit: any;
  repeatScoreRendering: any;
  widthOfScore: number;
  baseScore: Element;
  spacingNotes: Element[];
  latestNoteElement: latestNoteElement;
  constructor(
    private _sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private _audio: AudioService,
    private _mei: MeiService
  ) {}

  ngOnInit() {
    this.form = this._formBuilder.group({
      meterCount: [ConstantValue.initMeterCount],
      meterUnit: [ConstantValue.initMeterUnit],
      tempo: [ConstantValue.initTempo],
    });

    this.setMeter();
  }

  setMeter() {
    const meter: Meter = {
      meterCount: this.form.get("meterCount").value,
      meterUnit: this.form.get("meterUnit").value,
    };
    this.meterList = new Array<Meter>(ConstantValue.initMaxMeasureLength).fill(
      meter
    );
  }

  start() {
    this.measureElementList = [];
    this.latestNoteElement = null;
    this.vrvToolkit = new verovio.toolkit();
    this.scoreViewData = null;
    let measureCounter = 0;
    this.noteCounterInMeasure = 0;
    let meter = this.meterList[measureCounter];
    this.numberOfMinDurationsInMeasure =
      (meter.meterCount * ConstantValue.minDuration) / meter.meterUnit;
    this._mei.createScoreOnInit(this.numberOfMinDurationsInMeasure);
    this.baseScore = this._mei.createBaseScore(meter);
    let beforeNoteElement: Element;

    this.repeatScoreRendering = setInterval(() => {
      this.scrollToRightEnd();

      let currentNote: Note = this.detectPitch();

      // measure init
      if (this.noteCounterInMeasure == 0) {
        meter = this.meterList[measureCounter];

        this.numberOfMinDurationsInMeasure =
          (meter.meterCount * ConstantValue.minDuration) / meter.meterUnit;

        this.spacingNotes = this._mei.createSpacingNotes();
        let measureElement = this._mei.createMeasure(
          measureCounter,
          this.spacingNotes
        );
        this.measureElementList.push(measureElement);
      }

      this.latestNoteElement = this._mei.createNotes(
        beforeNoteElement,
        currentNote,
        this.noteCounterInMeasure
      );

      if(this.noteCounterInMeasure !== this.numberOfMinDurationsInMeasure - 1){
        beforeNoteElement = this.latestNoteElement.current ? this.latestNoteElement.current : this.latestNoteElement.before;
      } else {
        beforeNoteElement = null;
      }


      
      const layerNode = this.measureElementList[
        this.measureElementList.length - 1
      ].getElementsByTagName("layer")[0];

      if(layerNode.hasChildNodes()){
        layerNode.removeChild(layerNode.lastChild);
      }
      if(this.latestNoteElement.before){
        layerNode.appendChild(this.latestNoteElement.before)

      }
 
      if (this.latestNoteElement.current) {
        layerNode.appendChild(this.latestNoteElement.current);
      }

      const sectionNode = this.baseScore.getElementsByTagName("section");
      while (sectionNode[0].firstChild) {
        sectionNode[0].removeChild(sectionNode[0].firstChild);
      }
      for (let measure of this.measureElementList) {
        sectionNode[0].appendChild(measure);
      }

      this.scoreRendering(meter, measureCounter);
      // when reach to the end of current measure
      if (this.noteCounterInMeasure == this.numberOfMinDurationsInMeasure - 1) {
        this.noteCounterInMeasure = 0;

        // when reach to the maximum of the displaying measure length
        if (measureCounter == ConstantValue.initMaxMeasureLength - 1) {
          this.measureElementList.shift();
        } else {
          measureCounter += 1;
        }
      } else {
        this.noteCounterInMeasure += 1;
      }
    }, ((60 * 1000) / +this.form.get("tempo").value / ConstantValue.minDuration) * ConstantValue.baseDurationForTempo);
  }

  detectPitch(): Note {
    let frequency = this._audio.getFrequency();
    let note: Note;

    if (this.isAvailableFrequency(frequency)) {
      let noteName =
        ConstantValue.noteNames[Common.frequencyToNoteNumber(frequency)];
      let noteInfo = noteName.split("");
      note = {
        pitchName: noteInfo.shift(),
        octave: +noteInfo.pop() - 1,
        isRest: false,
      };
      if (noteInfo.length > 0) {
        note.accidental = "s";
      }
    } else {
      note = { isRest: true };
    }
    return note;
  }

  isAvailableFrequency(frequency: number) {
    return (
      frequency >
        Common.noteNumberToFrequency(ConstantValue.minAvailableNote) &&
      frequency < Common.noteNumberToFrequency(ConstantValue.maxAvailableNote)
    );
  }

  scoreRendering(meter: Meter, measureCounter: number) {
    const serializer = new XMLSerializer();
    const scoreXmlString = serializer.serializeToString(this.baseScore);
    const scoreOptions = ConstantValue.scoreOptions;
    const svg = this.vrvToolkit.renderData(scoreXmlString, scoreOptions);
    this.widthOfScore = this.getWidthOfScore(svg);
    this.scoreViewData = this._sanitizer.bypassSecurityTrustHtml(svg);
  }

  trackByFunc(index: number, value: ScoreView) {
    return value ? value.measureNumber : null;
  }

  getWidthOfScore(svgString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    return doc.documentElement["width"].baseVal.value;
  }

  scrollToRightEnd() {
    const scoreContainer = document.getElementById("score");
    scoreContainer.scrollLeft = this.widthOfScore;
  }

  stop() {
    clearInterval(this.repeatScoreRendering);
  }

  ngOnDestroy() {
    this._audio.context.close();
  }
}
