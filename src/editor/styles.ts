/**
 * Scoped styles for the SiteKit Editor inside Shadow DOM.
 * Enforces TC-E13: Isolation from host page styles.
 * Accessible focus indicators and 44x44 px touch targets.
 */
export const EDITOR_CSS = `
:host {
  all: initial;
  position: static;
}

*, *::before, *::after {
  box-sizing: border-box;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 14px;
  border: 0;
  background: #0f766e;
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 118, 110, 0.4);
  display: grid;
  place-items: center;
  z-index: 2147483640;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fab:hover {
  transform: scale(1.05);
}

.fab:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible {
  outline: 2px solid #0f766e;
  outline-offset: 2px;
}

.panel {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 320px;
  max-height: min(580px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #1c2528;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(10, 30, 32, 0.28), 0 0 0 1px rgba(10, 30, 32, 0.06);
  z-index: 2147483641;
  overflow: hidden;
}

.panel[hidden] {
  display: none !important;
}

.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  border-bottom: 1px solid #e6ecec;
  background: #fafcfc;
}

.bar:active {
  cursor: grabbing;
}

.bar b {
  font-size: 14px;
  letter-spacing: 0.2px;
  color: #0f766e;
}

.sp {
  flex: 1;
}

.bar button {
  border: 0;
  background: none;
  font-size: 16px;
  cursor: pointer;
  color: #5a6a6d;
  border-radius: 8px;
  padding: 4px 8px;
  min-width: 32px;
  min-height: 32px;
  display: grid;
  place-items: center;
}

.body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

h2 {
  font-size: 18px;
  margin: 0 0 12px;
  font-weight: 600;
}

.search {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d5dede;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 12px;
  background: #fff;
  color: #1c2528;
}

.items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.items li {
  border-bottom: 1px solid #e6ecec;
}

.items button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  border: 0;
  background: none;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  color: inherit;
  min-height: 44px;
}

.items button:hover {
  background: #f4f7f7;
  border-radius: 6px;
}

.badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.badge.on {
  background: #e6f4f1;
  color: #0f766e;
}

.badge.off {
  background: #f0f2f2;
  color: #7b8a8d;
}

.empty {
  padding: 16px 4px;
  color: #5a6a6d;
  font-size: 14px;
  text-align: center;
}

.back {
  border: 0;
  background: none;
  color: #0f766e;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hint {
  margin: -6px 0 14px;
  color: #5a6a6d;
  font-size: 13px;
  line-height: 1.45;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 500;
}

label.row {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

label span {
  display: flex;
  justify-content: space-between;
  color: #334144;
}

label b {
  color: #0f766e;
  font-weight: 600;
}

input[type="range"], select {
  width: 100%;
}

input[type="color"] {
  width: 100%;
  height: 36px;
  border: 1px solid #d5dede;
  border-radius: 8px;
  padding: 2px;
  background: #ffffff;
  cursor: pointer;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #0f766e;
  cursor: pointer;
}

select, input[type="text"] {
  padding: 8px 10px;
  border: 1px solid #d5dede;
  border-radius: 8px;
  font-size: 13px;
  background: #ffffff;
  color: #1c2528;
}

input[type="range"] {
  accent-color: #0f766e;
}

.reset-btn {
  margin-top: 16px;
  border: 0;
  background: none;
  color: #c2410c;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 0;
}

footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid #e6ecec;
  background: #fafcfc;
}

.status {
  flex: 1;
  font-size: 12px;
  color: #5a6a6d;
}

.primary {
  border: 0;
  background: #0f766e;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.primary:hover {
  background: #0d655e;
}

@media (max-width: 480px) {
  .panel {
    left: 12px !important;
    right: 12px !important;
    width: auto !important;
  }
}
`;
