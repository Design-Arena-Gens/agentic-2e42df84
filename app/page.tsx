"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useImages } from "@/lib/imagesStore";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Page() {
  const { exteriorDataUrl, interiorDataUrl, setExterior, setInterior } = useImages();
  const [duration, setDuration] = useState(16);
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const canStart = useMemo(() => !!exteriorDataUrl && !!interiorDataUrl, [exteriorDataUrl, interiorDataUrl]);

  async function handleSelectExterior(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    setExterior(url);
  }

  async function handleSelectInterior(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    setInterior(url);
  }

  function startRecording() {
    const canvas = document.querySelector("#hero-canvas canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const stream = canvas.captureStream(60);
    const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
    chunksRef.current = [];
    mr.ondataavailable = (evt) => {
      if (evt.data.size > 0) chunksRef.current.push(evt.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setBlobUrl(URL.createObjectURL(blob));
      setRecording(false);
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function reset() {
    setBlobUrl(undefined);
  }

  return (
    <div className="container">
      <div className="header">
        <div className="badge">Vercel-ready</div>
        <div className="title">Cinematic Gadget Store Hero-Motion</div>
      </div>
      <div className="grid">
        <div className="panel controls">
          <div>
            <div className="label">Exterior image (store facade / street view)</div>
            <input className="input" type="file" accept="image/*" onChange={handleSelectExterior} />
          </div>
          <div>
            <div className="label">Interior image (inside the store)</div>
            <input className="input" type="file" accept="image/*" onChange={handleSelectInterior} />
          </div>
          <div>
            <div className="label">Duration (seconds)</div>
            <input
              className="input"
              type="number"
              min={8}
              max={40}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value || "16", 10))}
            />
          </div>
          <div className="row">
            <button className="button" onClick={startRecording} disabled={!canStart || recording}>
              {recording ? "Recording..." : "Record Animation"}
            </button>
            <button className="button secondary" onClick={stopRecording} disabled={!recording}>
              Stop
            </button>
            <button className="button secondary" onClick={reset} disabled={!blobUrl}>
              Reset Video
            </button>
          </div>
          {blobUrl && (
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="badge">Recorded WebM</span>
              <a className="button" href={blobUrl} download="hero-motion.webm">
                Download
              </a>
            </div>
          )}
          <div className="row">
            <span className="badge">Tip</span>
            <span style={{ color: "var(--muted)" }}>Upload high-res images for best results.</span>
          </div>
        </div>
        <div className="panel" style={{ position: "relative" }}>
          <HeroScene durationSec={duration} />
        </div>
      </div>
    </div>
  );
}

