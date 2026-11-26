# Module 4 — Core Components, Layout and Navigation

**Week 1 · Day 4-5 · 5 hours**

> Goal: turn the three build variants from M03 into real screens — Profile, Edit Profile and
> Settings — that navigate on both platforms, survive a restart, respond to safe areas, the
> keyboard, dark mode and dynamic text, and pass an accessibility checklist you will reuse in M09
> and the capstone.

**Stack for this cohort:** React Native 0.88 · Expo SDK 58 · React 19.3.0 · Node.js 24 LTS ·
New Architecture always on · CocoaPods · Android `compileSdk` 37 / `targetSdk` 36 ·
**React Navigation: the current stable major — confirm which one your trainer pins before you
install anything.** This guide was written against React Navigation 7.x; use `npx expo install`
throughout so Expo picks SDK-compatible versions for you.

**Styling:** this cohort uses **NativeWind** (Tailwind-style `className` utilities) as the default —
`StyleSheet` is no longer the teaching approach. NativeWind adds a Babel preset, a Metro wrapper, a
global CSS file and one dependency you track on every Expo SDK upgrade; that cost is accepted here
for faster styling. The checkpoint does not care which styling approach you used — it cares that
the screens work, scale and are accessible. A few places still need plain JS style objects
(Safe-area numbers, pressed opacity, React Navigation's native bar colors); those boundaries are
called out where they appear.

By the end of this module your `PersonalProfileApp` will have three navigable screens, a working
theme toggle, a validated edit form, profile data that survives an app restart, and a written
accessibility checklist with your results.

---

## Learning Goals

By the end of this module you can:

1. Build a screen from core components (`View`, `Text`, `Image`, `ScrollView`, `Pressable`,
   `TextInput`, `FlatList`) and Flexbox layout using NativeWind utility classes driven by one
   small set of design tokens.
2. Set up typed stack and tab navigation with React Navigation and its native dependencies, and
   explain what each navigator owns — including why React Navigation itself still needs JS style
   objects.
3. Keep content clear of unsafe areas and usable while the keyboard is open, on both platforms and
   on resized or foldable windows.
4. Support dark mode and dynamic text size without a separate layout per theme.
5. Persist profile data with AsyncStorage and run a repeatable accessibility checklist over all
   three screens.

---

## Concept

### The core components you will actually reach for

A React Native screen is a tree of native views expressed as components. Seven cover almost all of
the work in this module:

| Component | What it is | Typical job here |
| --- | --- | --- |
| `View` | The basic container | Groups and lays out children; the `div` of React Native |
| `Text` | Text and its descendants | Every string, with styling inherited from parent `Text` nodes |
| `Image` | A rendered image | The profile avatar placeholder |
| `ScrollView` | A scrollable container | Long screen content that may exceed the viewport |
| `Pressable` | A touchable with pressed/focus/hover state | Buttons and tappable rows |
| `TextInput` | An editable text field | The edit form's name, email, phone and bio fields |
| `FlatList` | A virtualised list | The small "facts" list on the Profile screen |

Two rules save a lot of debugging. Only `Text` may contain text — a bare string inside a `View`
throws. And a `ScrollView` that needs scrolling must have a bounded height; give its parent
`flex: 1` or a fixed height. These rules are unchanged by the styling approach.

`FlatList` is virtualised, which matters when lists are long. For the three-row facts list here it
is used to teach the API, not for performance; M09 revisits the performance case at scale.

### Flexbox is the layout model, not CSS's full layout model

React Native's default `flexDirection` is **`column`**, not `row`. A child with `flex-1` takes the
remaining space along the parent's main axis. `items-center` works cross-axis, `justify-center`
works main-axis, `gap-2` spaces children, and there is no float, grid or percentage-height magic
without a parent height. NativeWind compiles these utilities to React Native style objects — it
does not change the layout engine. When something "looks wrong", first give the parent `flex-1`
and check which axis you are aligning on.

### Design tokens: one source, two consumers

With `StyleSheet` the token object is consumed directly by `StyleSheet.create`. With NativeWind the
token values live in `src/theme/tokens.ts`, are exposed to Tailwind utility classes as CSS
variables (for example `bg-primary`, `text-muted`, `border-border`), and are also handed to React
Navigation as a plain JS palette. Change one colour in `tokens.ts` and both the classed screens and
the navigator bars follow — no screen file needs editing. Default Tailwind spacing and radius
scales (`p-4`, `gap-2`, `rounded-xl`) supply the rest of the token set.

### What NativeWind buys and what it costs

NativeWind turns `className="flex-1 items-center gap-2 p-4 bg-surface"` into React Native styles,
so most static styling stays on the element instead of moving to a style object at the bottom of
the file. The cost is real: a Babel preset, a Metro wrapper, a global CSS entry, a
`nativewind-env.d.ts` type reference, and one more dependency to reconcile on every Expo SDK
upgrade. The stable line at the time of writing is NativeWind v4.2.7, which uses Tailwind CSS v3,
the `nativewind/babel` preset and `withNativeWind(config, { input })`. v5 is a release candidate —
do not switch the cohort to an RC on the day of the lab. Because the NativeWind docs last confirm
SDK 57 support explicitly, install with `npx expo install`, run `npx expo-doctor`, and record the
versions Expo resolved for SDK 58. If the resolver cannot produce a compatible set, stop and
confirm the trainer's pin instead of hand-picking versions.

There are three boundaries where `className` is not the whole answer, and pretending otherwise
produces mysterious bugs:

1. **Dynamic numeric values** such as `insets.top + 16` or a pressed opacity cannot be static
   classes. Use the `style` prop for those; NativeWind classes and `style` compose.
2. **React Navigation's native bars** are configured with JS style objects (`headerStyle`,
   `tabBarStyle`) and a JS theme object, not `className`. Read those values from the same token
   palette.
3. **Third-party native views** may not forward `className` to their underlying native view.
   `GestureHandlerRootView` is kept with a plain `style={{ flex: 1 }}` here for that reason.

### Safe areas and window changes

iOS reserves the top of the screen for the status bar, dynamic island and home indicator; Android
can draw edge-to-edge with cutouts and a navigation bar. `SafeAreaProvider` from
`react-native-safe-area-context` measures those insets. NativeWind builds on that with utilities
such as `pt-safe-offset-4` and `pb-safe-offset-6` (`env(safe-area-inset-*) + 1rem` / `+ 1.5rem`),
while `useSafeAreaInsets()` still supplies the raw numbers where a prop needs them (for example
`keyboardVerticalOffset`). Hard-coding a 44-pixel top padding breaks on a resizable iPhone window
(iOS 27) and on a foldable where the window changes size mid-session; insets and the `*-safe-*`
utilities are recomputed on change.

### Keyboard handling

When a `TextInput` is focused, the on-screen keyboard can cover the field. `KeyboardAvoidingView`
shifts or resizes content based on keyboard height; on iOS `behavior="padding"` is usually right,
while Android often needs `behavior="height"` or `undefined` with `keyboardVerticalOffset` tuned
for your header. A `ScrollView` with `keyboardShouldPersistTaps="handled"` lets a tap on another
field work instead of being swallowed by the first blur. Give the user an explicit way to dismiss
the keyboard (`Keyboard.dismiss()`), and set `returnKeyType`/`onSubmitEditing` so the Next key
moves focus down the form. None of these are styling props, so NativeWind does not change them.

> API changes worth knowing: `InteractionManager` has been removed in this stack — do not reach
> for it; use the `Keyboard` APIs and layout events instead. `ImageBackground` is deprecated; put
> an `Image` absolutely positioned inside a `View` when you need a background image.

### Dark mode and dynamic text

NativeWind's `useColorScheme()` from `nativewind` reports the scheme and exposes
`setColorScheme('system' | 'light' | 'dark')`. We keep our own `mode` state so the Settings toggle
has an explicit System / Light / Dark value; an effect pushes that value into NativeWind, and the
resolved value drives `themeVars(isDark)`. The CSS-variable palette makes every `bg-background`,
`text-text` and `border-border` utility follow the theme, and the same resolved `isDark` selects
the palette React Navigation uses. In Expo, system appearance only follows the OS when
`userInterfaceStyle` is `automatic` in `app.json` — set it in Walkthrough 2.

Dynamic text means leaving `allowFontScaling` on (the default), using `maxFontSizeMultiplier`
where a large font would break a tight row, and testing with the OS text size turned up. A layout
that only works at the default text size is not finished.

### React Navigation: stack, tabs and typed params

- **`NavigationContainer`** owns the navigation tree and the current state. It wraps everything.
- **Native Stack** pushes screens onto a platform-native navigation stack (a `UINavigationController`
  on iOS, fragments on Android). Use it for flows that go forward and back — Profile → Edit
  Profile.
- **Bottom Tabs** holds peer top-level destinations — Profile and Settings.
- **Typed params** are an object type mapping route names to their params. Passing it to
  `createNativeStackNavigator<RootStackParamList>()` makes `navigate` and `route.params`
  type-checked, so a renamed screen or a missing param fails `tsc` instead of failing at runtime.

The native workhorses are `react-native-screens` (the native screen containers) and
`react-native-gesture-handler` (gestures such as the iOS back swipe). Install them with
`npx expo install` so their versions match SDK 58, and mount `GestureHandlerRootView` once at the
root. Keep only one `NavigationContainer` in the app.

### The accessibility checklist you will reuse

The checkpoint needs a short checklist you trust enough to reuse in M09 and the capstone. This
module uses five items:

1. Every actionable element has a name (`accessibilityLabel` or `aria-label`).
2. Every actionable element has the right role (`accessibilityRole` / `role` such as `button`,
   `image`, `switch`) and state (`accessibilityState.checked` when it is a toggle).
3. Validation errors are announced (`accessibilityRole="alert"` or `aria-live="polite"`).
4. Text scales with the OS text size and stays readable in both themes.
5. A screen-reader pass (VoiceOver on iOS, TalkBack on Android) can reach and activate every
   control, in a sensible order.

These are React Native props on the same components as before — NativeWind classes do not replace
them. VoiceOver is not available in the iOS Simulator; use Xcode's Accessibility Inspector there
and a real device when you can. TalkBack can be enabled in an emulator's Accessibility settings.

---

## Read These

- `modules/m04-core-components-layout-navigation/brief.md` — Scope, Lab and Definition of done.
- `docs/arch-docs/React Native Bare Workflow Curriculum — Solution Design.md` — the Module 4 row in
  Curriculum and Module Mapping (the checkpoint and the reusable checklist), the accessibility row
  in Testing and Assessment Strategy, and the technology baseline table (React Navigation is a
  per-cohort pin). The checkpoint is styling-agnostic; NativeWind is this cohort's chosen route to
  meeting it.
- `modules/m03-ios-android-project-internals/module-3-ios-android-project-internals.md` — the
  `PersonalProfileApp` and its three EAS profiles are your starting point.
- `modules/m02-community-modules-native-linking/module-2-community-modules-native-linking.md` —
  where AsyncStorage and `react-native-safe-area-context` were installed and linked.
- NativeWind docs: [installation](https://www.nativewind.dev/docs/getting-started/installation),
  [dark mode](https://www.nativewind.dev/docs/core-concepts/dark-mode),
  [useColorScheme()](https://www.nativewind.dev/docs/api/use-color-scheme),
  [themes and CSS variables](https://www.nativewind.dev/docs/guides/themes),
  [safe-area insets](https://www.nativewind.dev/docs/tailwind/new-concepts/safe-area-insets) and
  [third-party components](https://www.nativewind.dev/docs/guides/third-party-components). Read the
  installation page before installing: it states which NativeWind and Tailwind majors are stable
  and which Expo SDK versions are confirmed.
- React Navigation docs: [getting started](https://reactnavigation.org/docs/getting-started/),
  [native stack navigator](https://reactnavigation.org/docs/native-stack-navigator/),
  [bottom tabs](https://reactnavigation.org/docs/bottom-tab-navigator/) and
  [type checking with TypeScript](https://reactnavigation.org/docs/typescript/). The getting-started
  page also lists the Android native tweaks required by the pinned major — read them before
  assuming none are needed.
- React Native docs: [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview),
  [TextInput](https://reactnative.dev/docs/textinput), [FlatList](https://reactnative.dev/docs/flatlist)
  and [accessibility](https://reactnative.dev/docs/accessibility).
- Storage: [AsyncStorage repository](https://github.com/react-native-async-storage/async-storage).
- `docs/reference/module-6-express-basics.docx` is the stated primary format reference but is not
  present in this repo. The M01–M03 module guides supply the section pattern instead.

---

## Walkthrough

Do these in order. Each step has a **Check** that proves it worked before you move on. Every
`cat > … << 'EOF'` block writes a complete file — copy the whole block, including the closing
`EOF`.

### Walkthrough 1 — Lock the baseline and confirm the React Navigation major

```bash
cd ~/Projects/PersonalProfileApp
node -v
npx expo-doctor
git status --short
ls -d ios android
```

**Check:** `node -v` prints `v24.x`; `ios` and `android` exist; `npx expo-doctor` reports no errors;
`git status` is clean or shows only intended M03 work. Ask your trainer one question and write the
answer into your notes: **which React Navigation major is pinned for this cohort?** (This guide was
written for 7.x.) NativeWind is already decided for this cohort — do not re-litigate the styling
choice mid-lab; if the installed set cannot be made compatible, stop and report it.

---

### Walkthrough 2 — Install NativeWind, wire the config, and prove it renders

M02 already installed `react-native-safe-area-context`. NativeWind also wants
`react-native-reanimated` and Tailwind CSS v3. Use Expo's installer so you never hand-pick native
versions, then create the five config files.

```bash
cd ~/Projects/PersonalProfileApp
npx expo install nativewind@4.2.7 react-native-reanimated react-native-safe-area-context
npx expo install --dev tailwindcss@^3.4.17
touch global.css nativewind-env.d.ts
cat > global.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
cat > nativewind-env.d.ts << 'EOF'
/// <reference types="nativewind/types" />
EOF
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-textMuted) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
EOF
cat > babel.config.js << 'EOF'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
EOF
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
EOF
```

If your project already has a `babel.config.js` or `metro.config.js` with extra presets, plugins or
resolver settings from M01–M03, **merge** the NativeWind preset / wrapper into that file instead of
dropping the existing entries. The blocks above are the complete minimal versions for a fresh
config. Also make sure `app.json` has `userInterfaceStyle` set to `automatic` under `expo`, or the
System theme option will not follow the OS. If it is missing, add `"userInterfaceStyle":
"automatic"` under the `expo` key in `app.json` — do not replace the rest of the file:

```bash
cd ~/Projects/PersonalProfileApp
npx expo config --type public | grep userInterfaceStyle
```

Now a temporary smoke test — we will overwrite `App.tsx` with the real root in Walkthrough 4:

```bash
cd ~/Projects/PersonalProfileApp
cat > App.tsx << 'EOF'
import 'react-native-gesture-handler';
import './global.css';
import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-600">NativeWind is ready</Text>
    </View>
  );
}
EOF
npx expo-doctor
npx expo start -c
```

**Check:** `npx expo-doctor` reports no errors; after a cache-cleared start the app shows large,
bold, blue, centred text on white. That proves `className` is being compiled — a plain white
screen with unstyled black text means the Babel preset, Metro wrapper or global CSS import is
missing. Record the installed versions (`npx expo install --check`) in your notes; they are the
versions the rest of this module assumes. Stop the smoke-test server with Ctrl+C before continuing;
Walkthrough 7 starts a fresh dev-client server.

---

### Walkthrough 3 — Design tokens and a typed theme context

Create the token module first. It is the one place where colours are defined; Tailwind reads them
through CSS variables and the navigator reads the same object as a JS palette:

```bash
cd ~/Projects/PersonalProfileApp
mkdir -p src/theme src/navigation src/screens src/storage src/types docs/evidence
touch src/navigation/.gitkeep src/screens/.gitkeep src/storage/.gitkeep src/types/.gitkeep docs/evidence/.gitkeep
cat > src/theme/tokens.ts << 'EOF'
import { vars } from 'nativewind';

export type Palette = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  border: string;
  danger: string;
};

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    textMuted: '#4B5563',
    primary: '#4F46E5',
    border: '#D1D5DB',
    danger: '#DC2626',
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textMuted: '#D1D5DB',
    primary: '#A5B4FC',
    border: '#4B5563',
    danger: '#FCA5A5',
  },
};

function rgbTriplet(hex: string): string {
  const value = hex.replace('#', '');
  return `${parseInt(value.slice(0, 2), 16)} ${parseInt(value.slice(2, 4), 16)} ${parseInt(value.slice(4, 6), 16)}`;
}

export function paletteFor(isDark: boolean): Palette {
  return isDark ? palettes.dark : palettes.light;
}

export function themeVars(isDark: boolean) {
  const palette = paletteFor(isDark);
  return vars({
    '--color-background': rgbTriplet(palette.background),
    '--color-surface': rgbTriplet(palette.surface),
    '--color-text': rgbTriplet(palette.text),
    '--color-textMuted': rgbTriplet(palette.textMuted),
    '--color-primary': rgbTriplet(palette.primary),
    '--color-border': rgbTriplet(palette.border),
    '--color-danger': rgbTriplet(palette.danger),
  });
}
EOF
```

The CSS variable names match the `tailwind.config.js` colours from Walkthrough 2. Now the context.
`mode` is explicit so the Settings screen can offer "System / Light / Dark"; the effect pushes it
into NativeWind's own hook, and the resolved `isDark` picks both the CSS variables and the JS
palette:

```bash
cd ~/Projects/PersonalProfileApp
cat > src/theme/ThemeContext.tsx << 'EOF'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { paletteFor, themeVars, type Palette } from './tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  palette: Palette;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const isDark = mode === 'system' ? colorScheme === 'dark' : mode === 'dark';

  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, palette: paletteFor(isDark), setMode }),
    [mode, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVars(isDark)]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return value;
}
EOF
```

**Check:** both files exist. `npx tsc --noEmit` may still complain about missing screen modules
until Walkthroughs 4–6; errors *inside* these two files are real and must be fixed first. The
`View` wrapper is deliberate: it is where the CSS variables are applied, so every classed screen
below them sees the current palette.

---

### Walkthrough 4 — Typed navigation and the app root

Put the param lists and reusable screen-prop types in one place:

```bash
cd ~/Projects/PersonalProfileApp
cat > src/navigation/types.ts << 'EOF'
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Main: undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  ProfileTab: undefined;
  SettingsTab: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<'Main'>
  >;
EOF
```

A `type` alias (not an `interface`) is required here — React Navigation's type checking depends on
it. `CompositeScreenProps` is what lets a screen inside the tabs navigate to `EditProfile` in the
parent stack while keeping both name and params checked.

Now the navigators. The stack owns the Edit Profile flow; the tabs own the two peer destinations.
Note the JS style objects: React Navigation draws native bars, and it does not read `className`.
The values come from `palette`, the same object that feeds `themeVars`:

```bash
cd ~/Projects/PersonalProfileApp
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-gesture-handler
npx expo install expo-constants
cat > src/navigation/AppNavigator.tsx << 'EOF'
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { MainTabParamList, RootStackParamList } from './types';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { palette } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: { backgroundColor: palette.background },
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
      }}
    >
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarIcon: () => <Text>👤</Text> }}
      />
      <Tabs.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: 'Settings', tabBarIcon: () => <Text>⚙️</Text> }}
      />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { palette, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: 'Edit profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
EOF
```

Spreading `DarkTheme`/`DefaultTheme` keeps the `fonts` and `dark` fields the `NavigationContainer`
theme type expects — replacing the whole object with only `colors` would fail `tsc`.

Finally, wire the providers at the root. The gesture-handler import must be the first line and the
global CSS import must precede the app code. `GestureHandlerRootView` is a third-party native view
that may not forward `className`, so it keeps a plain inline `style={{ flex: 1 }}` — that is the
third boundary described in Concept:

```bash
cd ~/Projects/PersonalProfileApp
cat > App.tsx << 'EOF'
import 'react-native-gesture-handler';
import './global.css';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
EOF
```

**Check:** if your project's entry file is `index.js` rather than `App.tsx`, put the
`import 'react-native-gesture-handler';` line at the top of that file instead. Confirm the app
launches after all three screen files exist (next two walkthroughs); until then, unresolved screen
imports are expected. Read the React Navigation getting-started page for the major your trainer
pinned — some versions require a small `MainActivity` / manifest change, and doing it now avoids a
confusing crash later.

---

### Walkthrough 5 — Storage, Profile screen and Edit Profile screen

Start with a typed storage module. It validates what comes back from AsyncStorage so a corrupt or
old value cannot crash the screens:

```bash
cd ~/Projects/PersonalProfileApp
cat > src/types/profile.ts << 'EOF'
export type Profile = {
  name: string;
  email: string;
  phone: string;
  bio: string;
};

export const emptyProfile: Profile = {
  name: '',
  email: '',
  phone: '',
  bio: '',
};
EOF
cat > src/storage/profileStorage.ts << 'EOF'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyProfile, type Profile } from '../types/profile';

export const PROFILE_KEY = 'm04:profile:v1';

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return emptyProfile;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      name: asString(parsed.name),
      email: asString(parsed.email),
      phone: asString(parsed.phone),
      bio: asString(parsed.bio),
    };
  } catch {
    return emptyProfile;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}
EOF
```

M02 used the default-export AsyncStorage API shown here; keep it for this cohort. The upstream
README now also shows a `createAsyncStorage(...)` factory — if your SDK 58-pinned package only
exposes that form, create one storage instance and use the same `getItem`/`setItem`/`removeItem`
calls and the same key.

Now the Profile screen. It reads storage on focus (so edits show up when you navigate back), uses
NativeWind's safe-area utilities for padding, and demonstrates `Image`, `FlatList` and `Pressable`:

```bash
cd ~/Projects/PersonalProfileApp
cat > src/screens/ProfileScreen.tsx << 'EOF'
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { MainTabScreenProps } from '../navigation/types';
import { loadProfile } from '../storage/profileStorage';
import { emptyProfile, type Profile } from '../types/profile';

const facts = [
  { id: 'framework', label: 'Framework', value: 'React Native 0.88' },
  { id: 'navigation', label: 'Navigation', value: 'Typed stack + tabs' },
  { id: 'storage', label: 'Storage', value: 'AsyncStorage' },
];

export function ProfileScreen({ navigation }: MainTabScreenProps<'ProfileTab'>) {
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProfile().then((loaded) => {
        if (active) setProfile(loaded);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pt-safe-offset-4 pb-safe-offset-6 gap-2 bg-background"
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require('../../assets/icon-prod.png')}
        className="h-[88px] w-[88px] rounded-[44px] self-center"
        accessibilityRole="image"
        accessibilityLabel="Profile avatar"
      />
      <Text accessibilityRole="header" className="mt-3 text-2xl font-bold text-text">
        {profile.name || 'Your name'}
      </Text>
      <Text className="text-base text-muted">
        {profile.email || 'Add an email in Edit profile'}
      </Text>
      <Text className="text-base text-muted">
        {profile.phone || 'Add a phone number in Edit profile'}
      </Text>

      <Pressable
        onPress={() => navigation.navigate('EditProfile')}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        accessibilityHint="Opens the edit profile form"
        className="mt-4 items-center rounded-xl bg-primary px-4 py-3.5"
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <Text className="text-base font-semibold text-white">Edit profile</Text>
      </Pressable>

      <FlatList
        data={facts}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View className="flex-row justify-between border-b border-border py-3">
            <Text className="text-muted">{item.label}</Text>
            <Text className="text-text">{item.value}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}
EOF
```

`require('../../assets/icon-prod.png')` is the M03 production icon. If you do not have it, copy
any PNG to `assets/icon-prod.png` first. `contentContainerClassName` is the NativeWind-provided
counterpart of `contentContainerStyle` for `ScrollView`; `pt-safe-offset-4` and
`pb-safe-offset-6` expand to the measured inset plus 16 px / 24 px. `accessibilityRole="header"`
on the name makes the screen readable as a structure, not a wall of text.

Now the Edit Profile screen with validation, a typed ref chain, keyboard handling and announced
errors:

```bash
cd ~/Projects/PersonalProfileApp
cat > src/screens/EditProfileScreen.tsx << 'EOF'
import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../navigation/types';
import { loadProfile, saveProfile } from '../storage/profileStorage';
import type { Profile } from '../types/profile';

function nameError(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 40) return 'Name must be at most 40 characters.';
  return null;
}

function emailError(value: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? null
    : 'Enter an email like name@example.com.';
}

function phoneError(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15
    ? null
    : 'Use 7 to 15 digits. Spaces, +, - and parentheses are fine.';
}

export function EditProfileScreen({ navigation }: RootStackScreenProps<'EditProfile'>) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Strict TypeScript API: typed refs via ComponentRef, never deep imports.
  const nameRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const emailRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const phoneRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const bioRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  React.useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  function update(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    Keyboard.dismiss();
    const next = {
      name: nameError(profile.name),
      email: emailError(profile.email),
      phone: phoneError(profile.phone),
    };
    setErrors(next);
    if (next.name || next.email || next.phone) return;
    await saveProfile({
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
    });
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-safe-offset-4 pb-safe-offset-6 bg-background"
        keyboardShouldPersistTaps="handled"
      >
        <Text accessibilityRole="header" className="mb-4 text-[22px] font-bold text-text">
          Edit profile
        </Text>

        <Text className="mb-1 mt-3 text-base font-semibold text-text">Name</Text>
        <TextInput
          ref={nameRef}
          value={profile.name}
          onChangeText={(value) => update('name', value)}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => emailRef.current?.focus()}
          accessibilityLabel="Name"
          accessibilityHint="Between 2 and 40 characters"
          className="rounded-[10px] border border-border bg-surface p-3 text-base text-text"
        />
        {errors.name ? (
          <Text accessibilityRole="alert" className="mt-1 text-sm text-danger">
            {errors.name}
          </Text>
        ) : null}

        <Text className="mb-1 mt-3 text-base font-semibold text-text">Email</Text>
        <TextInput
          ref={emailRef}
          value={profile.email}
          onChangeText={(value) => update('email', value)}
          inputMode="email"
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => phoneRef.current?.focus()}
          accessibilityLabel="Email"
          className="rounded-[10px] border border-border bg-surface p-3 text-base text-text"
        />
        {errors.email ? (
          <Text accessibilityRole="alert" className="mt-1 text-sm text-danger">
            {errors.email}
          </Text>
        ) : null}

        <Text className="mb-1 mt-3 text-base font-semibold text-text">Phone</Text>
        <TextInput
          ref={phoneRef}
          value={profile.phone}
          onChangeText={(value) => update('phone', value)}
          inputMode="tel"
          keyboardType="phone-pad"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => bioRef.current?.focus()}
          accessibilityLabel="Phone"
          className="rounded-[10px] border border-border bg-surface p-3 text-base text-text"
        />
        {errors.phone ? (
          <Text accessibilityRole="alert" className="mt-1 text-sm text-danger">
            {errors.phone}
          </Text>
        ) : null}

        <Text className="mb-1 mt-3 text-base font-semibold text-text">Bio</Text>
        <TextInput
          ref={bioRef}
          value={profile.bio}
          onChangeText={(value) => update('bio', value)}
          multiline
          maxFontSizeMultiplier={1.5}
          accessibilityLabel="Bio"
          className="min-h-[88px] rounded-[10px] border border-border bg-surface p-3 text-base text-text"
          style={{ textAlignVertical: 'top' }}
        />

        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save profile"
          accessibilityHint="Validates the form, saves it, and returns to the profile"
          className="mt-6 items-center rounded-xl bg-primary px-4 py-3.5"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <Text className="text-base font-semibold text-white">Save profile</Text>
        </Pressable>

        <Pressable
          onPress={() => Keyboard.dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Dismiss keyboard"
          className="items-center py-3"
        >
          <Text className="text-muted">Done with keyboard</Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
EOF
npx tsc --noEmit
```

**Check:** `npx tsc --noEmit` reports no errors *inside the files created so far*; an unresolved
`SettingsScreen` import is expected until Walkthrough 6 creates that file. Notice the two deliberate
`style` uses in an otherwise class-based screen: `textAlignVertical: 'top'` has no utility here, and
pressed opacity is dynamic. That mixing is normal — NativeWind classes and `style` compose, with
`style` winning on conflicts. The three validators are deliberately simple and testable: name 2–40 trimmed
characters, a basic email shape, and 7–15 digits after stripping punctuation. Write down one input
each validator accepts and one it rejects; you will need them for Exercise 3 and for the write-up.

---

### Walkthrough 6 — Settings screen: theme toggle, version line, clear data

```bash
cd ~/Projects/PersonalProfileApp
cat > src/screens/SettingsScreen.tsx << 'EOF'
import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import type { MainTabScreenProps } from '../navigation/types';
import { useTheme, type ThemeMode } from '../theme/ThemeContext';
import { clearProfile } from '../storage/profileStorage';

const modes: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function SettingsScreen({}: MainTabScreenProps<'SettingsTab'>) {
  const { mode, setMode } = useTheme();
  const version = Constants.expoConfig?.version ?? 'unknown';

  function confirmClear() {
    Alert.alert('Clear all data?', 'This removes the saved profile from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearProfile();
          Alert.alert('Cleared', 'The saved profile has been removed.');
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerClassName="px-4 pt-safe-offset-4 pb-safe-offset-6 bg-background">
      <Text accessibilityRole="header" className="mb-4 text-[22px] font-bold text-text">
        Settings
      </Text>

      <Text className="mb-2 text-base font-semibold text-text">Theme</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Theme" className="flex-row gap-2">
        {modes.map((item) => {
          const selected = item.value === mode;
          return (
            <Pressable
              key={item.value}
              onPress={() => setMode(item.value)}
              accessibilityRole="radio"
              accessibilityLabel={`${item.label} theme`}
              accessibilityState={{ checked: selected }}
              className={`flex-1 items-center rounded-[10px] py-3 ${
                selected ? 'bg-primary' : 'bg-surface'
              }`}
            >
              <Text className={selected ? 'text-white' : 'text-text'}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row justify-between border-b border-border py-4">
        <Text className="text-muted">App version</Text>
        <Text accessibilityLabel={`App version ${version}`} className="text-text">
          {version}
        </Text>
      </View>

      <Pressable
        onPress={confirmClear}
        accessibilityRole="button"
        accessibilityLabel="Clear all data"
        accessibilityHint="Removes the saved profile after confirmation"
        className="mt-6 items-center rounded-xl border border-danger py-3.5"
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <Text className="font-semibold text-danger">Clear all data</Text>
      </Pressable>
    </ScrollView>
  );
}
EOF
npx tsc --noEmit
```

**Check:** `npx tsc --noEmit` passes; the app launches with two tabs and an Edit Profile screen in
the stack. Tapping **Dark** in Settings changes every screen immediately — that is the CSS-variable
palette and NativeWind's `setColorScheme` doing their job, with the navigator bars following the
same `palette` object. Tapping **Clear all data** asks for confirmation before touching storage.

---

### Walkthrough 7 — Verify safe areas, keyboard and window changes

The code is in place from Walkthroughs 5 and 6. Now prove it on both platforms.

```bash
cd ~/Projects/PersonalProfileApp
npx expo start --dev-client
```

In a second terminal, list the attached devices:

```bash
adb devices
```

On each platform:

1. **Keyboard:** open Edit Profile, tap Name, then use **Next** to walk Name → Email → Phone → Bio.
   The focused field stays visible on both platforms; tap **Done with keyboard** to dismiss it.
2. **Safe areas:** on an iPhone with a dynamic island, confirm the avatar/header start below it;
   on Android in gesture navigation, confirm the bottom of Settings is not hidden by the nav bar.
   The padding comes from `pt-safe-offset-4` / `pb-safe-offset-6`, which require the
   `SafeAreaProvider` mounted in Walkthrough 4.
3. **Window changes:** resize an iPhone window (iOS 27) or run a foldable AVD, then rotate or
   change the window and confirm the content re-pads instead of sitting under a cutout. On Android
   you can approximate a size change from the shell:

```bash
adb shell wm size
adb shell wm size 720x1280
adb shell wm size reset
```

**Check:** the keyboard never covers the active field, no content is obscured by insets, and a
window-size change reflows the layout without a restart. If classes suddenly stop applying,
restart Metro with `npx expo start -c` — Babel and Metro config changes need a fresh cache. Record
what you observed in your notes — these observations become the write-up's "What tripped me up" and
checkpoint evidence.

---

### Walkthrough 8 — Run the accessibility pass and write the checklist

Enable the screen reader and walk all three screens in this order: Profile → Edit Profile →
Settings. VoiceOver: Settings → General → Accessibility → VoiceOver on a device; Xcode's
Accessibility Inspector in the simulator. TalkBack: Settings → Accessibility → TalkBack in the
emulator (the RN docs give the exact commands). NativeWind changes how styles are written, not how
`accessibilityLabel`, `accessibilityRole` and `accessibilityState` are announced.

Write the reusable checklist with its result column filled in from your own run:

```bash
cd ~/Projects/PersonalProfileApp
mkdir -p docs/evidence
cat > docs/evidence/m04-accessibility-checklist.md << 'EOF'
# M04 — Accessibility checklist (reuse in M09 and capstone)

Screens checked: Profile, Edit Profile, Settings
Platforms checked: iOS (device / Accessibility Inspector), Android (emulator / device)
Checked by: <your name> · Date: <date>

| # | Check | How to test | Result | Note |
| --- | --- | --- | --- | --- |
| 1 | Every actionable element has a name | Screen reader focus on each Pressable / TextInput; label is spoken | PASS / FAIL | |
| 2 | Roles and states are correct | Screen reader announces button, image, radio, checked/unchecked | PASS / FAIL | |
| 3 | Errors are announced | Submit an invalid form; error text is spoken without hunting for it | PASS / FAIL | |
| 4 | Text scales and themes hold | OS text size up + light and dark; no clipping, contrast still readable | PASS / FAIL | |
| 5 | Screen-reader pass completes | VoiceOver / TalkBack reaches and activates every control in order | PASS / FAIL | |

Findings and fixes applied:
- <what the pass caught, and the change you made>

Reuse note: keep this file; M09 and the capstone run the same five checks.
EOF
```

**Check:** the file exists and every row has a real result. A checklist with five `PASS` marks but
no screen-reader run is not evidence — record what the reader actually said.

---

### Walkthrough 9 — Final checkpoint and evidence

```bash
cd ~/Projects/PersonalProfileApp
npx expo-doctor
npx expo install --check
npx tsc --noEmit
git status --short
ls -1 docs/evidence
```

**Check:** `npx expo-doctor` reports no errors; `npx expo install --check` reports no version
mismatches; `npx tsc --noEmit` passes; `git status` shows the intended NativeWind config files,
`src/`, `App.tsx`, dependency changes and `docs/evidence/` only. Capture and keep:

- a screenshot or short recording of Profile → Edit Profile → Settings navigation on **each**
  platform,
- a before/after pair showing profile data still present after a force-quit and relaunch,
- a light/dark pair taken after switching **Dark** in Settings, proving the classed screens and
  the navigator bars change together,
- the filled `docs/evidence/m04-accessibility-checklist.md` from Walkthrough 8.

---

## What This Walkthrough Showed You

- How seven core components plus Flexbox and NativeWind utility classes produce a real three-screen UI.
- How one token module feeds both Tailwind CSS variables and React Navigation's JS theme, so a
  colour change reaches classed screens and native bars without touching screen files.
- How NativeWind is configured in a bare Expo project (Babel preset, Metro wrapper, global CSS,
  type reference) and where plain `style` objects remain necessary.
- How a stack and two tabs split responsibilities, and how one `RootStackParamList` makes screen
  names and params compile-time checked.
- How `SafeAreaProvider` + `*-safe-offset-*` utilities (and raw insets for numeric props),
  `KeyboardAvoidingView`, return-key focus chaining and a dismiss action keep a form usable across
  devices and window shapes.
- How NativeWind's `useColorScheme()` / `setColorScheme()` plus our mode context switches the whole
  palette, and why text scaling needs its own test.
- How a guarded AsyncStorage module gives restart-persistent data without letting corrupt values
  crash a screen.
- How to run a five-item accessibility checklist with a screen reader and keep the result for
  later modules.

---

## EXERCISEs

1. **Break a route name on purpose.** In ProfileScreen change `navigation.navigate('EditProfile')`
   to `navigation.navigate('EditProfileTypo')`, run `npx tsc --noEmit`, and write down the exact
   error. Restore the name and confirm the error disappears. This is the payoff of typed params.
2. **Change one token.** In `src/theme/tokens.ts` change `light.primary` and `dark.primary`,
   relaunch, and confirm every themed surface follows — classed buttons, input borders and the
   navigator's active tint. Explain why no screen file needed editing. Then deliberately remove
   `import './global.css';` from `App.tsx`, restart with `npx expo start -c`, note what breaks, and
   restore the import.
3. **Attack the validators.** Submit each of these and record what happens: a one-character name, a
   name over 40 characters, `name@example`, `12345`, and `(555) 010-1234`. Then add one rule of your
   own (for example, reject a bio over 280 characters) and prove it with an input.
4. **Force a storage failure.** Use
   `npx expo run:android` / `npx expo run:ios` logs or a one-off
   `AsyncStorage.setItem('m04:profile:v1', 'not-json')` in a scratch screen to corrupt the value,
   relaunch, and confirm `loadProfile` falls back to `emptyProfile` instead of crashing. Restore a
   valid value afterwards.
5. **Dark mode surprise hunt.** With **System** selected, switch the OS appearance while the app is
   in the foreground. Then force Light and repeat. Note any screen or native bar that does not
   follow, and say whether it missed `themeVars`, a `text-*`/`bg-*` class, or the JS `navTheme`.
   Confirm `userInterfaceStyle` is `automatic` in `app.json` before blaming the code.
6. **Screen-reader sweep.** With VoiceOver or TalkBack on, complete the whole flow from Profile to
   a successful save and back. Note every element whose spoken name is unclear, then fix it with
   `accessibilityLabel` and re-run the sweep.
7. **Window shape.** On a resized iPhone window or foldable emulator, take a screenshot in each
   window state and confirm the safe-area padding changes. Explain in two sentences why a fixed
   top padding would fail here, and why `pt-safe-offset-4` does not.

---

## Self-Check

Answer these in your own words before checking the Appendix.

1. Walk through building a screen from core components, Flexbox and NativeWind utilities, and
   explain why the parent needs a bounded height before a `ScrollView` can scroll.
2. Describe how you would set up a stack plus two tabs so that screen names and params are
   type-checked, and explain what the React Navigation theme object still needs from the token
   palette even though the screens use `className`.
3. Explain how safe-area utilities and raw insets, `KeyboardAvoidingView` and a focus chain keep the
   Edit Profile form usable when the keyboard opens and when the window changes shape.
4. Describe how NativeWind's `useColorScheme()` plus the mode context switches the CSS variables
   and the navigator palette, and why dynamic text needs a separate check even when the palette is
   correct.
5. Trace a profile value from the Edit Profile form through validation into AsyncStorage and back
   onto the Profile screen after a restart, and explain what the accessibility checklist proves
   about that flow.

### Understanding Checklist

- [ ] I can name the seven core components used here, state the one rule about `Text` and the one rule about `ScrollView` height, and give one NativeWind class for each.
- [ ] I can explain which navigator owns which screens, how the param list types a `navigate` call, and why native bar colors are still JS values.
- [ ] I can say where `pt-safe-offset-4` / `pb-safe-offset-6` come from, when a raw inset is still needed, and how the keyboard focus chain works.
- [ ] I can explain how `themeVars` reaches every classed screen and how I tested large text.
- [ ] I can trace validation → save → reload and list the five accessibility checks with results.

---

## Module Deliverable

The Personal Profile App has Profile, Edit Profile and Settings screens styled with NativeWind
utility classes over one token module; a native stack for the edit flow and bottom tabs for the two
peer destinations; typed route params; a working dark/light theme toggle; a validated edit form;
profile data that survives an app restart via AsyncStorage; and correct safe-area and keyboard
behaviour on both platforms. `docs/evidence/` holds the filled accessibility checklist and the
navigation, persistence, theme and platform evidence. The checklist is the same five-item list you
will reuse in M09 and the capstone.

---

## Appendix — Self-Check Answers

1. **Core components, bounded height and utilities.** Build the tree from `View` containers, `Text`
   for every string, `Image` for the avatar, `Pressable` for buttons, `TextInput` for fields,
   `ScrollView` for long content and `FlatList` for the facts list. Style static properties with
   classes such as `flex-1`, `gap-2`, `px-4` and `bg-background`. Only `Text` may render text. A
   `ScrollView` fills its parent, so the parent needs `flex-1` or a fixed height; without a bound
   the scroll view grows with its content and there is nothing to scroll.
2. **Typed stack, tabs and the JS theme.** Declare `RootStackParamList` (`Main`, `EditProfile`) and
   `MainTabParamList` (`ProfileTab`, `SettingsTab`) as type aliases, pass each to its
   `createXNavigator<T>()` call, and derive screen props with `NativeStackScreenProps` /
   `CompositeScreenProps`. Because `navigate` is checked against those keys, renaming `EditProfile`
   makes `npx tsc --noEmit` fail at the call site. React Navigation draws native bars through
   `headerStyle` / `tabBarStyle` and a `NavigationContainer` theme object; those are plain JS
   values, so we read them from the same `palette` in `tokens.ts`, not from `className`.
3. **Insets, keyboard and focus chain.** `SafeAreaProvider` measures platform insets; NativeWind's
   `pt-safe-offset-4` / `pb-safe-offset-6` turn them into padding that is recomputed when a window
   is resized or a foldable changes shape, while `useSafeAreaInsets()` supplies raw numbers for
   props such as `keyboardVerticalOffset`. `KeyboardAvoidingView` moves the form as the keyboard
   appears, `keyboardShouldPersistTaps="handled"` lets taps reach the next field,
   `returnKeyType="next"` plus `onSubmitEditing` moves focus through Name → Email → Phone → Bio
   using typed refs, and a **Done** action calls `Keyboard.dismiss()`.
4. **Theme and dynamic text.** NativeWind's `useColorScheme()` reports the scheme and
   `setColorScheme()` applies our chosen `system` / `light` / `dark` mode. The resolved `isDark`
   selects `themeVars(isDark)`, which sets the CSS variables used by `bg-background`, `text-text`
   and `border-border`, and also selects the JS palette for React Navigation. Expo needs
   `userInterfaceStyle: automatic` for the System option to follow the OS. Dynamic text is
   separate: fonts scale with the OS setting by default, so you must raise the OS text size (and
   add `maxFontSizeMultiplier` on tight rows) and re-check that nothing clips in either theme.
5. **Persistence and what the checklist proves.** `handleSave` calls the three validators, stops if
   any returns an error, then `saveProfile` JSON-serialises the trimmed profile under one
   AsyncStorage key. On returning to Profile, `useFocusEffect` calls `loadProfile`, which parses the
   value defensively and falls back to `emptyProfile` if it is missing or corrupt — so the data is
   still there after a force-quit and relaunch. The five-item checklist proves every control has a
   name and correct role/state, errors are announced, text scales and themes hold, and a screen
   reader can complete the flow; it does not prove performance, which M09 covers.
