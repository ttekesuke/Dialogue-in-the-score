import { Dropdown } from "src/interface/dropdown";
export class ClefList {
    static readonly clefList: Dropdown[] = [
      { value: "GG", label: "Double G clef" },
      { value: "G", label:  "G clef"},
      { value: "F", label: "F clef" },
      { value: "C", label: "C clef" },
    ];
}