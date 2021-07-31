import React, {useEffect, useRef, useState} from "react";
import {Button, Form} from "react-bootstrap";

const MediaDeviceSelector = () => {
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);
  const videoSelectRef = useRef<HTMLSelectElement>(null);
  const audioSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      window.alert("Failed to access media devices");
    } else {
      const populateOptions = async () => {
        await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        setMediaDevices(await navigator.mediaDevices.enumerateDevices());
      };
      populateOptions();
    }
  }, []);

  const createSelectElement = (kind: string) => {
    const getFirstMatchingId = () => {
      for (let device of mediaDevices) {
        if (device.kind === kind) {
          return device.deviceId;
        }
      }
    }

    return (
      <select className="form-select-sm" ref={kind === "videoinput" ? videoSelectRef : audioSelectRef} defaultValue={getFirstMatchingId()}>
        {mediaDevices.map((device: MediaDeviceInfo) => {
          if (device.kind === kind) {
            return (
              <option value={device.deviceId} key={device.deviceId}>
                {device.label}
              </option>
            )
          } else {
            return null;
          }
        })}
      </select>
    )
  }

  const handleSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoSelectRef && videoSelectRef.current) {
      console.log(videoSelectRef.current.value);
    }
    if (audioSelectRef && audioSelectRef.current) {
      console.log(audioSelectRef.current.value);
    }
    // TODO: pass selected ids to the parent element here
  }

  return (
    <Form style={{maxWidth: "35%"}}>
      {createSelectElement("videoinput")}
      {createSelectElement("audioinput")}
      <Button onClick={handleSelection}>Accept</Button>
    </Form>
  );
};

export default MediaDeviceSelector;
