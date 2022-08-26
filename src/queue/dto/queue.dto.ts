import {TxType} from "../../enum";


export class TxResult {
    result: string;
    playerId: number;
    server: string[];
    selectedCid?: string;
    eventType: TxType;
    items?: any;
}