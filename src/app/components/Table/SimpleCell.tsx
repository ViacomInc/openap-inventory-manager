export default function SimpleCell({
  value,
}: {
  value: string | number | null;
}) {
  if (value === null) {
    return null;
  }

  return String(value);
}
