export const ENVIRONMENT_ATMOSPHERE_PROFILES=Object.freeze({
  epi:{
    top:0x07131d,horizon:0x28485a,ground:0x0b151d,fog:0x132631,
    key:0xd8f3ff,fill:0x76bddd,accent:0x58d68d,secondary:0x7cc7ef
  },
  construction:{
    top:0x5f9fc4,horizon:0xc1d1c3,ground:0x735f49,fog:0x9bb4b5,
    key:0xffe7b4,fill:0xaed9f2,accent:0xd9aa38,secondary:0x72b5d8
  },
  industry:{
    top:0x09141e,horizon:0x324653,ground:0x201a16,fog:0x172934,
    key:0xe9f6ff,fill:0x6eb6d8,accent:0xe08834,secondary:0x6ab0cf
  },
  confined:{
    top:0x03090d,horizon:0x102029,ground:0x080a0b,fog:0x0b171d,
    key:0xa9d1df,fill:0x3e829b,accent:0xe0b537,secondary:0x4b91a9
  },
  forensic:{
    top:0x07111a,horizon:0x263844,ground:0x181817,fog:0x15242d,
    key:0xe7f5fb,fill:0x72b8d9,accent:0x65b8de,secondary:0xd9ad72
  },
  port:{
    top:0x3e7fa5,horizon:0x9fc2cc,ground:0x3a4b52,fog:0x7f9fab,
    key:0xffe4b8,fill:0x8dcbe6,accent:0xe0ae35,secondary:0x4d9ab9
  },
  health:{
    top:0x173642,horizon:0x6d9fa2,ground:0x40575a,fog:0x587a7d,
    key:0xf3ffff,fill:0x9fdce1,accent:0x55b99a,secondary:0x73c5d3
  },
  office:{
    top:0x142b3b,horizon:0x5c8293,ground:0x3f3c39,fog:0x486573,
    key:0xf3f8ff,fill:0x9ccfee,accent:0x66a9ca,secondary:0xd0a879
  },
  warehouse:{
    top:0x0d1a23,horizon:0x41535e,ground:0x2d3133,fog:0x35454e,
    key:0xdbeef7,fill:0x75abc2,accent:0xd49a45,secondary:0x7896a4
  },
  workshop:{
    top:0x11191f,horizon:0x4b4d4c,ground:0x2f2925,fog:0x3b3c3a,
    key:0xf1e7dc,fill:0x78a5b5,accent:0xd86f3c,secondary:0xb9865e
  },
  electrical:{
    top:0x0c1a24,horizon:0x405c6b,ground:0x292d2e,fog:0x30444f,
    key:0xe7f8ff,fill:0x79c3e7,accent:0xe0bd3f,secondary:0x62a9c9
  },
  emergency:{
    top:0x080d11,horizon:0x34252a,ground:0x160f10,fog:0x261d20,
    key:0xd9e7e8,fill:0x609b8c,accent:0xe55d52,secondary:0xf0a34d
  }
});

export function getEnvironmentAtmosphereProfile(id='industry'){
  return ENVIRONMENT_ATMOSPHERE_PROFILES[id]??ENVIRONMENT_ATMOSPHERE_PROFILES.industry;
}

export function listEnvironmentAtmosphereProfiles(){
  return Object.keys(ENVIRONMENT_ATMOSPHERE_PROFILES);
}
