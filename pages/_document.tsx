import { Html, Head, Main, NextScript } from 'next/document'

// insert global styles
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* FONTS & ICONS */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Merryweather&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Righteous&display=swap" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />


        <link rel="shortcut icon" href="/images/logo.png" />
        
      </Head>

      {/* Overflow is now made to default hidden in order to track child component's scroll */}
      {/* Make sure to enable overflow on child component */}
      <body className='bg-doc-bg text-gray-800 overflow-hidden'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
