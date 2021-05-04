import {
  useEffect,
  useState,
  useRef,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { useOnClickOutside } from "../ui";

import { InventoryTableRow } from "./types";

export default function useModalForChanges(
  selectedRows: InventoryTableRow[]
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const rowElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    rowElRef.current = selectedRows.length
      ? document.getElementById(selectedRows[0].id)
      : null;
  }, [selectedRows]);

  const showModal = useCallback(() => {
    if (!rowElRef.current) {
      return;
    }

    setIsOpen(true);
  }, []);

  useOnClickOutside(rowElRef, showModal);

  return [isOpen, setIsOpen];
}
