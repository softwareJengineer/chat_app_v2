

export function getTimestamp(startTime=0.0) {
    const nowUnix = performance.now(); //Date.now();     // (in ms)
    const nowSec  = nowUnix / 1_000;
    return nowSec + startTime;
}


// Formatting helper
export function formatFloat(val) {return val.toFixed(3).padStart(10, ' ');}

export function logTimingASR(wallClockStart=0.0, start=true) {

    // Get the relative time and add it to the starting wall-clock time
    const nowMono = performance.now() / 1_000; // seconds
    const nowWall = wallClockStart + nowMono;

    // String for start or end
    const logStr = start ? "start:" : "end:  ";
    
    // Log both time values & return the mono time
    console.log(`%c[ASR] User speaking ${logStr} ${nowMono.toFixed(3).padStart(10)}  | ${nowWall}`, "color: #8FBC8F");
    return nowMono;
}