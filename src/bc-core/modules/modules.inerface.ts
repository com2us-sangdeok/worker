//common
export interface Coinbalance {
  denom: string;
  amount: string;
}

//grant

//cw20
export interface ContractInfo {
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  total_supply?: string;
}

export interface TokenBalance extends ContractInfo {
  balance: string;
}

//cw721
export interface Attributes {
  trait_type?: string;
  //max_value 필수값은 아니지만 opensea에서 사용중
  max_value?: string | number;
  value: string | number;
  display_type?: any;
}

export interface Extension {
  image: string;
  image_data: string;
  external_url: string;
  description: string;
  name: string;
  attributes: Attributes[];
  background_color: string;
  animation_url: string;
  youtube_url: string;
}

export interface NftDetail {
  token_uri: string;
  extension: Extension;
}
