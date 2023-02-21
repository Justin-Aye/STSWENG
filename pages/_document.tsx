import { Html, Head, Main, NextScript } from 'next/document'

// insert global styles
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className='bg-doc_bg'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
