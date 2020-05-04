import { Component, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import * as verovio from "verovio";
import { MeiService, latestNoteElement } from "src/service/mei.service";
import { Note } from "src/score/note";
import { MeterList } from "src/score/meter-list";
import { Meter } from "src/score/meter";
import { FormBuilder, FormGroup, FormControl, AbstractControl } from "@angular/forms";
import { Dropdown } from "src/interface/dropdown";
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
  meterUnitList: Dropdown[] = MeterList.meterList;
  meterCountList: Dropdown[];
  tempo: number = 0;
  minTempo: number = ConstantValue.minTempo;
  maxTempo: number = ConstantValue.maxTempo;
  clefShapeList: Dropdown[] = ClefList.clefList;
  clefLineList: Dropdown[];
  keyList: Dropdown[] = KeyList.keyList;
  keyModeList: Dropdown[] = KeyList.keyModeList;

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
      clefShape: [ConstantValue.initClefShape],
      clefLine: [],
      key: [ConstantValue.initKey],
      keyMode: [ConstantValue.initKeyMode]
    });

    this.meterCountList = Common.getRecordInAssociativeArray(MeterList.meterList, "value", ConstantValue.initMeterUnit).count;
    this.form.get(["meterCount"]).setValue(ConstantValue.initMeterCount);
    this.clefLineList = Common.getRecordInAssociativeArray(ClefList.clefList, "value", ConstantValue.initClefShape).line;
    this.form.get(["clefLine"]).setValue(ConstantValue.initClefLine);

    this.setMeter();
    this.tempo = ConstantValue.initTempo;
  }

  onBlurTempo(){
    const tempo = this.form.get("tempo");
    this.normalizeTempo(tempo);
    this.tempo = +tempo.value;
  }

  onChangeMeterCount(){
    this.setMeter();
  }

  onChangeMeterUnit(){
    const countInfo = Common.getRecordInAssociativeArray(MeterList.meterList, "value", this.form.get("meterUnit").value);
    this.meterCountList = countInfo.count;
    this.form.get(["meterCount"]).setValue(countInfo.count[0].value);
    this.setMeter();
  }

  onChangeClefShape(){
    this._mei.clefShape = this.form.get("clefShape").value;
    const clefInfo = Common.getRecordInAssociativeArray(ClefList.clefList, "value", this.form.get("clefShape").value);
    this.clefLineList = clefInfo.line;
    this.form.get(["clefLine"]).setValue(clefInfo.line[0].value);
    this._mei.clefLine = this.form.get("clefLine").value;
  }

  onChangeClefLine(){
    this._mei.clefLine = this.form.get("clefLine").value;
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

    this.numberOfMinDurationsInMeasure =
      (meter.meterCount * ConstantValue.minDuration) / 
      meter.meterUnit;
  }

  

  normalizeTempo(tempo: AbstractControl){
    
    if(tempo.value < ConstantValue.minTempo ){
      tempo.setValue(ConstantValue.minTempo);
    } else if(tempo.value > ConstantValue.maxTempo){
      tempo.setValue(ConstantValue.maxTempo);
    }
  }

  disableFormControls(){
    this.form.controls["tempo"].disable()
    this.form.controls["meterCount"].disable()
    this.form.controls["meterUnit"].disable()
    this.form.controls["clefShape"].disable()
    this.form.controls["clefLine"].disable()
    this.form.controls["key"].disable()
    this.form.controls["keyMode"].disable()
  }

  enableFormControls(){
    this.form.controls["tempo"].enable()
    this.form.controls["meterCount"].enable();
    this.form.controls["meterUnit"].enable();
    this.form.controls["clefShape"].enable();
    this.form.controls["clefLine"].enable();
    this.form.controls["key"].enable();
    this.form.controls["keyMode"].enable();
  }

  startGeneratingScore() {
    //init
    this.generatingScore = true;
    this.measureElementList = [];
    this.latestNoteElement = null;
    this.scoreViewData = null;
    let measureCounter = 0;
    this.noteCounterInMeasure = 0;
    let beforeNoteElement: Element;
    this.vrvToolkit = new verovio.toolkit();
    this.disableFormControls();

    this._mei.numberOfMinDurationsInMeasure = this.numberOfMinDurationsInMeasure;
    let meter = this.meterList[0];
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
    }, ((60 * 1000) / +this.tempo / ConstantValue.minDuration) * ConstantValue.baseDurationForTempo);
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

  stopGeneratingScore() {
    this.generatingScore = false;
    clearInterval(this.repeatScoreRendering);
    this.enableFormControls();
  }

  startPlayback(){

  }

  stopPlayback(){
    
  }
  ngOnDestroy() {
    this._audio.context.close();
  }
}
