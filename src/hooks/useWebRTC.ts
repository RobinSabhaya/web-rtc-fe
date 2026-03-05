import { useEffect, useRef, useState } from "react";

export default function useWebRTC() {
  const [clients, setClients] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  const localMediaStream = useRef<MediaStream | null>(null);

  const audioElements = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    const startCapture = async () => {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    };

    startCapture().then(() => {
      const clientId = localStorage.getItem("userId");
      if (!clientId) return;

      const localAudioElement = audioElements.current[clientId];
      if (localAudioElement) {
        localAudioElement.volume = 0;
        if (localMediaStream.current) {
          localAudioElement.srcObject = localMediaStream.current;
        }
      }
    });

    return () => {};
  }, [clients]);

  function provideRef(clientId: string, instance: HTMLAudioElement | null) {
    if (!audioElements.current[clientId]) {
      audioElements.current[clientId] = instance;
    }
  }

  return {
    clients,
    provideRef,
    audioElements,
    localMediaStream,
    setClients,
  };
}
