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
  width: 360px;
  max-height: min(620px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.06);
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
  padding: 12px 16px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.bar:active {
  cursor: grabbing;
}

.bar b {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: #0f172a;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bar b::after {
  content: "PRO";
  font-size: 9px;
  font-weight: 700;
  background: #e6f4f1;
  color: #0f766e;
  padding: 2px 5px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.sp {
  flex: 1;
}

.bar button {
  border: 0;
  background: #f1f5f9;
  font-size: 13px;
  cursor: pointer;
  color: #64748b;
  border-radius: 8px;
  padding: 4px 8px;
  min-width: 28px;
  min-height: 28px;
  display: grid;
  place-items: center;
  transition: all 0.15s ease;
}

.bar button:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.body {
  padding: 14px;
  overflow-y: auto;
  flex: 1;
}

h2 {
  font-size: 17px;
  margin: 0 0 12px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.2px;
}

.search {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  background: #ffffff;
  color: #0f172a;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search:focus {
  border-color: #0f766e;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
  outline: none;
}

.items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.items li {
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2px;
}

.items button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  border: 0;
  background: none;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  color: #1e293b;
  min-height: 44px;
  border-radius: 8px;
  transition: background 0.15s ease, color 0.15s ease;
}

.items button:hover {
  background: #e6f4f1;
  color: #0f766e;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.badge.on {
  background: #dcfce7;
  color: #15803d;
}

.badge.off {
  background: #f1f5f9;
  color: #64748b;
}

.empty {
  padding: 20px 4px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}

.back {
  border: 0;
  background: none;
  color: #0f766e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.15s;
}

.back:hover {
  opacity: 0.8;
}

.field-group {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 14px 10px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.field-group-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}

.field-group-body {
  display: flex;
  flex-direction: column;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
}

label.row {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

label span {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #334155;
}

label b {
  background: #f1f5f9;
  color: #0f766e;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

input[type="range"], select {
  width: 100%;
}

input[type="color"] {
  width: 100%;
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 2px;
  background: #ffffff;
  cursor: pointer;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #0f766e;
  cursor: pointer;
}

select, input[type="text"] {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  background: #ffffff;
  color: #0f172a;
  transition: border-color 0.15s, box-shadow 0.15s;
}

select:focus, input[type="text"]:focus {
  border-color: #0f766e;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
  outline: none;
}

input[type="range"] {
  accent-color: #0f766e;
  cursor: pointer;
}

.reset-btn {
  margin-top: 6px;
  border: 1px dashed #fca5a5;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  width: 100%;
  transition: all 0.15s ease;
}

.reset-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.status {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.primary {
  border: 0;
  background: linear-gradient(135deg, #0f766e, #0d9488);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(15, 118, 110, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.35);
}

@media (max-width: 480px) {
  .panel {
    left: 12px !important;
    right: 12px !important;
    width: auto !important;
  }
}
`;

