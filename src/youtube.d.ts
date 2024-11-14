export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  getPlayerState(): number;
  destroy(): void;
}

interface YT {
  Player: {
    new (
      elementId: string | HTMLIFrameElement,
      config: {
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { data: number }) => void;
        };
        playerVars?: {
          autoplay?: 0 | 1;
          controls?: 0 | 1;
          mute?: 0 | 1;
          rel?: 0 | 1;
          playsinline?: 0 | 1;
        };
      }
    ): YTPlayer;
  };
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export {};
