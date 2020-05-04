import { Dropdown, ClefLine } from "src/interface/dropdown";
export class ClefList {
    static readonly clefList: ClefList[] = [
      { value: "G", label: "G", line: [{value: "1", label: "1"}, {value: "2", label: "2"}] },
      { value: "F", label: "F", line: [{value: "3", label: "3"},{value: "4", label: "4"},{value: "5", label: "5"}]},
      { value: "C", label: "C", line: [{value: "1", label: "1"}, {value: "2", label: "2"}, {value: "3", label: "3"},{value: "4", label: "4"},{value: "5", label: "5"}]},
    ];
}

export interface ClefList extends Dropdown, ClefLine {}