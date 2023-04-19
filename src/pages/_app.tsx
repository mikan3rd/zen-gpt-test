import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import 'semantic-ui-css/semantic.min.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
