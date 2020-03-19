import { Component, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import * as verovio from "verovio";
import { MeiXML } from "src/score/mei-xml";
import { Note } from "src/score/note";
import { MeterList } from "src/score/meter-list";
import { Meter } from "src/score/meter";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Dropdown as IDropdown } from "src/interface/dropdown";
import { ConstantValue } from "src/constants/constant-value";
import { AudioService } from "src/service/audio.service";
import { Common } from "src/utility/common";

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

  score: SafeHtml;
  noteList: Note[][] = [[]];
  meterList: Meter[] = [];

  vrvToolkit: any;
  repeatScoreRendering: any;

  constructor(
    private _sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private _audio: AudioService
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
    this.meterList = new Array<Meter>(ConstantValue.maxDisplayMeasure).fill(
      meter
    );
  }

  start() {
    this.score = null;
    this.noteList = [[]];

    this.vrvToolkit = new verovio.toolkit();
    let noteCounterInMeasure = 0;
    let measureCounter = 0;

    this.repeatScoreRendering = setInterval(() => {
      if (
        noteCounterInMeasure ==
        (this.meterList[measureCounter].meterCount *
          ConstantValue.minDuration) /
          this.meterList[measureCounter].meterUnit
      ) {
        noteCounterInMeasure = 0;
        this.noteList.push([]);
        if (measureCounter == ConstantValue.maxDisplayMeasure - 1) {
          this.noteList.shift();
        } else {
          measureCounter += 1;
        }
      }

      let note: Note;
      let frequency = this._audio.getFrequency();

      if (this.isAvailableFrequency(frequency)) {
        let noteName =
          ConstantValue.noteNames[Common.frequencyToNoteNumber(frequency)];
        let noteInfo = noteName.split("");
        note = {
          pitchName: noteInfo.shift().toLowerCase(),
          octave: +noteInfo.pop(),
          isRest: false
        };
        if (noteInfo.length > 0) {
          note.accidental = "s";
        }
      } else {
        note = { isRest: true };
      }
      this.noteList[measureCounter].push(note);
      this.scoreRendering(this.noteList, this.meterList);
      noteCounterInMeasure += 1;
    }, ((60 * 1000) / +this.form.get("tempo").value / ConstantValue.minDuration) * ConstantValue.baseDurationForTempo);
  }

  isAvailableFrequency(frequency: number) {
    return (
      frequency > ConstantValue.minAvailableFrequency &&
      frequency < ConstantValue.maxAvailableFrequency
    );
  }
  scoreRendering(noteList: Note[][], meterList: Meter[]) {
    const meiXmlParam = {
      noteList: noteList,
      meterList: meterList
    };
    var meiXml = new MeiXML(meiXmlParam);
    var svg = this.vrvToolkit.renderData(meiXml.scoreXml, ConstantValue.scoreOptions);
    this.score = this._sanitizer.bypassSecurityTrustHtml(svg);
  }

  stop() {
    clearInterval(this.repeatScoreRendering);
  }

  ngOnDestroy(){
    this._audio.context.close()
  }
}
