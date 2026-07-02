import { ImageResponse } from 'next/og';

export const alt = 'Q-LIT';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0d16',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* SVG original de iconoQLIT.svg */}
        <svg width="220" height="220" viewBox="0 0 414.28 414.28">
          <circle cx="207.14" cy="207.14" r="207.14" fill="#000" />
          <path fill="#6366f1" d="M357.78,206.98c1.16,22.81-17.58,41.54-40.39,40.39-19.53-.99-35.4-16.86-36.39-36.39-1.16-22.81,17.58-41.55,40.39-40.39,19.53.99,35.4,16.86,36.39,36.39Z"/>
          <path fill="#fff" d="M219.66,290.97l21.79,38.47h-44.6l-14.3-22.47c-49.2,10.74-100.74-3.64-123.76-60.54C23.32,161,109.46,82.55,194.92,113.09c70.02,25.03,97.25,122.39,24.74,177.88ZM183.23,227.65l17.36,24.17c47.84-56.75-23.49-130.55-76.26-89.7-58.04,44.94-5.45,118.29,39.15,107.74l-26.21-43.57,45.96,1.36Z"/>
        </svg>
        <span
          style={{
            fontSize: 70,
            fontWeight: 'bold',
            color: 'white',
            marginTop: 35,
            letterSpacing: '0.05em',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Q-LIT
        </span>
        <span
          style={{
            fontSize: 26,
            color: '#8b949e',
            marginTop: 10,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Plataforma de laboratorio interactivo de bases de datos
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
