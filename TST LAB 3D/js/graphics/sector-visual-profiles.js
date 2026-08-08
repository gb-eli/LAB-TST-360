export const SECTOR_VISUAL_PROFILES=Object.freeze({
  epi:{accent:0x58d68d,floor:0x202b34,floorKind:'epoxy',secondary:0x4a6574,layout:'studio'},
  construction:{accent:0xd9aa38,floor:0x665d4f,floorKind:'concrete',secondary:0x8b6a3f,layout:'outdoor'},
  industry:{accent:0xe08834,floor:0x39464e,floorKind:'epoxy',secondary:0x54717e,layout:'industrial'},
  confined:{accent:0xe0b537,floor:0x30373b,floorKind:'concrete',secondary:0x46616d,layout:'confined'},
  forensic:{accent:0x65b8de,floor:0x343d43,floorKind:'epoxy',secondary:0x7c5b42,layout:'industrial'},
  port:{accent:0xe0ae35,floor:0x485158,floorKind:'asphalt',secondary:0x3f6f83,layout:'port'},
  health:{accent:0x55b99a,floor:0x78878c,floorKind:'tile',secondary:0x5d7c86,layout:'corridor'},
  office:{accent:0x66a9ca,floor:0x4b555b,floorKind:'wood',secondary:0x7c6047,layout:'office'},
  warehouse:{accent:0xd49a45,floor:0x3f484e,floorKind:'concrete',secondary:0x6d7d85,layout:'warehouse'},
  workshop:{accent:0xd86f3c,floor:0x3d4448,floorKind:'concrete',secondary:0x5b6870,layout:'workshop'},
  electrical:{accent:0xe0bd3f,floor:0x364149,floorKind:'epoxy',secondary:0x4f6c7a,layout:'electrical'}
});

export function getSectorVisualProfile(id='industry'){
  return SECTOR_VISUAL_PROFILES[id]??SECTOR_VISUAL_PROFILES.industry;
}
