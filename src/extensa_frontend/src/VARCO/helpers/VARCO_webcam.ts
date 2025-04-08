import { VARCO } from "./VARCO";

export class VARCOWebcam {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Inizializzazione delle proprietà WEBCAM
    if (!VARCO.p.DEVICES.WEBCAM) {
      VARCO.p.DEVICES.WEBCAM = {
        videoDeviceList: [],
        stream_height: undefined,
        stream_width: undefined
      };
    }

    // Inizializzazione dei metodi
    this.initMethods();
  }

  private initMethods(): void {
    // Metodo per fermare lo streaming della webcam
    VARCO.f.webcamStreamingStop = (): void => {
      const video = document.querySelector('video');
      if (video) {
        video.pause();
        video.src = "";
        const stream = video.srcObject as MediaStream;
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };

    // Metodo per inizializzare la webcam
    // cameraType = 'environment' o 'user'
    VARCO.f.initWebCamera = (cameraType: 'environment' | 'user', width: number, height: number): void => {
      if (!VARCO.p.DEVICES.WEBCAM) {
        VARCO.p.DEVICES.WEBCAM = {
          videoDeviceList: [],
          stream_height: undefined,
          stream_width: undefined
        };
      }
      
      if (VARCO.p.DEVICES.WEBCAM) {
        VARCO.p.DEVICES.WEBCAM.videoDeviceList = [];
      }

      // Funzione per gestire iOS e Safari
      const handleIOSSafari = (): void => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const constraints = { video: { width: 640, height: 480, facingMode: cameraType } };

          // actual width & height of the camera video
          if (VARCO.p.DEVICES.WEBCAM) {
            VARCO.p.DEVICES.WEBCAM.stream_width = 640;
            VARCO.p.DEVICES.WEBCAM.stream_height = 480;
          }

          navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            // apply the stream to the video element used in the texture
            const video = document.querySelector('video');
            if (video) {
              video.srcObject = stream;
              video.play();
            }
          }).catch((error) => {
            console.error('Unable to access the camera/webcam.', error);
          });

          navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((device) => {
              if (device.kind === "videoinput" && VARCO.p.DEVICES.WEBCAM) {
                VARCO.p.DEVICES.WEBCAM.videoDeviceList.push([
                  device.label || `Camera ${VARCO.p.DEVICES.WEBCAM.videoDeviceList.length + 1}`, 
                  device.deviceId
                ]);
              }
            });
          });
        } else {
          console.error('MediaDevices interface not available.');
        }
      };

      // Funzione per gestire altri browser
      const handleOtherBrowsers = (): void => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((device) => {
              if (device.kind === "videoinput" && VARCO.p.DEVICES.WEBCAM) {
                VARCO.p.DEVICES.WEBCAM.videoDeviceList.push([
                  device.label || `Camera ${VARCO.p.DEVICES.WEBCAM.videoDeviceList.length + 1}`, 
                  device.deviceId
                ]);
              }
            });

            const constraints = { video: { width: width, height: height, facingMode: cameraType } };

            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
              // apply the stream to the video element used in the texture
              const video = document.querySelector('video');
              if (video) {
                video.srcObject = stream;
                video.play();
              }

              const stream_settings = stream.getVideoTracks()[0].getSettings();

              // actual width & height of the camera video
              if (VARCO.p.DEVICES.WEBCAM) {
                VARCO.p.DEVICES.WEBCAM.stream_width = width;
                VARCO.p.DEVICES.WEBCAM.stream_height = height;
              }
            }).catch((error) => {
              console.error('Unable to access the camera/webcam.', error);
            });
          });
        } else {
          console.error('MediaDevices interface not available.');
        }
      };

      // Esegue il metodo appropriato in base al tipo di dispositivo/browser
      if (VARCO.p.DEVICES.isIOS && VARCO.p.DEVICES.isSafari) {
        handleIOSSafari();
      } else {
        handleOtherBrowsers();
      }
    };
  }
}

// Inizializza il modulo webcam
new VARCOWebcam(); 