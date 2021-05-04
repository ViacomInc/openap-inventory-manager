import React from "react";

export interface HeadProps {
  title?: string;
  appTitle?: string;
}

export default function Head({ title, appTitle }: HeadProps): JSX.Element {
  return (
    <>
      <title>{title || "OpenAP Marketplace Inventory"}</title>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#003366" />
      <meta
        name="apple-mobile-web-app-title"
        content={appTitle || "OpenAP Marketplace"}
      />
      <meta
        name="application-name"
        content={appTitle || "OpenAP Marketplace"}
      />
      <meta name="msapplication-TileColor" content="#003366" />
      <meta name="theme-color" content="#ffffff" />
    </>
  );
}
