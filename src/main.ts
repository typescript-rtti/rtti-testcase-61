import winston, { format, transports, transport as Transport, Logger } from "winston";
import { Format } from "logform";

const { combine, timestamp, label, printf, errors, splat } = format;

// Custom logging format
const customFormat = printf(({ level, message, label, timestamp, stack }) => {
  return `${level}\t ${timestamp} · ${label || "-"} \t· ${message} ${stack || ""}`;
});

const myCustomLevels = {
  levels: {
    alert: 0,
    fatal: 1,
    error: 2,
    warning: 3,
    verbose: 4,
    info: 5,
    debug: 6,
    trace: 7
  },
  colors: {
    alert: "magentaBG white",
    fatal: "redBG white",
    error: "red",
    warning: "yellow",
    verbose: "green",
    info: "blue",
    debug: "cyan",
    trace: "cyanBG black"
  }
};

// Custom combined logging format:
const customCombinedFormat = (module: string): Format =>
  combine(
    errors({ stack: true }),
    format.colorize({ level: true }),
    label({ label: module }),
    timestamp(),
    splat(),
    customFormat
  );

// Custom transports:
const customTransports = (): Transport[] => [new transports.Console()];

// Container to provide different pre-configured loggers
const logContainer = new winston.Container();

winston.addColors(myCustomLevels.colors);

// Default logger for modules:
const getLogger = (module: string): Logger & Record<keyof typeof myCustomLevels["levels"], winston.LeveledLogMethod> => {
  if (!logContainer.has(module)) {
    logContainer.add(module, {
      level: "trace",
      levels: myCustomLevels.levels,
      format: customCombinedFormat(module),
      transports: customTransports()
    });
  }
  return logContainer.get(module) as Logger & Record<keyof typeof myCustomLevels["levels"], winston.LeveledLogMethod>;
};

export default getLogger;
export const defaultLogger =  getLogger("default");