import '@/styles.css';

export default function MyApp({
  Component,
  pageProps,
}: {
  Component: React.FC;
  pageProps: any;
}) {
  return <Component {...pageProps} />;
}
