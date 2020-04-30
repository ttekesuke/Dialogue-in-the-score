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
import { ClefList } from 'src/score/clef-list';
import { KeyList } from 'src/score/key-list';





@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  form: FormGroup;
  meterUnitList: IDropdown[] = MeterList.meterUnit;
  meterCountList: IDropdown[];
  minTempo: number = ConstantValue.minTempo;
  maxTempo: number = ConstantValue.maxTempo;
  clefList: IDropdown[] = ClefList.clefList;
  keyList: IDropdown[] = KeyList.keyList;
  keyModeList: IDropdown[] = KeyList.keyModeList;

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
  generatingScore:boolean = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private _audio: AudioService,
    private _mei: MeiService
  ) {}

  ngOnInit() {
    this.form = this._formBuilder.group({
      meterCount: [],
      meterUnit: [ConstantValue.initMeterUnit],
      tempo: [ConstantValue.initTempo],
      clef: [ConstantValue.initClef],
      key: [ConstantValue.initKey],
      keyMode: [ConstantValue.initKeyMode]
    });

    this.meterCountList = MeterList.meterList[ConstantValue.initMeterUnit];
    this.form.get(["meterCount"]).setValue(ConstantValue.initMeterCount);

    this.setMeter();
  }

  onChangeMeterCount(){
    this.setMeter();
  }

  onChangeMeterUnit(){
    this.meterCountList = MeterList.meterList[this.form.get("meterUnit").value];
    this.setMeter();
  }

  onChangeClef(){

  }

  onChangeKey(){

  }

  onChangeKeyMode(){

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
  normalizeTempo(){
    const tempo = this.form.get("tempo");
    if(tempo.value < ConstantValue.minTempo ){
      tempo.setValue(ConstantValue.minTempo);
    } else if(tempo.value > ConstantValue.maxTempo){
      tempo.setValue(ConstantValue.maxTempo);
    }
  }

  start() {
    //init
    this.generatingScore = true;
    this.measureElementList = [];
    this.latestNoteElement = null;
    this.scoreViewData = null;
    let measureCounter = 0;
    this.noteCounterInMeasure = 0;
    let beforeNoteElement: Element;
    this.vrvToolkit = new verovio.toolkit();
    let meter = this.meterList[measureCounter];
    this.numberOfMinDurationsInMeasure =
      (meter.meterCount * ConstantValue.minDuration) / meter.meterUnit;

    this._mei.createScoreOnInit(this.numberOfMinDurationsInMeasure);
    this.baseScore = this._mei.createBaseScore(meter);

    // run at 16-note intervals
    this.repeatScoreRendering = setInterval(() => {

      this.scrollToRightEnd();
      const currentNote: Note = this.detectPitch();

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

      // Get elements with a rhythm assigned to it
      this.latestNoteElement = this._mei.createLatestNotes(
        beforeNoteElement,
        currentNote,
        this.noteCounterInMeasure
      );
      
      const layerNode = this.measureElementList[
        this.measureElementList.length - 1
      ].getElementsByTagName("layer")[0];

      if(layerNode.hasChildNodes()){
        layerNode.removeChild(layerNode.lastChild);
      }

      // Attatching elements to layer-node
      if(this.latestNoteElement.before){
        layerNode.appendChild(this.latestNoteElement.before)
      }
       if (this.latestNoteElement.current) {
        layerNode.appendChild(this.latestNoteElement.current);
      }

      const sectionNode = this.baseScore.getElementsByTagName("section")[0];
      while (sectionNode.firstChild) {
        sectionNode.removeChild(sectionNode.firstChild);
      }
      for (let measure of this.measureElementList) {
        sectionNode.appendChild(measure);
      }

      this.scoreRendering();
      // when reach to the end of current measure
      if (this.noteCounterInMeasure == this.numberOfMinDurationsInMeasure - 1) {
        this.noteCounterInMeasure = 0;
        beforeNoteElement = null;

        // when reach to the maximum of the displaying measure length
        if (measureCounter == ConstantValue.initMaxMeasureLength - 1) {
          this.measureElementList.shift();
        } else {
          measureCounter += 1;
        }
      } else {
        this.noteCounterInMeasure += 1;
        beforeNoteElement = this.latestNoteElement.current ? this.latestNoteElement.current : this.latestNoteElement.before;
      }
    }, ((60 * 1000) / +this.form.get("tempo").value / ConstantValue.minDuration) * ConstantValue.baseDurationForTempo);
  }

  detectPitch(): Note {
    const frequency = this._audio.getFrequency();
    let note: Note;

    if (this.isAvailableFrequency(frequency)) {
      const noteName =
        ConstantValue.noteNames[Common.frequencyToNoteNumber(frequency)];
      const noteInfo = noteName.split("");
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

  scoreRendering() {
    const serializer = new XMLSerializer();
    const scoreXmlString = serializer.serializeToString(this.baseScore);
    const scoreOptions = ConstantValue.scoreOptions;
    const svg = this.vrvToolkit.renderData(scoreXmlString, scoreOptions);
    this.widthOfScore = this.getWidthOfScore(svg);
    this.scoreViewData = this._sanitizer.bypassSecurityTrustHtml(svg);
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
    this.generatingScore = false;
    clearInterval(this.repeatScoreRendering);
  }

  ngOnDestroy() {
    this._audio.context.close();
  }
}
