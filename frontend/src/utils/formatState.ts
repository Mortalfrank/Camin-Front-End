export function formatOrderState(state: string) {
  if (!state) return "";
  return state.charAt(0) + state.slice(1).toLowerCase();
}
