declare module 'qrcode' {
  interface QRCodeOptions {
    type?: 'svg' | 'image' | 'terminal';
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }

  function toString(data: string, options?: QRCodeOptions): Promise<string>;
  function toDataURL(data: string, options?: QRCodeOptions): Promise<string>;
  function toCanvas(canvas: HTMLCanvasElement, data: string, options?: QRCodeOptions): Promise<void>;
  
  export = {
    toString,
    toDataURL,
    toCanvas
  };
} 