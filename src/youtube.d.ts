export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
  getPlayerState(): number;
}

interface YT {
  Player: {
    new (
      elementId: string,
      config: {
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { target: YTPlayer; data: number }) => void;
        };
        playerVars?: {
          autoplay?: 0 | 1;
          controls?: 0 | 1;
          rel?: 0 | 1;
          playsinline?: 0 | 1;
          mute?: 0 | 1;
          loop?: 0 | 1;
          playlist?: string;
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
