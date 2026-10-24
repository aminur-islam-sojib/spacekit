/**
 * Scoped styles for the SiteKit Editor inside Shadow DOM.
 * Enforces TC-E13: Isolation from host page styles.
 * Accessible focus indicators and 44x44 px touch targets.
 */
export const EDITOR_CSS = `
:host {
  all: initial;
  position: relative;
  z-index: 2147483647;
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
  z-index: 2147483646;
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
  width: 350px;
  max-height: min(680px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #0f172a;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 24px 60px -10px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.04);
  z-index: 2147483647;
  overflow: hidden;
}

.panel[hidden] {
  display: none !important;
}

.bar {
  display: flex;
  align-items: center;
  padding: 16px 20px 8px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  background: #ffffff;
}

.bar:active {
  cursor: grabbing;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f766e;
}

.sp {
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-icon-btn {
  border: 0;
  background: transparent;
  color: #52525b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
  padding: 0;
}

.header-icon-btn:hover {
  background: #f4f4f5;
  color: #18181b;
  transform: scale(1.05);
}

.header-icon-btn:active {
  transform: scale(0.95);
}

.header-icon-btn.active {
  background: #f0fdfa;
  color: #0f766e;
}

.help-banner {
  margin: 0 20px 12px;
  padding: 12px 0px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 14px;
  font-size: 12px;
  color: #115e59;
  line-height: 1.45;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(15, 118, 110, 0.08);
}

.help-banner b {
  font-weight: 700;
  color: #0f766e;
}

.features-header-area {
  padding: 4px 0px 12px;
}

.features-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #18181b;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  pointer-events: none;
  color: #71717a;
}

.search {
  width: 100%;
  padding: 9px 34px 9px 36px;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  font-size: 13.5px;
  background: #f8fafc;
  color: #18181b;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.search:focus {
  background: #ffffff;
  border-color: #0f766e;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 10px;
  border: 0;
  background: transparent;
  color: #a1a1aa;
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.search-clear-btn:hover {
  color: #18181b;
}

.body {
  padding: 0 20px 96px;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #e4e4e7 transparent;
}

.body::-webkit-scrollbar {
  width: 5px;
}

.body::-webkit-scrollbar-thumb {
  background: #e4e4e7;
  border-radius: 4px;
}

.items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-group {
  margin-bottom: 8px;
}

.category-header {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #71717a;
  padding: 14px 4px 6px;
}

.sub-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sub-items li {
  border-bottom: 1px solid #f1f1f4;
}

.sub-items li:last-child {
  border-bottom: none;
}

.items button {
  width: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  color: #18181b;
  border-radius: 10px;
  transition: background-color 0.15s ease, padding-left 0.15s ease;
}

.items button:hover {
  background: #f8fafc;
  padding-left: 8px;
}

.items button:hover .chevron {
  transform: translateX(2px);
  color: #71717a;
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f4f4f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #27272a;
  flex-shrink: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.items button:hover .item-icon {
  background: #f0fdfa;
  color: #0f766e;
}

.item-title {
  flex: 1;
  font-size: 14.5px;
  font-weight: 500;
  color: #18181b;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 10px;
  font-weight: 600;
}

.badge.on {
  background: #dcfce7;
  color: #15803d;
}

.badge.off {
  background: #f4f4f5;
  color: #71717a;
}

.chevron {
  color: #a1a1aa;
  flex-shrink: 0;
  transition: transform 0.15s ease, color 0.15s ease;
}

.empty {
  padding: 28px 4px;
  color: #71717a;
  font-size: 13.5px;
  text-align: center;
}

.floating-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 18px;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to top, #ffffff 68%, rgba(255, 255, 255, 0));
  z-index: 10;
}

.publish-pill-wrapper {
  position: relative;
  pointer-events: auto;
  display: inline-flex;
}

.primary.publish-pill {
  border: 0;
  border-radius: 9999px;
  background: linear-gradient(135deg, #0f766e, #0d9488);
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 600;
  padding: 10px 22px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px -4px rgba(15, 118, 110, 0.45);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.publish-pill:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 14px 30px -4px rgba(15, 118, 110, 0.55);
}

.publish-pill:active {
  transform: scale(0.98);
}

.pill-divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.35);
}

.pill-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pill-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.45);
  pointer-events: none;
  animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.status {
  font-size: 11px;
  font-weight: 500;
  color: #71717a;
  margin-top: 6px;
  text-align: center;
}

.back {
  border: 0;
  background: none;
  color: #0f766e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 0;
  margin-bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.15s ease;
}

.back:hover {
  opacity: 0.8;
}

h2 {
  font-size: 20px;
  margin: 0 0 14px;
  font-weight: 700;
  color: #18181b;
  letter-spacing: -0.02em;
}

.detail-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 8px;
}

.detail-title {
  font-size: 22px;
  font-weight: 700;
  color: #18181b;
  margin: 0;
  letter-spacing: -0.02em;
}

.editing-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 9999px;
  padding: 3px 8px 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #0f766e;
}

.editing-done-btn {
  border: 0;
  background: #0f766e;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.editing-done-btn:hover {
  background: #0d9488;
}

.empty-selection-card {
  padding: 28px 18px;
  background: #fafafa;
  border: 2px dashed #e4e4e7;
  border-radius: 16px;
  text-align: center;
  color: #71717a;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-selection-card .empty-icon {
  font-size: 32px;
  margin: 0;
}

.empty-selection-card p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
}

.styled-drawer {
  margin-top: 14px;
  border: 1px solid #e4e4e7;
  border-radius: 14px;
  background: #ffffff;
  overflow: hidden;
}

.styled-drawer-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  font-size: 12.5px;
  font-weight: 600;
  color: #3f3f46;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.styled-drawer-trigger:hover {
  background: #f8fafc;
}

.styled-drawer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #f4f4f5;
  max-height: 220px;
  overflow-y: auto;
}

.styled-drawer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f4f4f5;
  font-size: 12px;
  transition: background-color 0.15s ease;
}

.styled-drawer-item:last-child {
  border-bottom: none;
}

.styled-drawer-item:hover {
  background: #f8fafc;
}

.styled-drawer-label {
  flex: 1;
  font-weight: 500;
  color: #18181b;
  cursor: pointer;
}

.styled-drawer-selector {
  display: block;
  font-size: 10px;
  color: #71717a;
  font-family: monospace;
}

.drawer-del-btn {
  border: 0;
  background: transparent;
  color: #ef4444;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}

.drawer-del-btn:hover {
  background: #fee2e2;
}

.field-group {
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.section-card {
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: border-color 0.15s ease;
}

.section-card.disabled {
  opacity: 0.85;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f4f4f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: #18181b;
  flex-shrink: 0;
}

.section-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f172a;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-reset-btn {
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.15s, background-color 0.15s;
}

.section-reset-btn:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 22px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider-round {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 22px;
}

.slider-round:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.switch input:checked + .slider-round {
  background-color: #c084fc;
}

.switch input:checked + .slider-round:before {
  transform: translateX(16px);
}

.section-body {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f4f4f5;
}

.tag-text-label {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.01em;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-swatch-input {
  width: 38px;
  height: 38px;
  padding: 2px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
}

.color-hex-input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  font-family: monospace;
  font-weight: 600;
  color: #0f172a;
}

.section-desc {
  font-size: 11.5px;
  color: #64748b;
  line-height: 1.45;
  margin: 0 0 14px 0;
}

.segmented-group {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
  width: 100%;
}

.segmented-btn {
  flex: 1;
  border: 0;
  background: transparent;
  padding: 7px 0;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
  user-select: none;
}

.segmented-btn:hover {
  color: #0f172a;
}

.segmented-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.row-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.number-pill-input {
  width: 58px;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #0f172a;
}

.mobile-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  background: #f1f5f9;
  color: #0f766e;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.field-group-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #71717a;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f4f4f5;
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
  border: 1px solid #e4e4e7;
  border-radius: 10px;
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
  padding: 9px 12px;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  font-size: 13px;
  background: #ffffff;
  color: #18181b;
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
  margin-top: 8px;
  border: 1px dashed #fca5a5;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 9px 14px;
  border-radius: 10px;
  width: 100%;
  transition: all 0.15s ease;
}

.reset-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.picker-btn {
  width: 100%;
  padding: 12px 14px;
  background: linear-gradient(135deg, #0f766e, #0d9488);
  color: #ffffff;
  border: 0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
  transition: all 0.15s ease;
}

.picker-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(15, 118, 110, 0.35);
}

.picker-btn.picking {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
}

.empty-rules-card {
  padding: 24px 16px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  text-align: center;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 14px;
}

.empty-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.rule-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.rule-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 12px;
}

.rule-title-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.rule-title-group input[type="checkbox"] {
  margin-top: 3px;
}

.rule-label {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.rule-selector {
  font-size: 10px;
  color: #0f766e;
  background: #f0fdfa;
  padding: 1px 5px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 2px;
  word-break: break-all;
}

.rule-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-btn {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mini-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.mini-btn.delete {
  color: #dc2626;
  border-color: #fee2e2;
  background: #fef2f2;
}

.mini-btn.delete:hover {
  background: #fee2e2;
  color: #991b1b;
}

.sub-group {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 10px 10px 6px;
  margin-bottom: 10px;
}

.sub-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 8px;
}

/* Dynamic Text Effects UI & Popover */
.effect-dropdown-wrap {
  position: relative;
}

.effect-dropdown-trigger {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  background: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.effect-dropdown-trigger:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.effect-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  width: 220px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: visible;
  z-index: 100;
  list-style: none;
  padding: 4px 0;
}

.effect-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s ease, color 0.15s ease;
  position: relative;
}

.effect-menu-item:last-child {
  border-bottom: none;
}

.effect-menu-item:hover {
  background: #f1f5f9;
  color: #0f766e;
}

.effect-menu-item.active {
  font-weight: 600;
  color: #0f766e;
  background: #f0fdfa;
}

.effect-menu-check {
  font-size: 13px;
  font-weight: 700;
  color: #0f766e;
}

/* Floating Hover Preview Popover Card */
.effect-hover-popover {
  position: absolute;
  left: 100%;
  top: -10px;
  margin-left: 12px;
  width: 170px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 14px 12px;
  box-shadow: 0 20px 32px -8px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04);
  pointer-events: none;
  z-index: 200;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.popover-title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
}

.popover-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.2;
}

/* Popover Specimen Classes */
.popover-preview-gradient {
  background: linear-gradient(135deg, #c026d3, #2563eb);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.popover-preview-stroke {
  -webkit-text-stroke: 1px #0f172a;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.popover-preview-underline {
  text-decoration: underline;
  text-decoration-color: #0f766e;
  text-decoration-thickness: 2px;
  color: #0f172a;
}

.popover-preview-colorful {
  background: linear-gradient(135deg, #f43f5e, #8b5cf6, #06b6d4, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.popover-preview-fill {
  background: linear-gradient(to top, #fef08a 45%, transparent 45%);
  color: #0f172a;
}

.popover-preview-strong-fill {
  background: #0f172a;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
}

.popover-preview-candy-cane {
  background: repeating-linear-gradient(45deg, #ef4444, #ef4444 6px, #ffffff 6px, #ffffff 12px);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.popover-preview-fill-on-scroll {
  background: linear-gradient(to right, #0f766e 60%, #94a3b8 60%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.popover-preview-reveal-on-scroll {
  filter: blur(0.8px);
  color: #0f172a;
}

/* Color Swatch Row with Clear Button */
.color-swatch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8fafc;
}

.color-swatch-row:last-of-type {
  border-bottom: none;
}

.color-swatch-label {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.color-swatch-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.color-swatch-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: block;
}

.color-swatch-circle input[type="color"] {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 50px;
  height: 50px;
  opacity: 0;
  cursor: pointer;
}

.swatch-clear-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  display: grid;
  place-items: center;
  cursor: pointer;
  line-height: 1;
  transition: all 0.15s ease;
}

.swatch-clear-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

/* Stepper Row (< All words > and - Medium +) */
.stepper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8fafc;
}

.stepper-row:last-of-type {
  border-bottom: none;
}

.stepper-label {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.stepper-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.stepper-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.stepper-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.stepper-value {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  min-width: 65px;
  text-align: center;
  user-select: none;
}

@media (max-width: 480px) {
  .panel {
    left: 12px !important;
    right: 12px !important;
    width: auto !important;
  }
}
`;
