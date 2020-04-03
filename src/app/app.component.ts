import { Component, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import * as verovio from "verovio";
import { MeiService } from "src/service/mei.service";
import { Note } from "src/score/note";
import { MeterList } from "src/score/meter-list";
import { Meter } from "src/score/meter";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Dropdown as IDropdown } from "src/interface/dropdown";
import { ConstantValue } from "src/constants/constant-value";
import { AudioService } from "src/service/audio.service";
import { Common } from "src/utility/common";
import { ScoreView } from 'src/score/score-view';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {
  form: FormGroup;
  meterUnitList: IDropdown[] = MeterList.meterUnit;
  meterCountList: IDropdown[] = MeterList.meterCount;
  minTempo: number = ConstantValue.minTempo;
  maxTempo: number = ConstantValue.maxTempo;

  scoreViewData: ScoreView[];
  noteList: Note[] = [];
  noteElementList: Element[] = [];
  meterList: Meter[] = [];
  numberOfMinDurationsInMeasure: number;
  noteCounterInMeasure: number = 0;
  vrvToolkit: any;
  repeatScoreRendering: any;
  widthOfScore: number;

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
      tempo: [ConstantValue.initTempo]
    });

    this.setMeter();
  }

  setMeter() {
    const meter: Meter = {
      meterCount: this.form.get("meterCount").value,
      meterUnit: this.form.get("meterUnit").value
    };
    this.meterList = new Array<Meter>(ConstantValue.initMaxMeasureLength).fill(
      meter
    );
  }

  start() {
    this.scoreViewData = [];
    this.noteList = [];
    this.noteElementList = [];

    this.vrvToolkit = new verovio.toolkit();

    let measureCounter = 0;

    this.repeatScoreRendering = setInterval(() => {
      this.scrollToRightEnd();

      let note: Note;
      let frequency = this._audio.getFrequency();

      if (this.isAvailableFrequency(frequency)) {
        let noteName =
          ConstantValue.noteNames[Common.frequencyToNoteNumber(frequency)];
        let noteInfo = noteName.split("");
        note = {
          pitchName: noteInfo.shift(),
          octave: +noteInfo.pop() - 1,
          isRest: false
        };
        if (noteInfo.length > 0) {
          note.accidental = "s";
        }
      } else {
        note = { isRest: true };
      }

      let meter = this.meterList[measureCounter];
      this.numberOfMinDurationsInMeasure =
        (meter.meterCount * ConstantValue.minDuration) / meter.meterUnit;

      this.noteList.push(note);
      this.scoreRendering(this.noteList, meter, measureCounter);

      
      // when reach to the end of current measure
      if (this.noteCounterInMeasure == this.numberOfMinDurationsInMeasure - 1) {
        this.noteCounterInMeasure = 0;
        this.noteList = [];
        this.noteElementList = [];
        
        // when reach to the maximum of the displaying measure length
        if (measureCounter == ConstantValue.initMaxMeasureLength - 1) {
          this.scoreViewData.shift();
        } else{
          measureCounter += 1;
        }
      }else{
        this.noteCounterInMeasure += 1;
      }
            
    }, ((60 * 1000) / +this.form.get("tempo").value / ConstantValue.minDuration) * ConstantValue.baseDurationForTempo);
  }

  isAvailableFrequency(frequency: number) {
    return (
      frequency >
        Common.noteNumberToFrequency(ConstantValue.minAvailableNote) &&
      frequency < Common.noteNumberToFrequency(ConstantValue.maxAvailableNote)
    );
  }

  scoreRendering(noteList: Note[], meter: Meter, measureCounter: number) {
    this._mei.createScoreOnInit(this.numberOfMinDurationsInMeasure);
    const baseScore = this._mei.createBaseScore(meter);
    const spacingNotes = this._mei.createSpacingNotes();
    this.noteElementList = this._mei.createNotes(
      noteList,
      this.noteElementList
    );
    const measure = this._mei.createMeasure(
      measureCounter,
      this.noteElementList,
      spacingNotes
    );
    const sectionNode = baseScore.getElementsByTagName("section");

    sectionNode[0].appendChild(measure);

    const serializer = new XMLSerializer();
    const scoreXmlString = serializer.serializeToString(baseScore);
    const scoreOptions = ConstantValue.scoreOptions;
    const svg = this.vrvToolkit.renderData(scoreXmlString, scoreOptions);
    this.widthOfScore = this.getWidthOfScore(svg) * (measureCounter + 1) + 1000;
    this.scoreViewData[measureCounter] = {
      svg: this._sanitizer.bypassSecurityTrustHtml(svg),
      measureNumber: measureCounter
    }
    
    
    if (this.numberOfMinDurationsInMeasure - 1 == this.noteCounterInMeasure) {
      
      this.scoreViewData.push();
    }
  }

  trackByFunc(index: number, value: ScoreView){
    return value ? value.measureNumber: null;

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
