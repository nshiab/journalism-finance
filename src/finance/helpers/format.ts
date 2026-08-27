export function round(
  number: number,
  options: { decimals?: number } = {},
): number {
  return typeof options.decimals === "number"
    ? parseFloat(number.toFixed(options.decimals))
    : Math.round(number);
}

export function arraysToData<T extends Record<string, unknown[]>>(
  data: T,
): Array<{ [K in keyof T]: T[K][number] }> {
  const keys = Object.keys(data) as Array<keyof T>;
  const nbItems = data[keys[0]].length;

  const newData: Array<{ [K in keyof T]: T[K][number] }> = [];
  for (let i = 0; i < nbItems; i++) {
    const newItem = {} as { [K in keyof T]: T[K][number] };
    for (const key of keys) {
      newItem[key] = data[key][i] as T[typeof key][number];
    }
    newData.push(newItem);
  }

  return newData;
}

export function prettyDuration(
  start: Date | number,
  options: {
    log?: boolean;
    end?: Date | number;
    prefix?: string;
    suffix?: string;
  } = {},
): string {
  const startMs = start instanceof Date ? start.getTime() : start;
  const endMs = options.end instanceof Date
    ? options.end.getTime()
    : typeof options.end === "number"
    ? options.end
    : Date.now();
  const differenceInMs = endMs - startMs;

  let duration: string;
  if (differenceInMs < 1_000) {
    duration = `${differenceInMs} ms`;
  } else if (differenceInMs < 60_000) {
    const seconds = Math.floor(differenceInMs / 1_000);
    duration = `${seconds} sec, ${differenceInMs % 1_000} ms`;
  } else if (differenceInMs < 3_600_000) {
    const minutes = Math.floor(differenceInMs / 60_000);
    const remainingMs = differenceInMs % 60_000;
    const seconds = Math.floor(remainingMs / 1_000);
    duration = `${minutes} min, ${seconds} sec, ${remainingMs % 1_000} ms`;
  } else if (differenceInMs < 86_400_000) {
    const hours = Math.floor(differenceInMs / 3_600_000);
    const remainingMsAfterHours = differenceInMs % 3_600_000;
    const minutes = Math.floor(remainingMsAfterHours / 60_000);
    const remainingMsAfterMinutes = remainingMsAfterHours % 60_000;
    const seconds = Math.floor(remainingMsAfterMinutes / 1_000);
    duration = `${hours} h, ${minutes} min, ${seconds} sec, ${
      remainingMsAfterMinutes % 1_000
    } ms`;
  } else if (differenceInMs < 2_592_000_000) {
    const days = Math.floor(differenceInMs / 86_400_000);
    const remainingMsAfterDays = differenceInMs % 86_400_000;
    const hours = Math.floor(remainingMsAfterDays / 3_600_000);
    const remainingMsAfterHours = remainingMsAfterDays % 3_600_000;
    const minutes = Math.floor(remainingMsAfterHours / 60_000);
    const remainingMsAfterMinutes = remainingMsAfterHours % 60_000;
    const seconds = Math.floor(remainingMsAfterMinutes / 1_000);
    duration = `${days} ${
      days <= 1 ? "day" : "days"
    }, ${hours} h, ${minutes} min, ${seconds} sec, ${
      remainingMsAfterMinutes % 1_000
    } ms`;
  } else if (differenceInMs < 31_536_000_000) {
    const months = Math.floor(differenceInMs / 2_592_000_000);
    const remainingMsAfterMonths = differenceInMs % 2_592_000_000;
    const days = Math.floor(remainingMsAfterMonths / 86_400_000);
    const remainingMsAfterDays = differenceInMs % 86_400_000;
    const hours = Math.floor(remainingMsAfterDays / 3_600_000);
    const remainingMsAfterHours = remainingMsAfterDays % 3_600_000;
    const minutes = Math.floor(remainingMsAfterHours / 60_000);
    const remainingMsAfterMinutes = remainingMsAfterHours % 60_000;
    const seconds = Math.floor(remainingMsAfterMinutes / 1_000);
    duration = `${months} ${months <= 1 ? "month" : "months"}, ${days} ${
      days <= 1 ? "day" : "days"
    }, ${hours} h, ${minutes} min, ${seconds} sec, ${
      remainingMsAfterMinutes % 1_000
    } ms`;
  } else {
    const years = Math.floor(differenceInMs / 31_536_000_000);
    const remainingMsAfterYears = differenceInMs % 31_536_000_000;
    const months = Math.floor(remainingMsAfterYears / 2_592_000_000);
    const remainingMsAfterMonths = differenceInMs % 2_592_000_000;
    const days = Math.floor(remainingMsAfterMonths / 86_400_000);
    const remainingMsAfterDays = differenceInMs % 86_400_000;
    const hours = Math.floor(remainingMsAfterDays / 3_600_000);
    const remainingMsAfterHours = remainingMsAfterDays % 3_600_000;
    const minutes = Math.floor(remainingMsAfterHours / 60_000);
    const remainingMsAfterMinutes = remainingMsAfterHours % 60_000;
    const seconds = Math.floor(remainingMsAfterMinutes / 1_000);
    duration = `${years} ${years <= 1 ? "year" : "years"}, ${months} ${
      months <= 1 ? "month" : "months"
    }, ${days} ${
      days <= 1 ? "day" : "days"
    }, ${hours} h, ${minutes} min, ${seconds} sec, ${
      remainingMsAfterMinutes % 1_000
    } ms`;
  }

  duration = `${options.prefix ?? ""}${duration}${options.suffix ?? ""}`;
  if (options.log === true) {
    console.log(duration);
  }
  return duration;
}
