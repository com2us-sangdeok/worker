import { Key } from '@terra-money/terra.js';

export const betagameInfoApi = (appId: string) => {
  return {
    code: 200,
    message: 'success',
    data: {
      gameId: appId,
      constraintUrlForMint: 'https://game.com2us.com/constraint-url/' + appId,
      updateItemUrlForMint: 'https://game.com2us.com/update-item-url/' + appId,
      itemsForMint: 'https://game.com2us.com/items-url/' + appId,
      mintType: 'item', // {item, items, character}
      singleMintFee: {
        ctx: 20,
        gameToken: 10,
      },
      characterMintFee: {
        ctx: 20,
        gameToken: 10,
      },
      lockCa: 'terra1wgh6adn8geywx0v78zs9azrqtqdegufuegnwep',
      c2xCa: '',
      gameProviderAddress: '',
      treasuryAddress: '',
      serverAddress: '',
      c2xHolderAddress: '',
      gameTokenCa: '',
      fanHolderAddress: '',
      nftCa: 'terra1sshdl5qajv0q0k6shlk8m9sd4lplpn6gggfr86',
    },
  };
};

export const betagameFeeApi = (appId: string) => {
  return {
    code: 200,
    message: 'success',
    data: {
      gameTokenFee: 10,
      ctxTokenFee: 20,
    },
  };
};

export const getMinterKey = async (): Promise<Key> => {
  let hsmMinterKey: Key = undefined;
  return hsmMinterKey;
};

export const updateGameServerForMintingApi = (data: any) => {
  return {
    code: 200,
    message: 'success',
    data: {
      imageUrl: 'https://image01.c2x.world/equip_92053030.gif',
    },
  };
};

export const validateItemFromGameServer = (data: any) => {
  return {
    code: 200,
    message: 'success',
    data: {
      itemId: 'test01',
      metadata: {
        name: "Arbiter's Robe",
        description: 'desc',
        image: 'https://image01.c2x.world/equip_92053030.gif',
        animation_url: 'https://image01.c2x.world/equip_92053030.gif',
        youtube_url: '',
        image_data: '',
        external_url: 'https://dex.c2xnft.com/market?key=4423',
        background_color: '',
        attributes: [
          {
            trait_type: 'Category',
            max_value: '',
            value: 'Game',
            display_type: '',
          },
        ],
      },
    },
  };
};

export const gameItemsForMint = (data: any) => {
  return {
    name: "Arbiter's Robe",
    description: 'desc',
    image: 'https://image01.c2x.world/equip_92053030.gif',
    attributes: [
      {
        trait_type: 'Category',
        value: 'Game',
      },
    ],
    feeCount: 4,
  };
};