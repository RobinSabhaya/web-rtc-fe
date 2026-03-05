import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocketContext } from "../../contexts/socket.context";
import { SOCKET_EVENT } from "../../constants/socket";
import type {
  AddPeerPayload,
  RelayICEPayload,
  RelaySDPPayload,
  RemovePeerPayload,
  SpeakingPayload,
} from "../../lib/socket.types";
import type { AudioMap, PeerMap, SpeakingMap } from "./Room.type";

export default function AudioRoom() {
  const { roomId } = useParams();
  const { current: socket } = useSocketContext();

  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<PeerMap>({});
  const audioElements = useRef<AudioMap>({});
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number>(0);

  const [participants, setParticipants] = useState<string[]>([]);
  const [speakingUsers, setSpeakingUsers] = useState<SpeakingMap>({});
  const [micOn, setMicOn] = useState(true);

  const freeIceServerUrls = [
    "stun.l.google.com:19302",
    "stun1.l.google.com:19302",
    "stun2.l.google.com:19302",
    "stun3.l.google.com:19302",
    "stun4.l.google.com:19302",
    "stun.ekiga.net",
    "stun.ideasip.com",
    "stun.schlund.de",
    "stun.stunprotocol.org:3478",
    "stun.voiparound.com",
    "stun.voipbuster.com",
    "stun.voipstunt.com",
    "stun.voxgratia.org",
  ];

  // 🎙 VOICE DETECTION
  const setupVoiceDetection = useCallback(
    (stream: MediaStream) => {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      microphone.connect(analyser);

      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const detect = () => {
        analyser.getByteFrequencyData(dataArray);

        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        const isSpeaking = volume > 20;

        socket?.emit(SOCKET_EVENT.USER_SPEAKING, {
          roomId,
          speaking: isSpeaking,
        });

        animationFrame.current = requestAnimationFrame(detect);
      };

      detect();
    },
    [roomId, socket],
  );

  // 🎤 INIT MIC
  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      localStream.current = stream;

      setupVoiceDetection(stream);

      socket?.emit(SOCKET_EVENT.JOIN_ROOM, { roomId });
    };

    init();

    return () => {};
  }, [socket, roomId, setupVoiceDetection]);

  // MIC TOGGLE
  const toggleMic = () => {
    if (!localStream.current) return;

    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setMicOn((prev) => !prev);
  };

  // ADD PEER
  useEffect(() => {
    socket?.on(
      SOCKET_EVENT.ADD_PEER,
      async ({ peerId, createOffer }: AddPeerPayload) => {
        if (peerConnections.current[peerId]) return;

        const pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: freeIceServerUrls,
            },
          ],
        });

        peerConnections.current[peerId] = pc;

        localStream.current?.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current!);
        });

        pc.ontrack = ({ streams: [stream] }) => {
          if (audioElements.current[peerId]) return;

          const audio = new Audio();
          audio.srcObject = stream;
          audio.autoplay = true;

          audioElements.current[peerId] = audio;

          setParticipants((prev) => [...prev, peerId]);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket?.emit(SOCKET_EVENT.RELAY_ICE, {
              peerId,
              candidate: event.candidate,
            });
          }
        };

        if (createOffer) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket?.emit(SOCKET_EVENT.RELAY_SDP, {
            peerId,
            sdp: offer,
          });
        }
      },
    );

    return () => {
      socket?.off(SOCKET_EVENT.ADD_PEER);
    };
  }, [socket]);

  // SDP
  useEffect(() => {
    socket?.on(
      SOCKET_EVENT.RELAY_SDP,
      async ({ peerId, sdp }: RelaySDPPayload) => {
        const pc = peerConnections.current[peerId];
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        if (sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket?.emit(SOCKET_EVENT.RELAY_SDP, {
            peerId,
            sdp: answer,
          });
        }
      },
    );

    return () => {
      socket?.off(SOCKET_EVENT.RELAY_SDP);
    };
  }, [socket]);

  // ICE
  useEffect(() => {
    socket?.on(
      SOCKET_EVENT.RELAY_ICE,
      async ({ peerId, candidate }: RelayICEPayload) => {
        const pc = peerConnections.current[peerId];
        if (!pc) return;

        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      },
    );

    return () => {
      socket?.off(SOCKET_EVENT.RELAY_ICE);
    };
  }, [socket]);

  // SPEAKING EVENT
  useEffect(() => {
    socket?.on(
      SOCKET_EVENT.USER_SPEAKING,
      ({ peerId, speaking }: SpeakingPayload) => {
        setSpeakingUsers((prev) => ({
          ...prev,
          [peerId]: speaking,
        }));
      },
    );

    return () => {
      socket?.off(SOCKET_EVENT.USER_SPEAKING);
    };
  }, [socket]);

  // REMOVE PEER
  useEffect(() => {
    socket?.on(SOCKET_EVENT.REMOVE_PEER, ({ peerId }: RemovePeerPayload) => {
      peerConnections.current[peerId]?.close();
      delete peerConnections.current[peerId];
      delete audioElements.current[peerId];

      setParticipants((prev) => prev.filter((id) => id !== peerId));
    });

    return () => {
      socket?.off(SOCKET_EVENT.REMOVE_PEER);
    };
  }, [socket]);

  return (
    <div style={{ padding: 30 }}>
      <h2>🎙 Audio Room: {roomId}</h2>

      <button onClick={toggleMic}>{micOn ? "🎙️" : "🔇"}</button>

      <div style={{ marginTop: 30, display: "flex", gap: 20 }}>
        {participants.map((id) => (
          <div
            key={id}
            style={{
              padding: 20,
              borderRadius: "50%",
              border: speakingUsers[id] ? "4px solid lime" : "4px solid gray",
              width: 100,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            👤
          </div>
        ))}
      </div>
    </div>
  );
}
