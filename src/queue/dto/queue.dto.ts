import {TxType} from "../../enum";


export class TxResultDto {
    result: string;
    requestId: string;
    playerId: number;
    server: string[];
    selectedCid?: string;
    eventType: TxType;
    items?: any;
}