// app/+html.tsx
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}