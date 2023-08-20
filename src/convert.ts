

export async function convert(data: ArrayBuffer, index: number, duration: number) {
    const transmuxer = new muxjs.Transmuxer({
        keepOriginalTimestamps: true,
        duration: parseInt(duration),
    });
    transmuxer.on('data', segment => {
        if (index === this.rangeDownload.startSegment - 1) {
          let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
          data.set(segment.initSegment, 0);
          data.set(segment.data, segment.initSegment.byteLength);
          callback(data.buffer)
        } else {
          callback(segment.data)
        }
    });
    transmuxer.push(new Uint8Array(data));
    transmuxer.flush();
}