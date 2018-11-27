import * as React from 'react';
import { remote } from 'electron';
import * as fs from 'fs';

const browserWindow = remote.getCurrentWindow();
const appPath = remote.app.getAppPath();
const videosPath = `${appPath}/videos`;

const fileNames = fs.readdirSync(videosPath)
  .filter(name => name.toUpperCase().endsWith('MP4'));

const loops = fileNames
  .filter(name => name.toUpperCase() === 'LOOP.MP4')
  .map(toUrl);

const overlays = fileNames
  .filter(name => name.toUpperCase() !== 'LOOP.MP4')
  .map(toUrl);

if (!loops.length) {
  alert('Missing loop.mp4 file!');
}

if (!overlays.length) {
  alert('Missing other mp4 files!');
}

export class App extends React.Component<undefined, undefined> {
  loopVideo: HTMLVideoElement;
  overlayVideo: HTMLVideoElement;

  componentDidMount() {
    const loop = document.querySelector('video#loop');
    this.loopVideo = loop as HTMLVideoElement;
    const overlay = document.querySelector('video#overlay');
    this.overlayVideo = overlay as HTMLVideoElement;
    this.overlayVideo.addEventListener('ended', () => this.switchToLoop());
  }

  start(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const button = document.querySelector('button');
    button!.parentNode!.removeChild(button!);
    browserWindow.setFullScreen(true);
    this.loopVideo.loop = true;
    this.loopVideo.src = loops[0];
    this.switchToLoop();
    this.loopVideo.play();
    window.addEventListener('click', () => this.switchToOverlay());
    window.addEventListener('keydown', event => this.onKeyDown(event));
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode == 27) {
      browserWindow.close();
    }
    this.switchToOverlay();
  }

  switchToOverlay() {
    this.overlayVideo.pause();
    this.overlayVideo.src = overlays[Math.floor(Math.random() * overlays.length)];
    this.loopVideo.style.position = 'absolute';
    this.loopVideo.style.left = '100%';
    this.overlayVideo.style.position = 'static';
    this.overlayVideo.play();
  }

  switchToLoop() {
    this.loopVideo.currentTime = 0;
    this.loopVideo.style.position = 'static';
    this.overlayVideo.style.position = 'absolute';
    this.overlayVideo.style.left = '100%';
  }

  render() {
    return (
      <div>
        <button onClick={event => this.start(event)}>
          Start
        </button>
        <video id='loop'></video>
        <video id='overlay'></video>
      </div>
    );
  }
}

function toUrl(name: string) {
  return `file://${videosPath}/${name}`;
}