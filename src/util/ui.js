import { main as io } from './io';

const UI_EVENT = 'util::button-click';

async function show (body) {
  figma.showUI(createHTML(body.trim()), {
    width: 280,
    height: 100
  });
  return io.async(UI_EVENT);
}

export async function showMessage (message) {
  return show(`
<main><p class='info'>${message}</p></main>
<div class='buttons'><button class='button-close'>OK</button></div>
  `);
}

function createHTML (body) {
  return /* html */ `<html>
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
      <link rel="stylesheet" href="https://static.figma.com/api/figma-extension-api-0.0.1.css">
      <style>
      @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: 400;
        src: url("https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.7") format("woff2"),
             url("https://rsms.me/inter/font-files/Inter-Regular.woff?v=3.7") format("woff");
      }

      @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: 500;
        src: url("https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7") format("woff2"),
             url("https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7") format("woff");
      }

      @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: 600;
        src: url("https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7") format("woff2"),
             url("https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7") format("woff");
      }
      body {
        font: normal 400 14px "Inter", "Roboto", sans-serif;
      }
      input[type='text'], input, textarea, select {
        font-family:inherit;
      }
      body, html {
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }
      main {
        padding: 0;
      }
      p {
        padding: 0;
        font-size: 14px;
        line-height: 21px;
        margin: 0;
      }
      .buttons {
        display: flex;
        flex-direction: row;
        padding: 20px;
        box-sizing: border-box;
        width: 100%;
        justify-content: center;
      }
      </style>
    </head>
    <body>
      ${body}
      <script>
      const button = document.querySelector('.button-close');
      if (button) {
        button.addEventListener('click', () => {
          console.log("EVENT")
          window.parent.postMessage({ pluginMessage: { event: ${JSON.stringify(UI_EVENT)}, data: 'close' } }, '*');
        });
      }
      </script>
    </body>
  </html>`;
}
