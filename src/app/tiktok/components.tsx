import { Input, Slider } from "@mui/material";
import TimeFormat from "hh-mm-ss";
import { useEffect, useState } from "react";

export function CutTime({ disabled, max, value, onChange }: any) {
  const [timesString, setTimesString] = useState([
    getTime(value[0]),
    getTime(value[1]),
  ]);
  useEffect(() => {
    let from: number, to: number;
    try {
      from = TimeFormat.toS(timesString[0]);
    } catch (e) {
      return;
    }
    try {
      to = TimeFormat.toS(timesString[1]);
    } catch (e) {
      return;
    }

    if (from >= to) return;

    onChange([from, to]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timesString]);
  function handleSliderChange(newVal: number[]) {
    onChange(newVal)
    setTimesString([getTime(newVal[0]), getTime(newVal[1])])
  }

  function getTime(second: number) {
    const fixedSecond = Number(second.toFixed());
    return TimeFormat.fromS(fixedSecond, "hh:mm:ss");
  }

  return (
    <div>
      <Slider
        disabled={disabled}
        max={max}
        value={value}
        onChange={(_, newVal: any) => handleSliderChange(newVal)}
      />
      <div className="flex justify-between">
        <Input
          disabled={disabled}
          size="small"
          className="w-20 [&_.MuiInput-input]:text-center"
          value={timesString[0]}
          onChange={(e) => setTimesString([e.target.value, timesString[1]])}
        />
        <Input
          disabled={disabled}
          size="small"
          className="w-20 [&_.MuiInput-input]:text-center"
          value={timesString[1]}
          onChange={(e) => {
            setTimesString([timesString[0], e.target.value]);
          }}
        />
      </div>
    </div>
  );
}
