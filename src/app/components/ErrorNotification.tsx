import React from "react";
import { LinkItUrl } from "react-linkify-it";
import { Error } from "../store/types";
import { Notification, NotificationType } from "./ui";

interface ErrorNotificationProps {
  errors?: Array<Error | undefined>;
}

export default function ErrorNotification({
  errors,
}: ErrorNotificationProps): JSX.Element | null {
  if (!errors) {
    return null;
  }

  const errs = errors.filter(Boolean);
  if (!errs.length) {
    return null;
  }

  return (
    <Notification type={NotificationType.Error}>
      {errs.map((error, i) => (
        <p key={i}>
          <LinkItUrl>{error?.message}</LinkItUrl>
        </p>
      ))}
    </Notification>
  );
}
