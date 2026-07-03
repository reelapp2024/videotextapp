import React from 'react';
import { useScopedOverlay } from './OverlayLineEditContext.jsx';

function StyleMetricControl({
  label,
  percentLabel,
  percentValue,
  onPercentChange,
  pxLabel,
  pxValue,
  onPxChange,
  percentMin = 0,
  percentMax = 100,
  percentStep = 1,
  pxMax = 200,
}) {
  const pct = percentValue ?? 0
  const usePx = pxValue != null && pxValue !== '' && !Number.isNaN(Number(pxValue))

  return (
    <div>
      <label className="text-[9px] text-gray-500 block mb-0.5">{label}</label>
      <div className="flex items-center gap-2 mb-1">
        <input
          type="range"
          min={percentMin}
          max={percentMax}
          step={percentStep}
          className="flex-1 h-1.5 bg-gray-600 rounded"
          value={pct}
          disabled={usePx}
          onChange={(e) => onPercentChange(parseFloat(e.target.value))}
        />
        <input
          type="number"
          min={percentMin}
          max={percentMax}
          step={percentStep}
          value={pct}
          disabled={usePx}
          onChange={(e) => onPercentChange(parseFloat(e.target.value) || 0)}
          className="w-12 bg-[#080b16] border border-indigo-500/[0.1] rounded text-[10px] p-0.5 text-center"
          title={`${percentLabel} (% of text size)`}
        />
        <span className="text-[8px] text-gray-600 w-3">%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] text-gray-600 shrink-0">{pxLabel}</span>
        <input
          type="number"
          min={0}
          max={pxMax}
          step={1}
          placeholder="auto"
          value={usePx ? pxValue : ''}
          onChange={(e) => {
            const v = e.target.value
            onPxChange(v === '' ? null : parseFloat(v) || 0)
          }}
          className="flex-1 bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
        />
        <span className="text-[8px] text-gray-600">px</span>
        {usePx && (
          <button
            type="button"
            className="text-[8px] text-indigo-400 hover:text-indigo-300"
            onClick={() => onPxChange(null)}
          >
            Auto
          </button>
        )}
      </div>
    </div>
  )
}

export default function OverlayStyle({ activeOverlayIndex, config, updateOverlayConfig }) {
  const { ov, setField, lineLabel } = useScopedOverlay(activeOverlayIndex, config, updateOverlayConfig);
  const isBox = ov.styleType === 'box'

  return (
    <div className="bg-indigo-500/[0.03] p-2.5 rounded-xl border border-indigo-500/[0.06]">
      <p className="text-[10px] text-gray-500 mb-2 font-medium">
        STYLE — {lineLabel}
        {ov?.captionPresetsEnabled ? ' (overrides caption preset)' : ''}
      </p>

      <div className="grid grid-cols-2 gap-1 mb-2">
        {['box', 'stroke'].map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setField('styleType', style)}
            className={`p-1.5 rounded text-xs transition ${
              ov.styleType === style
                ? 'bg-purple-600 text-white'
                : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
            }`}
          >
            {style === 'box' ? '▣ Box' : '◯ Stroke'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Text Color</label>
          <div className="flex items-center gap-1 bg-gray-700 rounded p-1">
            <input
              type="color"
              value={ov.color}
              onChange={(e) => setField('color', e.target.value)}
              className="w-8 h-6 rounded bg-transparent border-none cursor-pointer"
            />
            <span className="text-[9px] text-gray-400 flex-1">{ov.color}</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">
            {isBox ? 'Bg Color' : 'Stroke Color'}
          </label>
          <div className="flex items-center gap-1 bg-gray-700 rounded p-1">
            {isBox ? (
              <input
                type="color"
                value={ov.bgColor}
                onChange={(e) => setField('bgColor', e.target.value)}
                className="w-8 h-6 rounded bg-transparent border-none cursor-pointer"
              />
            ) : (
              <input
                type="color"
                value={ov.strokeColor}
                onChange={(e) => setField('strokeColor', e.target.value)}
                className="w-8 h-6 rounded bg-transparent border-none cursor-pointer"
              />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              className="flex-1 h-1.5 bg-gray-600 rounded"
              value={isBox ? ov.bgOpacity : ov.strokeOpacity || 1}
              onChange={(e) =>
                setField(isBox ? 'bgOpacity' : 'strokeOpacity', parseFloat(e.target.value))
              }
            />
          </div>
        </div>
      </div>

      {isBox && (
        <div className="pt-2 border-t border-gray-700/50 space-y-2">
          <p className="text-[10px] text-gray-500 font-medium">Box Background</p>
          <div>
            <label className="text-[9px] text-gray-500 block mb-0.5">Box Opacity</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="flex-1 h-1.5 bg-gray-600 rounded"
                value={ov.bgOpacity ?? 1}
                onChange={(e) => setField('bgOpacity', parseFloat(e.target.value))}
              />
              <span className="text-[9px] w-8">{(ov.bgOpacity ?? 1).toFixed(1)}</span>
            </div>
          </div>

          <StyleMetricControl
            label="Box Padding"
            percentLabel="padding"
            percentValue={ov.boxPaddingPercent ?? 40}
            onPercentChange={(v) => setField('boxPaddingPercent', v)}
            pxLabel="Manual"
            pxValue={ov.boxPaddingPx}
            onPxChange={(v) => setField('boxPaddingPx', v)}
            percentMin={0}
            percentMax={120}
            pxMax={300}
          />

          <StyleMetricControl
            label="Box Corner Radius"
            percentLabel="radius"
            percentValue={ov.boxCornerRadiusPercent ?? 20}
            onPercentChange={(v) => setField('boxCornerRadiusPercent', v)}
            pxLabel="Manual"
            pxValue={ov.boxCornerRadiusPx}
            onPxChange={(v) => setField('boxCornerRadiusPx', v)}
            percentMin={0}
            percentMax={80}
            pxMax={200}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">Box Position X (%)</label>
              <input
                type="number"
                min="-10"
                max="10"
                step="0.5"
                value={ov.boxOffsetX ?? 0}
                onChange={(e) => setField('boxOffsetX', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 block mb-0.5">Box Position Y (%)</label>
              <input
                type="number"
                min="-10"
                max="10"
                step="0.5"
                value={ov.boxOffsetY ?? 0}
                onChange={(e) => setField('boxOffsetY', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg text-[10px] p-1"
              />
            </div>
          </div>
        </div>
      )}

      {!isBox && (
        <div className="pt-2 border-t border-gray-700/50 space-y-2">
          <p className="text-[10px] text-gray-500 font-medium">Stroke</p>
          <StyleMetricControl
            label="Stroke Size"
            percentLabel="stroke"
            percentValue={ov.strokeWidthPercent ?? 6}
            onPercentChange={(v) => setField('strokeWidthPercent', v)}
            pxLabel="Manual"
            pxValue={ov.strokeWidthPx}
            onPxChange={(v) => setField('strokeWidthPx', v)}
            percentMin={0}
            percentMax={40}
            percentStep={0.5}
            pxMax={80}
          />
        </div>
      )}
    </div>
  )
}
