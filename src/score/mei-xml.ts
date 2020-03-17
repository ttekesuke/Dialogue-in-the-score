import { Note } from "./note";
import { ConstantValue } from "src/constants/constants";
import { Meter } from "./meter";
export class MeiXML {
  meterList: Meter[] = [];
  noteList: Note[][] = [[]];

  measureListXml: string[] =[];
  noteListXml: string[] = [];
  scoreXml: string = "";

  constructor(init?: Partial<MeiXML>) {
    Object.assign(this, init);
    for(let measureCounter = 0; measureCounter < this.noteList.length; measureCounter++) {
      this.noteListXml = [];

      for (let noteCounterInMeasure = 0; noteCounterInMeasure < this.noteList[measureCounter].length; noteCounterInMeasure++) {
        let noteXml = this.noteList[measureCounter][noteCounterInMeasure].isRest ?
        `<rest dur="${ConstantValue.minDuration}" />`:
        `<note xml:id="${noteCounterInMeasure}" dur="${ConstantValue.minDuration}" 
        oct="${this.noteList[measureCounter][noteCounterInMeasure].octave}" pname="${this.noteList[measureCounter][noteCounterInMeasure].pitchName}" 
        ${this.noteList[measureCounter][noteCounterInMeasure].accidental ? 'accid="' + this.noteList[measureCounter][noteCounterInMeasure].accidental + '"' : ""} />`;

        this.noteListXml.push(noteXml);
      }
      let measureXml = `<measure n="${measureCounter}">
      <staff>
        <layer n="1" xml:id="layer-main">${this.noteListXml.join("")}</layer>
      </staff>
      </measure>`
      this.measureListXml.push(measureXml);
    } 

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
              <scoreDef meter.unit="${this.meterList[0].meterUnit}" meter.count="${this.meterList[0].meterCount}">
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
