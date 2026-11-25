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

**Styling:** `StyleSheet` plus a small set of design tokens is the default. NativeWind is an
optional alternative only if your trainer confirms this cohort allows it; the checkpoint cares
that the screens meet it, not which styling approach you used.

By the end of this module your `PersonalProfileApp` will have three navigable screens, a working
theme toggle, a validated edit form, profile data that survives an app restart, and a written
accessibility checklist with your results.

---

## Learning Goals

By the end of this module you can:

1. Build a screen from core components (`View`, `Text`, `Image`, `ScrollView`, `Pressable`,
   `TextInput`, `FlatList`) and Flexbox layout with a small, consistent `StyleSheet` token set.
2. Set up typed stack and tab navigation with React Navigation and its native dependencies, and
   explain what each navigator owns.
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
`flex: 1` or a fixed height.

`FlatList` is virtualised, which matters when lists are long. For the three-row facts list here it
is used to teach the API, not for performance; M09 revisits the performance case at scale.

### Flexbox is the layout model, not CSS's full layout model

React Native's default `flexDirection` is **`column`**, not `row`. A child with `flex: 1` takes the
remaining space along the parent's main axis. `alignItems` works cross-axis, `justifyContent`
works main-axis, `gap` spaces children, and there is no float, grid or percentage-height magic
without a parent height. When something "looks wrong", first give the parent `flex: 1` and check
which axis you are aligning on.

Design tokens are just one small object of named values — colours, spacing and radii — consumed by
`StyleSheet.create`. One place to change a colour beats editing 20 style literals when dark mode
arrives.

### NativeWind, if your trainer allows it

NativeWind gives Tailwind-style utility classes (`className="flex-1 bg-white p-4"`) and removes a
lot of style boilerplate. It also adds a Babel/Metro config step and one more dependency to track
on every Expo SDK upgrade. `StyleSheet` has none of that cost and is the course default. Learn the
`StyleSheet` version first even if your cohort uses NativeWind, because the accessibility and
layout ideas are the same either way.

### Safe areas and window changes

iOS reserves the top of the screen for the status bar, dynamic island and home indicator; Android
can draw edge-to-edge with cutouts and a navigation bar. `SafeAreaProvider` from
`react-native-safe-area-context` measures those insets, and `useSafeAreaInsets()` gives you the
numbers to add as padding. Hard-coding a 44-pixel top padding breaks on a resizable iPhone window
(iOS 27) and on a foldable where the window changes size mid-session — insets are the correct
input because they are recomputed on change.

### Keyboard handling

When a `TextInput` is focused, the on-screen keyboard can cover the field. `KeyboardAvoidingView`
shifts or resizes content based on keyboard height; on iOS `behavior="padding"` is usually right,
while Android often needs `behavior="height"` or `undefined` with `keyboardVerticalOffset` tuned
for your header. A `ScrollView` with `keyboardShouldPersistTaps="handled"` lets a tap on another
field work instead of being swallowed by the first blur. Give the user an explicit way to dismiss
the keyboard (`Keyboard.dismiss()`), and set `returnKeyType`/`onSubmitEditing` so the Next key
moves focus down the form.

> API changes worth knowing: `InteractionManager` has been removed in this stack — do not reach
> for it; use the `Keyboard` APIs and layout events instead. `ImageBackground` is deprecated; put
> an `Image` absolutely positioned inside a `View` when you need a background image.

### Dark mode and dynamic text

`useColorScheme()` returns the system preference and updates when the user changes it. A theme
context holds the chosen mode (`system`, `light` or `dark`) and exposes a palette; screens read the
palette and never branch on platform. Dynamic text means leaving `allowFontScaling` on (the
default), using `maxFontSizeMultiplier` where a large font would break a tight row, and testing
with the OS text size turned up. A layout that only works at the default text size is not finished.

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

VoiceOver is not available in the iOS Simulator; use Xcode's Accessibility Inspector there and a
real device when you can. TalkBack can be enabled in an emulator's Accessibility settings.

---

## Read These

- `modules/m04-core-components-layout-navigation/brief.md` — Scope, Lab and Definition of done.
- `docs/arch-docs/React Native Bare Workflow Curriculum — Solution Design.md` — the Module 4 row in
  Curriculum and Module Mapping (the checkpoint and the reusable checklist), the accessibility row
  in Testing and Assessment Strategy, and the technology baseline table (React Navigation is a
  per-cohort pin).
- `modules/m03-ios-android-project-internals/module-3-ios-android-project-internals.md` — the
  `PersonalProfileApp` and its three EAS profiles are your starting point.
- `modules/m02-community-modules-native-linking/module-2-community-modules-native-linking.md` —
  where AsyncStorage and `react-native-safe-area-context` were installed and linked.
- React Navigation docs: [getting started](https://reactnavigation.org/docs/getting-started/),
  [native stack navigator](https://reactnavigation.org/docs/native-stack-navigator/),
  [bottom tabs](https://reactnavigation.org/docs/bottom-tab-navigator/) and
  [type checking with TypeScript](https://reactnavigation.org/docs/typescript/). The getting-started
  page also lists the Android native tweaks required by the pinned major — read them before
  assuming none are needed.
- React Native docs: [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview),
  [TextInput](https://reactnative.dev/docs/textinput),
  [FlatList](https://reactnative.dev/docs/flatlist) and
  [accessibility](https://reactnative.dev/docs/accessibility).
- Storage and insets:
  [AsyncStorage repository](https://github.com/react-native-async-storage/async-storage) and
  [react-native-safe-area-context](https://github.com/appandflow/react-native-safe-area-context).
- `docs/reference/module-6-express-basics.docx` is the stated primary format reference but is not
  present in this repo. The M01–M03 module guides supply the section pattern instead.

---

## Walkthrough

Do these in order. Each step has a **Check** that proves it worked before you move on. Every
`cat > … << 'EOF'` block writes a complete file — copy the whole block, including the closing
`EOF`.

### Walkthrough 1 — Lock the baseline and confirm the two cohort decisions

```bash
cd ~/Projects/PersonalProfileApp
node -v
npx expo-doctor
git status --short
ls -d ios android
```

**Check:** `node -v` prints `v24.x`; `ios` and `android` exist; `npx expo-doctor` reports no errors;
`git status` is clean or shows only intended M03 work. Before continuing, ask your trainer two
questions and write the answers into your notes:

1. Which React Navigation major is pinned for this cohort? (This guide was written for 7.x.)
2. Is NativeWind allowed in place of `StyleSheet` for this module?

If the answer to (2) is yes, follow your trainer's NativeWind setup and keep the same component and
accessibility structure — only the styling syntax changes. The walkthroughs below use `StyleSheet`.

---

### Walkthrough 2 — Install navigation packages and create the folder skeleton

M02 already installed AsyncStorage and `react-native-safe-area-context`. Install navigation and its
native dependencies with Expo's installer so you never hand-pick versions:

```bash
cd ~/Projects/PersonalProfileApp
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-gesture-handler
npx expo install expo-constants
mkdir -p src/navigation src/screens src/theme src/storage src/types docs/evidence
touch src/navigation/.gitkeep src/screens/.gitkeep src/theme/.gitkeep src/storage/.gitkeep src/types/.gitkeep docs/evidence/.gitkeep
npx expo-doctor
ls src
```

If your M02 install is missing either storage package, add it now with
`npx expo install @react-native-async-storage/async-storage react-native-safe-area-context`.

**Check:** `ls src` lists `navigation screens storage theme types`; `npx expo-doctor` reports no
errors. Read the "Installing dependencies" and Android notes on the React Navigation getting-started
page for the major your trainer pinned — some versions require a small `MainActivity` / manifest
change, and doing it now avoids a confusing crash later.

---

### Walkthrough 3 — Design tokens and a typed theme context

Create the token object first:

```bash
cd ~/Projects/PersonalProfileApp
cat > src/theme/tokens.ts << 'EOF'
export const tokens = {
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
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  radius: { sm: 6, md: 12 },
} as const;

export type Palette = typeof tokens.light;
EOF
```

Now the context. `mode` is explicit so a screen can offer "System / Light / Dark" later; `isDark`
resolves `system` against the OS preference:

```bash
cd ~/Projects/PersonalProfileApp
cat > src/theme/ThemeContext.tsx << 'EOF'
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, type Palette } from './tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  palette: Palette;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, palette: isDark ? tokens.dark : tokens.light, setMode }),
    [mode, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
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

**Check:** both files exist; `npx tsc --noEmit` reports no errors in them (other files are not
written yet, so a missing-module error for `./src/navigation/AppNavigator` later is expected until
Walkthrough 4).

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

Now the navigators. The stack owns the Edit Profile flow; the tabs own the two peer destinations:

```bash
cd ~/Projects/PersonalProfileApp
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

Finally, wire the providers at the root. The gesture-handler import must be the first line:

```bash
cd ~/Projects/PersonalProfileApp
cat > App.tsx << 'EOF'
import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
EOF
```

**Check:** if your project's entry file is `index.js` rather than `App.tsx`, put the
`import 'react-native-gesture-handler';` line at the top of that file instead. Confirm the app
launches after all three screen files exist (next two walkthroughs); until then, unresolved screen
imports are expected.

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
safe-area insets for top padding, and demonstrates `Image`, `FlatList` and `Pressable`:

```bash
cd ~/Projects/PersonalProfileApp
cat > src/screens/ProfileScreen.tsx << 'EOF'
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { loadProfile } from '../storage/profileStorage';
import { emptyProfile, type Profile } from '../types/profile';

const facts = [
  { id: 'framework', label: 'Framework', value: 'React Native 0.88' },
  { id: 'navigation', label: 'Navigation', value: 'Typed stack + tabs' },
  { id: 'storage', label: 'Storage', value: 'AsyncStorage' },
];

export function ProfileScreen({ navigation }: MainTabScreenProps<'ProfileTab'>) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
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
      style={styles.fill}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          backgroundColor: palette.background,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require('../../assets/icon-prod.png')}
        style={styles.avatar}
        accessibilityRole="image"
        accessibilityLabel="Profile avatar"
      />
      <Text accessibilityRole="header" style={[styles.name, { color: palette.text }]}>
        {profile.name || 'Your name'}
      </Text>
      <Text style={[styles.line, { color: palette.textMuted }]}>
        {profile.email || 'Add an email in Edit profile'}
      </Text>
      <Text style={[styles.line, { color: palette.textMuted }]}>
        {profile.phone || 'Add a phone number in Edit profile'}
      </Text>

      <Pressable
        onPress={() => navigation.navigate('EditProfile')}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        accessibilityHint="Opens the edit profile form"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: palette.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>Edit profile</Text>
      </Pressable>

      <FlatList
        data={facts}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: palette.border }]}>
            <Text style={{ color: palette.textMuted }}>{item.label}</Text>
            <Text style={{ color: palette.text }}>{item.value}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignSelf: 'center' },
  name: { fontSize: 24, fontWeight: '700', marginTop: 12 },
  line: { fontSize: 16 },
  button: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
});
EOF
```

`require('../../assets/icon-prod.png')` is the M03 production icon. If you do not have it, copy
any PNG to `assets/icon-prod.png` first. `accessibilityRole="header"` on the name makes the screen
readable as a structure, not a wall of text.

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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
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
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
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
    setSaved(true);
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        style={styles.fill}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          backgroundColor: palette.background,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text accessibilityRole="header" style={[styles.header, { color: palette.text }]}>
          Edit profile
        </Text>

        <Text style={[styles.label, { color: palette.text }]}>Name</Text>
        <TextInput
          ref={nameRef}
          value={profile.name}
          onChangeText={(value) => update('name', value)}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => emailRef.current?.focus()}
          accessibilityLabel="Name"
          accessibilityHint="Between 2 and 40 characters"
          style={[styles.input, { borderColor: palette.border, color: palette.text, backgroundColor: palette.surface }]}
        />
        {errors.name ? <Text accessibilityRole="alert" style={{ color: palette.danger }}>{errors.name}</Text> : null}

        <Text style={[styles.label, { color: palette.text }]}>Email</Text>
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
          style={[styles.input, { borderColor: palette.border, color: palette.text, backgroundColor: palette.surface }]}
        />
        {errors.email ? <Text accessibilityRole="alert" style={{ color: palette.danger }}>{errors.email}</Text> : null}

        <Text style={[styles.label, { color: palette.text }]}>Phone</Text>
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
          style={[styles.input, { borderColor: palette.border, color: palette.text, backgroundColor: palette.surface }]}
        />
        {errors.phone ? <Text accessibilityRole="alert" style={{ color: palette.danger }}>{errors.phone}</Text> : null}

        <Text style={[styles.label, { color: palette.text }]}>Bio</Text>
        <TextInput
          ref={bioRef}
          value={profile.bio}
          onChangeText={(value) => update('bio', value)}
          multiline
          maxFontSizeMultiplier={1.5}
          accessibilityLabel="Bio"
          style={[styles.input, styles.bio, { borderColor: palette.border, color: palette.text, backgroundColor: palette.surface }]}
        />

        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save profile"
          accessibilityHint="Validates the form, saves it, and returns to the profile"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: palette.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>Save profile</Text>
        </Pressable>

        <Pressable
          onPress={() => Keyboard.dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Dismiss keyboard"
          style={styles.dismiss}
        >
          <Text style={{ color: palette.textMuted }}>Done with keyboard</Text>
        </Pressable>

        {saved ? (
          <Text accessibilityRole="alert" style={{ color: palette.text }}>
            Saved.
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  bio: { minHeight: 88, textAlignVertical: 'top' },
  button: { marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  dismiss: { paddingVertical: 12, alignItems: 'center' },
});
EOF
```

**Check:** `npx tsc --noEmit` reports no errors. The three validators are deliberately simple and
testable: name 2–40 trimmed characters, a basic email shape, and 7–15 digits after stripping
punctuation. Write down one input each validator accepts and one it rejects; you will need them
for Exercise 3 and for the write-up.

---

### Walkthrough 6 — Settings screen: theme toggle, version line, clear data

```bash
cd ~/Projects/PersonalProfileApp
cat > src/screens/SettingsScreen.tsx << 'EOF'
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/types';
import { useTheme, type ThemeMode } from '../theme/ThemeContext';
import { clearProfile } from '../storage/profileStorage';

const modes: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function SettingsScreen({}: MainTabScreenProps<'SettingsTab'>) {
  const { palette, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
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
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
        backgroundColor: palette.background,
      }}
    >
      <Text accessibilityRole="header" style={[styles.header, { color: palette.text }]}>
        Settings
      </Text>

      <Text style={[styles.label, { color: palette.text }]}>Theme</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Theme" style={styles.segment}>
        {modes.map((item) => {
          const selected = item.value === mode;
          return (
            <Pressable
              key={item.value}
              onPress={() => setMode(item.value)}
              accessibilityRole="radio"
              accessibilityLabel={`${item.label} theme`}
              accessibilityState={{ checked: selected }}
              style={[
                styles.segmentItem,
                { backgroundColor: selected ? palette.primary : palette.surface },
              ]}
            >
              <Text style={{ color: selected ? '#FFFFFF' : palette.text }}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.row, { borderColor: palette.border }]}>
        <Text style={{ color: palette.textMuted }}>App version</Text>
        <Text accessibilityLabel={`App version ${version}`} style={{ color: palette.text }}>
          {version}
        </Text>
      </View>

      <Pressable
        onPress={confirmClear}
        accessibilityRole="button"
        accessibilityLabel="Clear all data"
        accessibilityHint="Removes the saved profile after confirmation"
        style={({ pressed }) => [
          styles.danger,
          { borderColor: palette.danger, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={{ color: palette.danger, fontWeight: '600' }}>Clear all data</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  segment: { flexDirection: 'row', gap: 8 },
  segmentItem: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  danger: { marginTop: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
});
EOF
npx tsc --noEmit
```

**Check:** `npx tsc --noEmit` passes; the app launches with two tabs and an Edit Profile screen in
the stack. Tapping **Dark** in Settings changes every screen immediately — that is the palette
context doing its job. Tapping **Clear all data** asks for confirmation before touching storage.

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
3. **Window changes:** resize an iPhone window (iOS 27) or run a foldable AVD, then rotate or
   change the window and confirm the content re-pads instead of sitting under a cutout. On Android
   you can approximate a size change from the shell:

```bash
adb shell wm size
adb shell wm size 720x1280
adb shell wm size reset
```

**Check:** the keyboard never covers the active field, no content is obscured by insets, and a
window-size change reflows the layout without a restart. Record what you observed in your notes —
these observations become the write-up's "What tripped me up" and checkpoint evidence.

---

### Walkthrough 8 — Run the accessibility pass and write the checklist

Enable the screen reader and walk all three screens in this order: Profile → Edit Profile →
Settings. VoiceOver: Settings → General → Accessibility → VoiceOver on a device; Xcode's
Accessibility Inspector in the simulator. TalkBack: Settings → Accessibility → TalkBack in the
emulator (the RN docs give the exact commands).

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
npx tsc --noEmit
git status --short
ls -1 docs/evidence
```

**Check:** `npx expo-doctor` reports no errors; `npx tsc --noEmit` passes; `git status` shows the
intended `src/`, `App.tsx`, `expo-constants` dependency change and `docs/evidence/` only. Capture
and keep:

- a screenshot or short recording of Profile → Edit Profile → Settings navigation on **each**
  platform,
- a before/after pair showing profile data still present after a force-quit and relaunch,
- the filled `docs/evidence/m04-accessibility-checklist.md` from Walkthrough 8.

---

## What This Walkthrough Showed You

- How seven core components plus Flexbox and a token object produce a real three-screen UI.
- How a stack and two tabs split responsibilities, and how one `RootStackParamList` makes screen
  names and params compile-time checked.
- How `SafeAreaProvider` + insets, `KeyboardAvoidingView`, return-key focus chaining and a
  dismiss action keep a form usable across devices and window shapes.
- How a theme context backed by `useColorScheme` switches the whole app's palette, and why text
  scaling needs its own test.
- How a guarded AsyncStorage module gives restart-persistent data without letting corrupt values
  crash a screen.
- How to run a five-item accessibility checklist with a screen reader and keep the result for
  later modules.

---

## EXERCISEs

1. **Break a route name on purpose.** In ProfileScreen change `navigation.navigate('EditProfile')`
   to `navigation.navigate('EditProfileTypo')`, run `npx tsc --noEmit`, and write down the exact
   error. Restore the name and confirm the error disappears. This is the payoff of typed params.
2. **Change one token.** In `tokens.ts` change `light.primary` and `dark.primary`, relaunch, and
   confirm every themed surface follows. Explain why no screen file needed editing.
3. **Attack the validators.** Submit each of these and record what happens: a one-character name, a
   name over 40 characters, `name@example`, `12345`, and `(555) 010-1234`. Then add one rule of your
   own (for example, reject a bio over 280 characters) and prove it with an input.
4. **Force a storage failure.** Use
   `npx expo run:android` / `npx expo run:ios` logs or a one-off
   `AsyncStorage.setItem('m04:profile:v1', 'not-json')` in a scratch screen to corrupt the value,
   relaunch, and confirm `loadProfile` falls back to `emptyProfile` instead of crashing. Restore a
   valid value afterwards.
5. **Dark mode surprise hunt.** With **System** selected, switch the OS appearance while the app is
   in the foreground. Then force Light and repeat. Note any screen that does not follow, and say
   which palette lookup it missed.
6. **Screen-reader sweep.** With VoiceOver or TalkBack on, complete the whole flow from Profile to
   a successful save and back. Note every element whose spoken name is unclear, then fix it with
   `accessibilityLabel` and re-run the sweep.
7. **Window shape.** On a resized iPhone window or foldable emulator, take a screenshot in each
   window state and confirm the safe-area padding changes. Explain in two sentences why a fixed
   top padding would fail here.

---

## Self-Check

Answer these in your own words before checking the Appendix.

1. Walk through building a screen from core components and Flexbox, and explain why the parent needs
   a bounded height before a `ScrollView` can scroll.
2. Describe how you would set up a stack plus two tabs so that screen names and params are
   type-checked, and explain what breaks at compile time if a route is renamed.
3. Explain how safe-area insets, `KeyboardAvoidingView` and a focus chain keep the Edit Profile form
   usable when the keyboard opens and when the window changes shape.
4. Describe how a theme context plus `useColorScheme` produces dark mode, and why dynamic text needs
   a separate check even when the palette is correct.
5. Trace a profile value from the Edit Profile form through validation into AsyncStorage and back
   onto the Profile screen after a restart, and explain what the accessibility checklist proves
   about that flow.

### Understanding Checklist

- [ ] I can name the seven core components used here and state the one rule about `Text` and the
      one rule about `ScrollView` height.
- [ ] I can explain which navigator owns which screens and how the param list types a `navigate`
      call.
- [ ] I can say where top and bottom padding come from and how the keyboard focus chain works.
- [ ] I can explain how the palette reaches every screen and how I tested large text.
- [ ] I can trace validation → save → reload and list the five accessibility checks with results.

---

## Module Deliverable

The Personal Profile App has Profile, Edit Profile and Settings screens; a native stack for the
edit flow and bottom tabs for the two peer destinations; typed route params; a working dark/light
theme toggle; a validated edit form; profile data that survives an app restart via AsyncStorage;
and correct safe-area and keyboard behaviour on both platforms. `docs/evidence/` holds the filled
accessibility checklist and the navigation, persistence and platform evidence. The checklist is the
same five-item list you will reuse in M09 and the capstone.

---

## Appendix — Self-Check Answers

1. **Core components and bounded height.** Build the tree from `View` containers, `Text` for every
   string, `Image` for the avatar, `Pressable` for buttons, `TextInput` for fields, `ScrollView` for
   long content and `FlatList` for the facts list, styling it with `StyleSheet.create` values drawn
   from one token object. Only `Text` may render text. A `ScrollView` fills its parent, so the
   parent needs `flex: 1` or a fixed height; without a bound the scroll view grows with its content
   and there is nothing to scroll.

2. **Typed stack, tabs and compile-time failure.** Declare `RootStackParamList` (`Main`,
   `EditProfile`) and `MainTabParamList` (`ProfileTab`, `SettingsTab`) as type aliases, pass each to
   its `createXNavigator<T>()` call, and derive screen props with `NativeStackScreenProps` /
   `CompositeScreenProps`. Because `navigate` is checked against those keys, renaming `EditProfile`
   makes `npx tsc --noEmit` fail at the call site — before the user ever reaches that screen.

3. **Insets, keyboard and focus chain.** `SafeAreaProvider` measures platform insets and
   `useSafeAreaInsets()` supplies `top` and `bottom`, which become padding; they are recomputed when
   a window is resized or a foldable changes shape, unlike a hard-coded constant.
   `KeyboardAvoidingView` moves the form as the keyboard appears, `keyboardShouldPersistTaps="handled"`
   lets taps reach the next field, `returnKeyType="next"` plus `onSubmitEditing` moves focus through
   Name → Email → Phone → Bio using typed refs, and a **Done** action calls `Keyboard.dismiss()`.

4. **Theme and dynamic text.** `useColorScheme()` reports the system preference; the theme context
   resolves `system`/`light`/`dark` into `isDark`, picks `tokens.light` or `tokens.dark`, and
   re-renders every consumer. Screens never branch on platform. Dynamic text is separate: fonts
   scale with the OS setting by default, so you must raise the OS text size (and add
   `maxFontSizeMultiplier` on tight rows) and re-check that nothing clips in either theme.

5. **Persistence and what the checklist proves.** `handleSave` calls the three validators, stops if
   any returns an error, then `saveProfile` JSON-serialises the trimmed profile under one
   AsyncStorage key. On returning to Profile, `useFocusEffect` calls `loadProfile`, which parses the
   value defensively and falls back to `emptyProfile` if it is missing or corrupt — so the data is
   still there after a force-quit and relaunch. The five-item checklist proves every control has a
   name and correct role/state, errors are announced, text scales and themes hold, and a screen
   reader can complete the flow; it does not prove performance, which M09 covers.
