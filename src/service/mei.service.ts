import { Injectable } from "@angular/core";
import { Note } from "src/score/note";
import { ConstantValue } from "src/constants/constant-value";
import { Meter } from "src/score/meter";
@Injectable({
  providedIn: 'root'
})
export class MeiService {
  numberOfMinDurationsInMeasure: number;
  constructor() {}

  createScoreOnInit(numberOfMinDurationsInMeasure: number) {
    this.numberOfMinDurationsInMeasure =numberOfMinDurationsInMeasure

   
    // const sectionNode = this.scoreBaseXml.getElementsByTagName("section");

    //   sectionNode[0].appendChild(measureXml);
  }

  createBaseScore(meter: Meter): Element {
    let scoreBaseXml = document.implementation.createDocument("", "", null);

    const meiNode = document.createElementNS(null, "mei");
    meiNode.setAttribute("meiversion", "3.0.0");
     scoreBaseXml.appendChild(meiNode);

    const meiHeadNode = document.createElementNS(null, "meiHead");
    meiNode.appendChild(meiHeadNode);

    const musicNode = document.createElementNS(null, "music");
    meiNode.appendChild(musicNode);

    const bodyNode = document.createElementNS(null, "body");
    musicNode.appendChild(bodyNode);

    const mdivNode = document.createElementNS(null, "mdiv");
    bodyNode.appendChild(mdivNode);

    const scoreNode = document.createElementNS(null, "score");
    mdivNode.appendChild(scoreNode);

    const scoreDefNode = document.createElementNS(null, "scoreDef");
    scoreDefNode.setAttribute("meter.unit", meter.meterUnit.toString());
    scoreDefNode.setAttribute("meter.count", meter.meterCount.toString());
    scoreNode.appendChild(scoreDefNode);

    const staffGrpNode = document.createElementNS(null, "staffGrp");
    staffGrpNode.setAttribute("symbol", "brace");
    staffGrpNode.setAttribute("label", "");
    scoreDefNode.appendChild(staffGrpNode);

    const staffDefNode = document.createElementNS(null, "staffDef");
    staffDefNode.setAttribute("clef.shape", "G");
    staffDefNode.setAttribute("clef.line", "2");
    staffDefNode.setAttribute("n", "1");
    staffDefNode.setAttribute("lines", "5");
    staffGrpNode.appendChild(staffDefNode);

    const sectionNode = document.createElementNS(null, "section");
    scoreNode.appendChild(sectionNode);
    return meiNode;
  }

  createSpacingNotes(): Element[] {
    let spacingNoteListXml = [];
    for (let i = 0; i < this.numberOfMinDurationsInMeasure; i++) {
      let spacingNoteElement: Element = document.createElementNS(null, "note");
      spacingNoteElement.setAttribute(
        "dur",
        ConstantValue.minDuration.toString()
      );
      spacingNoteElement.setAttribute("oct", "5");
      spacingNoteElement.setAttribute("pname", "c");
      spacingNoteElement.setAttribute("stem.dir", "up");
      spacingNoteElement.setAttribute("accid", "s");
      spacingNoteListXml.push(spacingNoteElement);
    }
    return spacingNoteListXml;
  }


  createNotes(beforeNoteElement: Element, currentNote: Note, noteCounterInMeasure: number): latestNoteElement {
 
    let beforeNote: Note;
    
    if(beforeNoteElement && noteCounterInMeasure !== 0){
      beforeNote = {
        isRest: beforeNoteElement.tagName === "rest" ? true: false,
        pitchName: beforeNoteElement.getAttributeNS(null, "pname"),
        accidental: beforeNoteElement.getAttributeNS(null, "accid"),
        octave: +beforeNoteElement.getAttributeNS(null, "oct"),
      }
    }

    let noteElement: Element = this.createBaseNote(currentNote);
    let resultNoteElementList: latestNoteElement = new latestNoteElement();
    resultNoteElementList.before = beforeNoteElement;


    //create rest-note
    if (currentNote.isRest) {
      noteElement = this.setAttributes(noteElement, ConstantValue.minDuration);
      resultNoteElementList.current = noteElement;

      //create note
    } else {
      if (
        !beforeNote ||
        (beforeNote &&
          (currentNote.pitchName !== beforeNote.pitchName ||
            currentNote.octave !== beforeNote.octave ||
            currentNote.accidental !== currentNote.accidental ||
            beforeNote.isRest))
      ) {
        noteElement = this.setAttributes(
          noteElement,
          ConstantValue.minDuration
        );
        resultNoteElementList.current = noteElement;
        
  
      } else {
        // require to change the beforeNote's length
        
        switch (beforeNoteElement.getAttribute("dur")) {
          case "16":
            noteElement = this.setAttributes(noteElement, 8);
            resultNoteElementList.before = noteElement;
            break;
          case "8":
            if (!beforeNoteElement.getAttribute("dots")) {
              noteElement = this.setAttributes(noteElement, 8, 1);
              resultNoteElementList.before = noteElement;
            } else {
              noteElement = this.setAttributes(noteElement, 4);
              resultNoteElementList.before = noteElement;
            }
            break;
          case "4":
            noteElement = this.setAttributes(
              noteElement,
              ConstantValue.minDuration
            );
            resultNoteElementList.current = noteElement;
        }
        


      }
    }

    return resultNoteElementList;
  }

  createBaseNote(currentNote: Note): Element {
    let note: Element;

    if (currentNote.isRest) {
      note = document.createElementNS(null, "rest");
    } else {
      note = document.createElementNS(null, "note");
      let stemDir =
        currentNote.octave >= ConstantValue.boundaryOctaveNumberOfStemDirection
          ? "down"
          : "up";
      note.setAttribute("stem.dir", stemDir);
      note.setAttribute("oct", currentNote.octave.toString());
      note.setAttribute("pname", currentNote.pitchName);
      if (currentNote.accidental) {
        note.setAttribute("accid", currentNote.accidental);
      }
    }

    return note;
  }

  setAttributes(element: Element, dur: number, dots?: number): Element {
    element.setAttribute("dur", dur.toString());
    if (dots) {
      element.setAttribute("dots", dots.toString());
    }
    return element;
  }

  createMeasure(
    measureNumber: number,
    spacingNoteElement: Element[]
  ): Element {
    const measureNode = document.createElementNS(null, "measure");
    measureNode.setAttribute("n", (measureNumber + 1).toString());

    const staffNode = document.createElementNS(null, "staff");
    measureNode.appendChild(staffNode);

    const layerMainNode = document.createElementNS(null, "layer");
    layerMainNode.setAttribute("xml:id", "layer-main");
    staffNode.appendChild(layerMainNode);

    const layerSpacingNode = document.createElementNS(null, "layer");
    layerSpacingNode.setAttribute("xml:id", "layer-spacing");
    for (let spacingNote of spacingNoteElement) {
      layerSpacingNode.appendChild(spacingNote);
    }
    staffNode.appendChild(layerSpacingNode);

    return measureNode;
  }


  
}
export class latestNoteElement {
  before: Element;
  current: Element;
}