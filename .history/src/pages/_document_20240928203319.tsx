import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <DocumentHeadTags {...props} />
      <body className="antialiased bg-background text-text-black bg-landing-page-bg">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
