
import { AppProps } from 'next/app'
import "../styles/chat.css"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}