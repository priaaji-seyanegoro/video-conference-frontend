import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface VideoPlayerProps {
  stream?: MediaStream;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  isScreenShare?: boolean;
  userName?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  isLocal = false,
  isMuted = false,
  isVideoEnabled = true,
  isScreenShare = false,
  userName = "Unknown",
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIntensity, setSpeakingIntensity] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedData = () => {
      console.log(`[VideoPlayer] Data loaded for stream: ${stream?.id}`);
    };
    const handlePlay = () => {
      console.log(`[VideoPlayer] Playback started for stream: ${stream?.id}`);
    };
    const handleError = (e: Event) => {
      console.error(
        `[VideoPlayer] Error on video element for stream ${stream?.id}:`,
        e
      );
      setVideoError(true);
    };

    if (stream) {
      // Paksa re-attach untuk menghindari video macet
      try {
        if (videoElement.srcObject) {
          videoElement.srcObject = null as any;
        }
        videoElement.load();
        videoElement.srcObject = stream;
      } catch (e) {
        console.warn("[VideoPlayer] Failed to (re)attach srcObject:", e);
      }

      videoElement.addEventListener("loadeddata", handleLoadedData);
      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("error", handleError);

      const playNow = () => {
        const p = videoElement.play();
        if (p && typeof (p as any).catch === "function") {
          (p as any).catch((err: any) => {
            console.warn("[VideoPlayer] video.play() was prevented:", err);
          });
        }
      };
      playNow();

      // Retry singkat jika dimensi masih 0 (tanda belum rendering frame)
      const retry = setTimeout(() => {
        if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
          try {
            videoElement.srcObject = null as any;
            videoElement.load();
            videoElement.srcObject = stream;
            playNow();
          } catch {}
        }
      }, 600);

      return () => {
        clearTimeout(retry);
        videoElement.removeEventListener("loadeddata", handleLoadedData);
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("error", handleError);
      };
    } else {
      videoElement.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    const stopAudioAnalysis = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      setIsSpeaking(false);
      setSpeakingIntensity(0);
    };

    // Jangan hentikan analisis audio jika hanya kamera yang dimatikan
    // Cek apakah ada audio track dan tidak di-mute
    if (stream && stream.getAudioTracks().length > 0 && !isMuted) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.1;
      }

      const analyser = analyserRef.current;
      if (!analyser) return;

      // Buat source baru hanya jika belum ada atau stream berubah
      if (!sourceRef.current) {
        sourceRef.current =
          audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyser);
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkSpeaking = () => {
        if (!analyser) return;

        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

        // Hitung intensitas berbicara (0-100)
        const intensity = Math.min(100, Math.floor(average * 5));
        setSpeakingIntensity(intensity);

        if (average > 5) {
          setIsSpeaking(true);
        } else {
          setIsSpeaking(false);
        }

        animationFrameIdRef.current = requestAnimationFrame(checkSpeaking);
      };

      // Mulai analisis audio jika belum berjalan
      if (!animationFrameIdRef.current) {
        checkSpeaking();
      }
    } else {
      stopAudioAnalysis();
    }

    return () => {
      // Hanya hentikan analisis audio jika komponen unmount atau audio dimatikan
      // bukan saat kamera dimatikan
      if (isMuted || !stream || stream.getAudioTracks().length === 0) {
        stopAudioAnalysis();
      }
    };
  }, [stream, isMuted, isLocal]);

  // Paksa play saat user mengaktifkan kamera lagi
  useEffect(() => {
    if (!isVideoEnabled) return;
    const videoElement = videoRef.current;
    const vt = stream?.getVideoTracks?.()[0];
    if (videoElement && stream && vt && vt.readyState === "live") {
      const p = videoElement.play();
      if (p && typeof (p as any).catch === "function") {
        (p as any).catch(() => {});
      }
    }
  }, [isVideoEnabled, stream]);

  // Debug: Log stream info
  useEffect(() => {
    if (stream) {
      console.log("Stream received:", {
        id: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoTrackEnabled: stream.getVideoTracks()[0]?.enabled,
        videoTrackState: stream.getVideoTracks()[0]?.readyState,
      });

      // Log jika track video berakhir
      const vt = stream.getVideoTracks()[0];
      if (vt) {
        const onended = () => {
          console.warn('[VideoPlayer] video track ended for stream:', stream.id);
        };
        vt.addEventListener('ended', onended);
        return () => vt.removeEventListener('ended', onended);
      }
    }
  }, [stream]);

  // Hitung apakah track video benar-benar live
  const isVideoTrackLive = (() => {
    const vt = stream?.getVideoTracks?.()[0];
    return !!vt && vt.readyState === 'live' && vt.enabled !== false;
  })();

  // Hitung warna border berdasarkan intensitas berbicara
  const getBorderColor = () => {
    if (!isSpeaking || isMuted) return "";
    
    // Warna dari hijau ke kuning ke merah berdasarkan intensitas
    if (speakingIntensity < 30) return "border-green-500";
    if (speakingIntensity < 60) return "border-yellow-500";
    return "border-red-500";
  };

  // Hitung ukuran border berdasarkan intensitas berbicara
  const getBorderWidth = () => {
    if (!isSpeaking || isMuted) return "";
    
    // Ukuran border dari 2px hingga 6px berdasarkan intensitas
    if (speakingIntensity < 30) return "border-2";
    if (speakingIntensity < 60) return "border-4";
    return "border-6";
  };

  // Hitung animasi pulse berdasarkan intensitas berbicara
  const getPulseAnimation = () => {
    if (!isSpeaking || isMuted) return "";
    
    // Kecepatan animasi pulse berdasarkan intensitas
    if (speakingIntensity < 30) return "animate-pulse-slow";
    if (speakingIntensity < 60) return "animate-pulse";
    return "animate-pulse-fast";
  };

  const shouldRenderVideo = isVideoEnabled && isVideoTrackLive && !!stream && !videoError;

  return (
    <div
      className={cn(
        "relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300",
        className
      )}
    >
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "w-full h-full",
            isScreenShare ? "object-contain" : "object-cover",
            isLocal && !isScreenShare && "transform -scale-x-100"
          )}
          style={{ backgroundColor: "#1f2937" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl md:text-4xl font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white text-base md:text-lg font-medium">{userName}</p>
            {videoError && (
              <p className="text-red-400 text-xs mt-1">Video error</p>
            )}
            {!isVideoEnabled && (
              <p className="text-gray-400 text-sm md:text-base mt-2">Kamera mati</p>
            )}
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex space-x-1">
        {!isMuted ? (
          <div 
            className={cn(
              "p-1 rounded-full transition-colors duration-150",
              isSpeaking 
                ? speakingIntensity < 30 
                  ? "bg-green-600" 
                  : speakingIntensity < 60 
                    ? "bg-green-500" 
                    : "bg-green-400"
                : "bg-green-800"
            )}
          >
            <Mic className={cn(
              "w-3 h-3 text-white",
              isSpeaking && "animate-pulse-slow"
            )} />
          </div>
        ) : (
          <div className="bg-red-500 p-1 rounded-full">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}

        {!isVideoEnabled && (
          <div className="bg-red-500 p-1 rounded-full">
            <VideoOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* User name */}
      <div className="absolute bottom-2 right-2">
        <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {userName} {isLocal && "(You)"}
        </span>
      </div>
    </div>
  );
};
