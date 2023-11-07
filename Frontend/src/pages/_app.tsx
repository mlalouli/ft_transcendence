import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import NoSSRWrapper from '@/components/nossl/index';
import AppRoutes from '@/components/Routes';

import "../styles/style2.scss"
import "../styles/style3.scss"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
        <NoSSRWrapper>
            <AppRoutes />
        </NoSSRWrapper>
    </div>
  );
}
