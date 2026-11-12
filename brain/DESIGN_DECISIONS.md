# Sentinel — Graphite / Institutional Design System

## Palette Swatch Specification (Image-Verified)
- **Canvas**: `#151719` (soft dark graphite, calm and natural)
- **Surface**: `#1C1F22` (primary panel and card background)
- **Elevated**: `#24282B` (hovered elements, dropdowns, and active selections)
- **Divider**: `#34393D` (low-contrast separator line)
- **Primary Text**: `#E3E5E6` (clear off-white, optimal readability)
- **Secondary Text**: `#969DA2` (calm slate grey, strong legibility)
- **Muted Text**: `#6B7278` (timestamps, subtle annotations)
- **Accent**: `#B1A078` (institutional warm bronze / champagne, replacing harsh orange)
- **Status Optimal**: `#638D7D` (muted sage green)
- **Status Warning**: `#C09853` (muted ochre amber)
- **Status Critical**: `#B85555` (muted brick red)

## Architectural Design Rules Applied
1. **No "box-in-a-box" clutter**: Removed excessive 1px outlines and nested card syndrome. Hierarchy is established through surface contrast (`#151719` canvas vs `#1C1F22` surfaces vs `#24282B` elevated) and generous negative space.
2. **Typography & Case**: Eliminated all-caps shouting and aggressive letter spacing. Section titles and labels use natural sentence case. Normal and medium weights replace heavy bolding on every label.
3. **No Decorative HUD Clutter**: Removed tacky grid patterns, pulsing radar circles, and tactical map overlays. The campus digital twin is rendered with architectural clarity using clean geometry.
4. **Restrained Color Discipline**: Neutral grays for inactive items, with color strictly reserved for true status conditions (`#638D7D`, `#C09853`, `#B85555`) and primary interactive actions (`#B1A078`).
