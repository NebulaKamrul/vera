import type { StyleOptions } from '../types';

const ACCENT_COLORS = [
  { label: 'Black',   value: '#111111' },
  { label: 'Navy',    value: '#1e3a5f' },
  { label: 'Teal',    value: '#0d9488' },
  { label: 'Forest',  value: '#166534' },
  { label: 'Burgundy',value: '#7f1d1d' },
  { label: 'Purple',  value: '#4c1d95' },
  { label: 'Brown',   value: '#7A5C3E' },
  { label: 'Slate',   value: '#334155' },
];

// Tiny SVG thumbnail showing the layout of each template
function ClassicThumb({ active }: { active: boolean }) {
  const c = active ? '#7A5C3E' : '#6B6560';
  return (
    <svg width="54" height="66" viewBox="0 0 54 66" fill="none">
      <rect width="54" height="66" rx="3" fill={active ? '#F5EFE8' : '#F7F5F2'} stroke={active ? '#7A5C3E' : '#E2DAD0'} strokeWidth="1.2"/>
      {/* name centered */}
      <rect x="13" y="8" width="28" height="3" rx="1" fill={c}/>
      {/* contact centered */}
      <rect x="17" y="13" width="20" height="1.5" rx="0.75" fill="#ccc"/>
      {/* section header with double rule */}
      <rect x="4" y="20" width="46" height="0.75" rx="0.4" fill={c}/>
      <rect x="14" y="22" width="26" height="2" rx="1" fill={c}/>
      <rect x="4" y="25.5" width="46" height="0.75" rx="0.4" fill={c}/>
      {/* entry line */}
      <rect x="4" y="29" width="30" height="1.5" rx="0.75" fill="#333"/>
      <rect x="38" y="29" width="12" height="1.5" rx="0.75" fill="#333"/>
      {/* subtitle */}
      <rect x="4" y="32" width="22" height="1.5" rx="0.75" fill="#aaa"/>
      {/* bullets */}
      <circle cx="6" cy="36.5" r="1" fill="#999"/>
      <rect x="9" y="35.5" width="34" height="1.5" rx="0.75" fill="#999"/>
      <circle cx="6" cy="40.5" r="1" fill="#999"/>
      <rect x="9" y="39.5" width="28" height="1.5" rx="0.75" fill="#999"/>
      {/* section 2 */}
      <rect x="4" y="46" width="46" height="0.75" rx="0.4" fill={c}/>
      <rect x="16" y="48" width="22" height="2" rx="1" fill={c}/>
      <rect x="4" y="51.5" width="46" height="0.75" rx="0.4" fill={c}/>
      <rect x="4" y="55" width="26" height="1.5" rx="0.75" fill="#333"/>
      <rect x="34" y="55" width="16" height="1.5" rx="0.75" fill="#333"/>
      <rect x="4" y="58" width="18" height="1.5" rx="0.75" fill="#aaa"/>
    </svg>
  );
}

function ModernThumb({ active, color }: { active: boolean; color: string }) {
  const c = color;
  return (
    <svg width="54" height="66" viewBox="0 0 54 66" fill="none">
      <rect width="54" height="66" rx="3" fill={active ? '#F5EFE8' : '#F7F5F2'} stroke={active ? '#7A5C3E' : '#E2DAD0'} strokeWidth="1.2"/>
      {/* name left */}
      <rect x="4" y="8" width="32" height="3" rx="1" fill={c}/>
      {/* contact */}
      <rect x="4" y="13" width="22" height="1.5" rx="0.75" fill="#ccc"/>
      {/* section header: accent bottom rule */}
      <rect x="4" y="20" width="22" height="2" rx="1" fill={c}/>
      <rect x="4" y="23" width="46" height="0.75" rx="0.4" fill={c}/>
      {/* entry */}
      <rect x="4" y="27" width="28" height="1.5" rx="0.75" fill="#333"/>
      <rect x="36" y="27" width="14" height="1.5" rx="0.75" fill="#888"/>
      <rect x="4" y="30" width="20" height="1.5" rx="0.75" fill="#aaa"/>
      {/* bullets */}
      <circle cx="6" cy="34.5" r="1" fill={c}/>
      <rect x="9" y="33.5" width="34" height="1.5" rx="0.75" fill="#999"/>
      <circle cx="6" cy="38.5" r="1" fill={c}/>
      <rect x="9" y="37.5" width="26" height="1.5" rx="0.75" fill="#999"/>
      {/* section 2 */}
      <rect x="4" y="44" width="18" height="2" rx="1" fill={c}/>
      <rect x="4" y="47" width="46" height="0.75" rx="0.4" fill={c}/>
      <rect x="4" y="51" width="26" height="1.5" rx="0.75" fill="#333"/>
      <rect x="36" y="51" width="14" height="1.5" rx="0.75" fill="#888"/>
      <rect x="4" y="54" width="18" height="1.5" rx="0.75" fill="#aaa"/>
      <circle cx="6" cy="58.5" r="1" fill={c}/>
      <rect x="9" y="57.5" width="30" height="1.5" rx="0.75" fill="#999"/>
    </svg>
  );
}

function CompactThumb({ active }: { active: boolean }) {
  const c = active ? '#7A5C3E' : '#6B6560';
  return (
    <svg width="54" height="66" viewBox="0 0 54 66" fill="none">
      <rect width="54" height="66" rx="3" fill={active ? '#F5EFE8' : '#F7F5F2'} stroke={active ? '#7A5C3E' : '#E2DAD0'} strokeWidth="1.2"/>
      {/* name left + contact right */}
      <rect x="4" y="8" width="24" height="3" rx="1" fill={c}/>
      <rect x="34" y="9" width="16" height="1.5" rx="0.75" fill="#ccc"/>
      <rect x="4" y="13" width="46" height="0.5" rx="0.25" fill="#ddd"/>
      {/* section */}
      <rect x="4" y="17" width="18" height="1.5" rx="0.75" fill={c}/>
      <rect x="4" y="19.5" width="46" height="0.5" rx="0.25" fill={c}/>
      <rect x="4" y="22" width="26" height="1.5" rx="0.75" fill="#333"/>
      <rect x="34" y="22" width="16" height="1.5" rx="0.75" fill="#888"/>
      <rect x="4" y="25" width="18" height="1.2" rx="0.6" fill="#aaa"/>
      <circle cx="5.5" cy="28.5" r="0.8" fill="#999"/>
      <rect x="8" y="27.5" width="34" height="1.2" rx="0.6" fill="#999"/>
      <circle cx="5.5" cy="31.5" r="0.8" fill="#999"/>
      <rect x="8" y="30.5" width="26" height="1.2" rx="0.6" fill="#999"/>
      {/* section 2 */}
      <rect x="4" y="35" width="14" height="1.5" rx="0.75" fill={c}/>
      <rect x="4" y="37.5" width="46" height="0.5" rx="0.25" fill={c}/>
      <rect x="4" y="40" width="26" height="1.5" rx="0.75" fill="#333"/>
      <rect x="34" y="40" width="16" height="1.5" rx="0.75" fill="#888"/>
      <rect x="4" y="43" width="16" height="1.2" rx="0.6" fill="#aaa"/>
      <circle cx="5.5" cy="46.5" r="0.8" fill="#999"/>
      <rect x="8" y="45.5" width="30" height="1.2" rx="0.6" fill="#999"/>
      {/* section 3 */}
      <rect x="4" y="51" width="12" height="1.5" rx="0.75" fill={c}/>
      <rect x="4" y="53.5" width="46" height="0.5" rx="0.25" fill={c}/>
      <rect x="4" y="56" width="20" height="1.2" rx="0.6" fill="#999"/>
      <rect x="4" y="59" width="28" height="1.2" rx="0.6" fill="#999"/>
    </svg>
  );
}

interface Props {
  options: StyleOptions;
  onChange: (o: StyleOptions) => void;
}

export default function StylePanel({ options, onChange }: Props) {
  function set<K extends keyof StyleOptions>(key: K, value: StyleOptions[K]) {
    onChange({ ...options, [key]: value });
  }

  return (
    <div className="bg-white border border-border rounded-2xl shadow-card px-5 py-4 flex flex-wrap gap-6 items-start mb-6">
      {/* Template */}
      <div>
        <p className="text-[10px] font-medium text-stone uppercase tracking-widest mb-2">template</p>
        <div className="flex gap-2">
          {([
            { id: 'classic', label: 'Classic',  thumb: <ClassicThumb active={options.template === 'classic'} /> },
            { id: 'modern',  label: 'Modern',   thumb: <ModernThumb  active={options.template === 'modern'}  color={options.accentColor} /> },
            { id: 'compact', label: 'Compact',  thumb: <CompactThumb active={options.template === 'compact'} /> },
          ] as const).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => set('template', t.id)}
              className={`flex flex-col items-center gap-1 transition-all ${options.template === t.id ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
            >
              {t.thumb}
              <span className={`text-[9px] font-medium tracking-wide ${options.template === t.id ? 'text-espresso' : 'text-stone'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div>
        <p className="text-[10px] font-medium text-stone uppercase tracking-widest mb-2">color</p>
        <div className="flex flex-wrap gap-1.5">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => set('accentColor', c.value)}
              className="w-6 h-6 rounded-full transition-all ring-offset-1"
              style={{
                background: c.value,
                ringColor: c.value,
                outline: options.accentColor === c.value ? `2px solid ${c.value}` : '2px solid transparent',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <p className="text-[10px] font-medium text-stone uppercase tracking-widest mb-2">font</p>
        <div className="flex gap-2">
          {([
            { id: 'serif', label: 'Serif', preview: 'Aa', family: '"Times New Roman", serif' },
            { id: 'sans',  label: 'Sans',  preview: 'Aa', family: 'Arial, sans-serif' },
          ] as const).map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => set('font', f.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-all ${
                options.font === f.id
                  ? 'border-espresso bg-parchment/60 text-espresso'
                  : 'border-border text-stone hover:border-espresso/40'
              }`}
            >
              <span style={{ fontFamily: f.family, fontSize: '18px', lineHeight: 1 }}>{f.preview}</span>
              <span className="text-[9px] font-medium tracking-wide">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
