import { Note } from "./note";
import { ConstantValue } from "src/constants/constant-value";
import { Meter } from "./meter";

export class MeiXML {
  meterList: Meter[] = [];
  noteList: Note[][] = [[]];
  measureListXml: string[] = [];
  noteListXml: string[] = [];
  spacingNoteListXml: string[] = [];
  scoreXml: string = "";
  parser: any = new DOMParser();

  constructor(init?: Partial<MeiXML>) {
    Object.assign(this, init);

    // create XML for measure
    for (
      let measureCounter = 0;
      measureCounter < this.noteList.length;
      measureCounter++
    ) {
      // create hidden notes to ensure the staff is drawn full width. Notes are hidden via css.
      this.createSpacingNotes(measureCounter);

      this.createNotes(measureCounter);

      this.createMeasure(measureCounter);
    }

    this.createScore();
  }

  createSpacingNotes(measureCounter: number) {
    this.spacingNoteListXml = [];
    for ( let i = 0; i <(this.meterList[measureCounter].meterCount * ConstantValue.minDuration) / this.meterList[measureCounter].meterUnit; i++ ) {
      this.spacingNoteListXml.push(
        `<note xml:id="rest-hidden-${i.toString()}" dur="16" oct="5" pname="c" stem.dir="up" accid="s" />`
      );
    }
  }

  createNotes(measureCounter: number) {
    this.noteListXml = [];

    let beforeNote: Note;
    for ( let noteCounterInMeasure = 0; noteCounterInMeasure < this.noteList[measureCounter].length; noteCounterInMeasure++ ) {
      let noteXml;
      let currentNote = this.noteList[measureCounter][noteCounterInMeasure];
      
      //create rest-note
      if (currentNote.isRest) {
        noteXml = `<rest dur="${ConstantValue.minDuration}" />`;
        //create note
      } else {
        let stemDir = currentNote.octave >= ConstantValue.boundaryOctaveNumberOfStemDirection ? "down" : "up"; 
        if (!beforeNote || (beforeNote && (( currentNote.pitchName !== beforeNote.pitchName || currentNote.octave !== beforeNote.octave || currentNote.accidental !== currentNote.accidental ) || beforeNote.isRest))) {
          noteXml = `<note xml:id="${noteCounterInMeasure}" stem.dir="${stemDir}" dur="${ConstantValue.minDuration}" oct="${currentNote.octave}" pname="${currentNote.pitchName}" ${currentNote.accidental? 'accid="' + currentNote.accidental + '"': ""} />`;
        } else {
          
          let beforeNoteNode = this.parser.parseFromString(this.noteListXml[this.noteListXml.length - 1], "application/xml");
          this.noteListXml.pop();
          switch(+beforeNoteNode.documentElement.attributes["dur"].value){
            case 16:
              noteXml =`<note xml:id="${noteCounterInMeasure}" stem.dir="${stemDir}" dur="8" oct="${currentNote.octave}" pname="${currentNote.pitchName}" ${currentNote.accidental? 'accid="' + currentNote.accidental + '"': ""} />`
              break;
            case 8:
              if(!beforeNoteNode.documentElement.attributes["dots"]){
                noteXml =  `<note xml:id="${noteCounterInMeasure}" stem.dir="${stemDir}" dur="8" dots="1" oct="${currentNote.octave}" pname="${currentNote.pitchName}" ${currentNote.accidental? 'accid="' + currentNote.accidental + '"': ""} />`
              }else{
                noteXml =`<note xml:id="${noteCounterInMeasure}" stem.dir="${stemDir}" dur="4" oct="${currentNote.octave}" pname="${currentNote.pitchName}" ${currentNote.accidental? 'accid="' + currentNote.accidental + '"': ""} />`
              }
              break;
            case 4:
              this.noteListXml.push(`<note xml:id="${noteCounterInMeasure}" stem.dir="${stemDir}" dur="4" oct="${currentNote.octave}" pname="${currentNote.pitchName}" ${currentNote.accidental? 'accid="' + currentNote.accidental + '"': ""} />`);
              noteXml = `<note xml:id="${noteCounterInMeasure}" stem.dir="${stemDir}" dur="${ConstantValue.minDuration}" oct="${currentNote.octave}" pname="${currentNote.pitchName}" ${currentNote.accidental? 'accid="' + currentNote.accidental + '"': ""} />`;
          }
        }
      }

      this.noteListXml.push(noteXml);
      
        beforeNote = noteCounterInMeasure == this.noteList[measureCounter].length - 1 ? null : currentNote;
      
      
    }
  }
  createMeasure(measureCounter: number) {
    let measureXml = `<measure n="${measureCounter}">
      <staff>
        <layer n="1" xml:id="layer-main">${this.noteListXml.join("")}</layer>
        <layer n="2" xml:id="layer-spacing">${this.spacingNoteListXml.join(
          ""
        )}</layer>
      </staff>
      </measure>`;
    this.measureListXml.push(measureXml);
  }

  createScore() {
    this.scoreXml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <?xml-model href="http://music-encoding.org/schema/3.0.0/mei-all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
    <?xml-model href="http://music-encoding.org/schema/3.0.0/mei-all.rng" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"?>
    <mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="3.0.0">
      <meiHead></meiHead>
      <music>
        <body>
          <mdiv>
            <score>
              <scoreDef meter.unit="${
                this.meterList[0].meterUnit
              }" meter.count="${this.meterList[0].meterCount}">
                <staffGrp symbol="brace" label="">
                  <staffDef clef.shape="G" clef.line="2" n="1" lines="5" />
                </staffGrp>
              </scoreDef>
              <section>${this.measureListXml.join("")}
              </section>
            </score>
          </mdiv>
        </body>
      </music>
    </mei>`;
  }
}
