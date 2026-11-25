"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { useIntro } from "@/components/providers/IntroProvider";
import { markSceneReady } from "@/lib/drive";

const DriveScene = dynamic(() => import("./DriveScene"), { ssr: false, loading: () => null });

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/** If the 3D world fails, the page carries on over the gradient backdrop. */
class Guard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Drive scene failed", error);
    delete document.documentElement.dataset.drive;
    markSceneReady();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Fixed, full-viewport 3D world that sits behind the whole page. */
export function DriveStage() {
  const { ready } = useIntro();
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (hasWebGL()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- WebGL support is only known in the browser
      setMounted(true);
    } else markSceneReady();
    return () => {
      delete document.documentElement.dataset.drive;
    };
  }, []);

  const onLive = () => {
    setLive(true);
    // Reduced motion keeps the world still, so project cards show their own previews instead
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.dataset.drive = "on";
  };

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(120%_80%_at_70%_60%,#1b1650_0%,#070716_55%,#050507_100%)]">
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: live ? 1 : 0 }}>
        {mounted && (
          <Guard>
            <DriveScene started={ready} onLive={onLive} />
          </Guard>
        )}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgb(2_2_10/0.6)_100%)]" />
    </div>
  );
}
