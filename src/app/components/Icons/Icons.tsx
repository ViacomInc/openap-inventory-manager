import React from "react";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons/faCalendarPlus";
import { faCalendarTimes } from "@fortawesome/free-solid-svg-icons/faCalendarTimes";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
import { faCloudDownloadAlt } from "@fortawesome/free-solid-svg-icons/faCloudDownloadAlt";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons/faCloudUploadAlt";
import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons/faPaperclip";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faRetweet } from "@fortawesome/free-solid-svg-icons/faRetweet";
import { faSort } from "@fortawesome/free-solid-svg-icons/faSort";
import { faSortDown } from "@fortawesome/free-solid-svg-icons/faSortDown";
import { faSortUp } from "@fortawesome/free-solid-svg-icons/faSortUp";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt";
import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";

import Styles from "./Icons.module.css";

export enum Icons {
  Account = "account",
  Add = "add",
  Cancel = "cancel",
  Close = "close",
  Collapse = "collapse",
  Conflicted = "conflicted",
  Copy = "copy",
  Delete = "delete",
  Done = "done",
  Download = "download",
  Error = "Error",
  Expand = "expand",
  Fetch = "fetch",
  Flush = "flush",
  Info = "Info",
  New = "new",
  Removed = "removed",
  RepeatItem = "repeatitem",
  Sort = "sort",
  SortDown = "sortdown",
  SortUp = "sortup",
  Success = "Success",
  Sync = "Sync",
  Undo = "undo",
  Updated = "updated",
  Upload = "upload",
  Warning = "Warning",
}

const IconsMap: Record<Icons, IconDefinition> = {
  [Icons.Account]: faUser,
  [Icons.Add]: faPlus,
  [Icons.Cancel]: faTimes,
  [Icons.Close]: faTimes,
  [Icons.Collapse]: faChevronUp,
  [Icons.Conflicted]: faExclamationCircle,
  [Icons.Copy]: faCopy,
  [Icons.Delete]: faTrashAlt,
  [Icons.Done]: faCheck,
  [Icons.Download]: faArrowDown,
  [Icons.Error]: faExclamationCircle,
  [Icons.Expand]: faChevronDown,
  [Icons.Fetch]: faCloudDownloadAlt,
  [Icons.Flush]: faCalendarTimes,
  [Icons.Info]: faInfoCircle,
  [Icons.New]: faCheckCircle,
  [Icons.Removed]: faTrashAlt,
  [Icons.RepeatItem]: faCalendarPlus,
  [Icons.SortDown]: faSortDown,
  [Icons.SortUp]: faSortUp,
  [Icons.Sort]: faSort,
  [Icons.Success]: faCheck,
  [Icons.Sync]: faCloudUploadAlt,
  [Icons.Undo]: faUndo,
  [Icons.Updated]: faRetweet,
  [Icons.Upload]: faPaperclip,
  [Icons.Warning]: faExclamationTriangle,
};

function IconsDefinition(): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={Styles.Definitions}>
      {Object.entries(IconsMap).map(([name, { icon }]) => {
        const paths = typeof icon[4] === "string" ? [icon[4]] : icon[4];

        return (
          <symbol
            key={name}
            id={`icon-${name}`}
            viewBox={`0 0 ${icon[0]} ${icon[1]}`}
          >
            {paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </symbol>
        );
      })}

      <symbol id="icon-loader" viewBox="0 0 160 160">
        <path
          d="M 78.7783 10.0106 A 70 70 0 1 0 80 10"
          stroke="currentcolor"
          fill="none"
          opacity="0.15"
        />
        <path
          d="M 56.0585 145.7784 A 70 70 0 1 0 67.8446 11.0634"
          stroke="currentcolor"
          fill="none"
        />
      </symbol>
    </svg>
  );
}

export default React.memo(IconsDefinition);
