import {useEffect, useRef, VideoHTMLAttributes} from "react";
import crc32 from "crc-32";

type PropsType = VideoHTMLAttributes<HTMLVideoElement> & {
  srcObject: MediaStream;
  peerID: string;
};

export default function Video({srcObject, peerID, ...props}: PropsType) {
  const refVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!refVideo.current) return;
    refVideo.current.srcObject = srcObject;
  }, [srcObject]);

  const calculateColour = (userID: string) => {
    let colourNum = `${crc32.str(userID).toString(16)}`;
    colourNum = colourNum.padEnd(7, "0");
    colourNum = colourNum.slice(1, 7);
    return colourNum;
  };

  return (
    <div
      className="videoDiv"
      style={{position: "relative"}}
    >
      <video
        ref={refVideo}
        style={{
          borderStyle: "solid",
          borderColor: `#${calculateColour(peerID)}`
        }}
        {...props}
      />
      <p
        style={{
          position: "absolute",
          backgroundColor: `#${calculateColour(peerID)}`
        }}
        className="videoP"
      >
        {peerID}
      </p>
    </div>
  );
}
