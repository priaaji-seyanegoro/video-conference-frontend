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
    };

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

      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkSpeaking = () => {
        if (!analyser) return;

        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

        if (isLocal) {
          //   console.log(`Local audio level: ${average.toFixed(2)}`);
        }

        if (average > 5) {
          setIsSpeaking(true);
        } else {
          setIsSpeaking(false);
        }

        animationFrameIdRef.current = requestAnimationFrame(checkSpeaking);
      };

      checkSpeaking();
    } else {
      stopAudioAnalysis();
    }

    return () => {
      stopAudioAnalysis();
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

  const shouldRenderVideo = isVideoEnabled && isVideoTrackLive && !!stream && !videoError;

  return (
    <div
      className={cn(
        "relative bg-gray-900 rounded-lg overflow-hidden transition-all duration-300",
        isSpeaking && !isMuted && "border-4 border-green-500",
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
            <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl md:text-3xl font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white text-sm md:text-base">{userName}</p>
            {videoError && (
              <p className="text-red-400 text-xs mt-1">Video error</p>
            )}
            {!isVideoEnabled && (
              <p className="text-gray-400 text-xs md:text-sm mt-1">Kamera mati</p>
            )}
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex space-x-1">
        {!isMuted ? (
          <div className="bg-green-500 p-1 rounded-full">
            <Mic className="w-3 h-3 text-white" />
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
