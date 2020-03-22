import { ConstantValue } from "src/constants/constant-value";

export class Common {
  static frequencyToNoteNumber(frequency: number) {
    const noteNumber =
      ConstantValue.numberOfEqualTemperament * (Math.log(frequency / ConstantValue.standardA4Pitch) / Math.log(2));
    return Math.round(noteNumber) + ConstantValue.standardA4NoteNumber;
  }

  static noteNumberToFrequency(noteNumber) {
    return ConstantValue.standardA4Pitch * Math.pow(2, (noteNumber - ConstantValue.standardA4NoteNumber) / ConstantValue.numberOfEqualTemperament);
  }
}
