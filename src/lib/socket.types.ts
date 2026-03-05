export interface JoinRoomPayload {
  roomId: string;
}

export interface AddPeerPayload {
  peerId: string;
  createOffer: boolean;
}

export interface RelaySDPPayload {
  peerId: string;
  sdp: any;
}

export interface RelayICEPayload {
  peerId: string;
  candidate: any;
}

export interface SpeakingPayload {
  peerId: string;
  speaking: boolean;
}

export interface RemovePeerPayload {
  peerId: string;
}
