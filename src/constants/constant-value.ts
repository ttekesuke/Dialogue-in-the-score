import { Common } from "src/utility/common";

export class ConstantValue {
constructor(private _commonService: Common){

}

  static readonly initMaxMeasureLength = 20;
  static readonly minTempo = 30;
  static readonly maxTempo = 120;
  static readonly initMeterCount = 4;
  static readonly initMeterUnit = 8;
  static readonly initTempo = 60;
  static readonly initClefShape = "G";
  static readonly initClefLine = "2";
  static readonly initKey = "C";
  static readonly initKeyMode = "major";
  static readonly minDuration = 16; // means 16th-note
  static readonly baseDurationForTempo = 4; //means 4th-note
  static readonly standardA4Pitch = 442;
  static readonly standardA4NoteNumber = 69;
  static readonly numberOfEqualTemperament = 12;
  static readonly boundaryOctaveNumberOfStemDirection = 5;
  static readonly noteNames = [
    // Just an array of note names. This can be useful for mapping MIDI data to notes.
    "c0",
    "c#0",
    "d0",
    "d#0",
    "e0",
    "f0",
    "f#0",
    "g0",
    "g#0",
    "a0",
    "a#0",
    "b0",
    "c1",
    "c#1",
    "d1",
    "d#1",
    "e1",
    "f1",
    "f#1",
    "g1",
    "g#1",
    "a1",
    "a#1",
    "b1",
    "c2",
    "c#2",
    "d2",
    "d#2",
    "e2",
    "f2",
    "f#2",
    "g2",
    "g#2",
    "a2",
    "a#2",
    "b2",
    "c3",
    "c#3",
    "d3",
    "d#3",
    "e3",
    "f3",
    "f#3",
    "g3",
    "g#3",
    "a3",
    "a#3",
    "b3",
    "c4",
    "c#4",
    "d4",
    "d#4",
    "e4",
    "f4",
    "f#4",
    "g4",
    "g#4",
    "a4",
    "a#4",
    "b4",
    "c5",
    "c#5",
    "d5",
    "d#5",
    "e5",
    "f5",
    "f#5",
    "g5",
    "g#5",
    "a5",
    "a#5",
    "b5",
    "c6",
    "c#6",
    "d6",
    "d#6",
    "e6",
    "f6",
    "f#6",
    "g6",
    "g#6",
    "a6",
    "a#6",
    "b6",
    "c7",
    "c#7",
    "d7",
    "d#7",
    "e7",
    "f7",
    "f#7",
    "g7",
    "g#7",
    "a7",
    "a#7",
    "b7",
    "c8"
  ];
  static readonly minAvailableNote = 22;
  static readonly maxAvailableNote = 96
  static readonly scoreOptions = {
    breaks: "none",
    scale: 60,
    footer: "none",
    adjustPageHeight: 1,
    pageMarginLeft: 0,
    pageMarginRight:0,
    leftMarginMensur: 0,
    rightMarginMensur: 0,
    leftMarginBarLine: 0,
    rightMarginBarLine: 0,
    leftMarginLeftBarLine: 0,
    leftMarginRightBarLine: 0,
    rightMarginLeftBarLine: 0,
    rightMarginRightBarLine: 0,
    leftMarginClef: 0,
    leftMarginMeterSig: 0,
    rightMarginClef: 0,
    rightMarginMeterSig: 0,
    
  };
}
