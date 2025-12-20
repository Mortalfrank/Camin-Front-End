import React from "react";
import { formatOrderState } from "../utils/formatState";

interface Props {
  state: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-gray-200 text-gray-700",
  PAID: "bg-blue-200 text-blue-800",
  CANCELLED: "bg-red-200 text-red-800",
  TRANSPORTING: "bg-purple-200 text-purple-800",
  ARRIVED: "bg-green-200 text-green-800",
  ACCEPTED: "bg-teal-200 text-teal-800",
  RETURNED: "bg-orange-200 text-orange-800",
};

export default function OrderStatusBadge({ state }: Props) {
  const colors = statusStyles[state] || "bg-gray-200 text-gray-700";

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${colors}`}
    >
      {formatOrderState(state)}
    </span>
  );
}
