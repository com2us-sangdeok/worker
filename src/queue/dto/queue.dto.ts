import {TxType} from "../../enum";


export class TxResultDto {
    appId: string;
    server: string;
    playerId: number;
    result: string;
    requestId: string;
    txHash: string;
    eventType: TxType;
    characterId?: string;
    data?: any;
}