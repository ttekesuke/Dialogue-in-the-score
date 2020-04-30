import { Dropdown } from "src/interface/dropdown";
export class KeyList {
    static readonly keyList: Dropdown[] = [
      { value: "C", label: "C" },
      { value: "C#", label: "C#" },
      { value: "Db", label: "Db" },
      { value: "D", label: "D" },
      { value: "D#", label: "D#" },
      { value: "Eb", label: "Eb" },
      { value: "E", label: "E" },
      { value: "Fb", label: "Fb" },
      { value: "F", label: "F" },
      { value: "F#", label: "F#" },
      { value: "Gb", label: "Gb" },
      { value: "G", label: "G" },
      { value: "G#", label: "G#" },
      { value: "Ab", label: "Ab" },
      { value: "A", label: "A" },
      { value: "A#", label: "A#" },
      { value: "Bb", label: "Bb" },
      { value: "B", label: "B" },
      { value: "Cb", label: "Cb" },
    ];
    static readonly keyModeList: Dropdown[] = [
      { value: "major", label: "Major" },
      { value: "minor", label: "Minor"},
    ];
}