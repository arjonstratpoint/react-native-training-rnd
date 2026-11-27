# M04 Write-Up — Core Components, Layout and Navigation

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

The Profile, Edit Profile and Settings screens, navigation between them, and the accessibility
checklist. This cohort styled the screens with **NativeWind** utility classes instead of
`StyleSheet`, with one token module feeding both Tailwind CSS variables and React Navigation's JS
theme.

Worked-example links from this repo:

- Teaching guide: [`module-4-core-components-layout-navigation.md`](module-4-core-components-layout-navigation.md)
- Stage brief: [`brief.md`](brief.md) · checklist of record: [`tasks.md`](tasks.md)
- Architecture decisions: [`React Native Bare Workflow Curriculum — Solution Design.md`](../../docs/arch-docs/React%20Native%20Bare%20Workflow%20Curriculum%20—%20Solution%20Design.md)

In the learner's `PersonalProfileApp` the build is: `App.tsx` importing `global.css` and mounting
`GestureHandlerRootView`, `SafeAreaProvider` and `ThemeProvider`; the NativeWind config files
(`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`
and `app.json`'s `userInterfaceStyle: automatic`); `src/navigation/` holding the typed param lists,
the native stack (`Main`, `EditProfile`) and the two tabs (`ProfileTab`, `SettingsTab`);
`src/theme/tokens.ts` holding the one colour source and `themeVars()`; `src/theme/ThemeContext.tsx`
bridging NativeWind's `useColorScheme()` with our mode state; `src/storage/profileStorage.ts`
guarding AsyncStorage reads; and `src/screens/` holding the three screens. Every screen uses
`className` utilities, `pt-safe-offset-4` / `pb-safe-offset-6` for padding, and keeps plain `style`
only for dynamic numbers and native navigation bars.

The reusable checklist is created in the learner app at
`PersonalProfileApp/docs/evidence/m04-accessibility-checklist.md` (see the guide's Walkthrough 8);
it lives outside this repo, so it is named as a path rather than linked.

## Why it's built this way (key decisions)

- **NativeWind over `StyleSheet`, with explicit boundaries.** The utility classes keep static
  styling next to each element and remove the style block at the bottom of every screen. The cost
  is a Babel preset, a Metro wrapper, a global CSS entry and one dependency to track on every Expo
  SDK upgrade; I accepted that cost knowingly and used `npx expo install` so Expo, not me, picks
  native-compatible versions. I did not pretend `className` covers everything: dynamic numbers
  (safe-area offsets passed to props, pressed opacity, `textAlignVertical`) use the `style` prop,
  React Navigation's native bars use JS style objects and a JS theme, and `GestureHandlerRootView`
  keeps an inline `style={{ flex: 1 }}` because third-party views may not forward `className`.
  Two consumers, one token source — `src/theme/tokens.ts` defines the colours, `themeVars()`
  exposes them as CSS variables for classes such as `bg-primary`, and `paletteFor()` hands the same
  values to React Navigation. This matters for the dark-mode test: a screen can look right while
  the native header stays light, and that would fail the checkpoint.
- **Navigation — both, with a clear split.** The two top-level destinations (Profile, Settings)
  are tabs because they are peers and should be one tap apart. Edit Profile is a stack screen
  pushed from Profile because it is a task with an explicit back path: fill, validate, save,
  return. Putting it in the tabs would give it equal weight with the destinations and leave no
  natural "back to the profile" gesture. One `NavigationContainer` at the root, with the
  gesture-handler and safe-area providers outside it, keeps a single source of navigation state.
  The param lists are `type` aliases passed into the navigator factories, so a renamed route
  fails `npx tsc --noEmit` instead of failing on a device.
- **Validation — three small pure functions, run on submit.** `nameError` trims and checks 2–40
  characters; `emailError` checks a basic `local@domain.tld` shape; `phoneError` strips everything
  that is not a digit and requires 7–15 digits. I kept them as standalone functions returning
  `string | null` rather than stateful side effects, so I can hand them inputs from Exercise 3 and
  see the exact decision. I trust the rules because each one is testable in one line and rejects
  the cases the checkpoint names — not because a library produced a reassuring message. Errors
  render with `accessibilityRole="alert"` so a screen reader announces them.
- **Accessibility checklist — five items that catch this module's real failures.** Every
  actionable element has a name; roles and states are correct (`button`, `image`, `radiogroup` /
  `radio` with `accessibilityState.checked`); errors are announced; text scales and both themes
  stay readable; and a VoiceOver/TalkBack pass reaches and activates every control. Labels and
  roles catch icon-only or unlabelled controls. The dynamic-type and theme row catches the layout
  breakage that only appears at large font sizes. The screen-reader row is last because it is the
  only check that proves the whole flow is usable, not just individually correct. I kept it short
  so it is realistic to repeat in M09 and the capstone.

## How to build it (teach it to the next trainee)

Here is the worked example using **Edit Profile**, the screen with the most moving parts.

1. **Install and configure NativeWind before writing any screens.** Use
   `npx expo install nativewind@4.2.7 react-native-reanimated react-native-worklets react-native-safe-area-context` and
   `npx expo install --dev tailwindcss@^3.4.17`, run `npx expo install babel-preset-expo` for the
   Babel config, then create `global.css` (three `@tailwind`
   directives), `nativewind-env.d.ts` (the triple-slash reference plus `declare module '*.css';` so
   `import './global.css';` type-checks), `tailwind.config.js` (content globs, `nativewind/preset`,
   semantic colours as `rgb(var(--color-…) / <alpha-value>)`),
   `babel.config.js` (the `nativewind/babel` preset) and `metro.config.js` (`withNativeWind`). Set
   `userInterfaceStyle: automatic` in `app.json` and prove the setup with a temporary
   `className`-styled `App.tsx` before building anything else. Merge into existing configs rather
   than deleting earlier presets. `react-native-worklets` is in that same install command because
   the Reanimated version Expo resolves for SDK 58 requires it as a companion package.
2. **Write the data shape and the guarded storage layer first.** Define `Profile` as `{ name, email,
   phone, bio }` and an `emptyProfile` constant. In `profileStorage.ts`, use one versioned key
   (`m04:profile:v1`), wrap `getItem` + `JSON.parse` in `try/catch`, and coerce each field to a
   string so a corrupt or old value falls back to `emptyProfile` instead of crashing a screen.
3. **Define tokens once, then wire the theme bridge.** In `src/theme/tokens.ts` put the light/dark
   colour objects, `paletteFor(isDark)` and `themeVars(isDark)` (which converts each hex to a
   CSS-variable triplet). In `ThemeContext.tsx`, keep `mode` state, push it into NativeWind's
   `setColorScheme(mode)`, resolve `isDark`, and apply `themeVars(isDark)` as a `style` on the
   wrapper `View` around `children`.
4. **Add the typed route before the UI.** Put `RootStackParamList` and `MainTabParamList` in
   `src/navigation/types.ts`, pass them to `createNativeStackNavigator<T>()` and
   `createBottomTabNavigator<T>()`, and derive `RootStackScreenProps<'EditProfile'>` with
   `NativeStackScreenProps`. Annotate the screen component with those props; `navigation.goBack()`
   then comes for free and `navigate('EditProfileTypo')` fails the type check. Remember that
   `headerStyle`, `tabBarStyle` and the `NavigationContainer` theme are still JS objects built from
   `palette`.
5. **Create the screen file with the full command.** `cat > src/screens/EditProfileScreen.tsx <<
   'EOF' … EOF` with imports, the three validators, the component and the utility classes. The
   guide's Walkthrough 5 has the complete copy-pasteable content; do not type a skeleton and "fill
   it in later" — the typed refs, focus chaining and keyboard props are the part that is easy to
   get wrong.
6. **Type the refs the Strict TypeScript API way.** `useRef<React.ComponentRef<typeof
   TextInput>>(null)` for Name, Email, Phone and Bio. Chain them with `returnKeyType="next"`,
   `blurOnSubmit={false}` and `onSubmitEditing={() => nextRef.current?.focus()}` so one keyboard
   can drive the whole form. No deep imports into `react-native/Libraries/…`.
7. **Wrap for the keyboard, pad for the safe area, and keep the few `style` uses.** Use
   `className="flex-1"` on `KeyboardAvoidingView` with
   `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` and
   `keyboardVerticalOffset={insets.top}`; on the `ScrollView` use
   `contentContainerClassName="px-4 pt-safe-offset-4 pb-safe-offset-6 bg-background"` and
   `keyboardShouldPersistTaps="handled"`. Keep `style` for `textAlignVertical: 'top'` and pressed
   opacity, and add an explicit **Done with keyboard** button that calls `Keyboard.dismiss()`.
8. **Validate, save, prove, then build Settings.** `handleSave` dismisses the keyboard, computes
   all three errors, bails if any is non-null, awaits `saveProfile` with trimmed values, then calls
   `navigation.goBack()`. Run `npx tsc --noEmit`, then on each platform type a one-character name
   (error shown), a valid profile (saved), force-quit and relaunch (values still there), and enable
   VoiceOver/TalkBack to hear every label. Only then add the theme toggle, version line and
   clear-data button, and fill the five-row checklist with real results.

## Concepts worth explaining

**What NativeWind trades against `StyleSheet`.** Utilities such as `flex-1`, `gap-2`,
`bg-background` and `pt-safe-offset-4` keep styling at the point of use and make a small token set
enforceable through classes. The trade is setup and upgrade cost: a Babel preset, a Metro wrapper,
a global CSS file, a type reference and a dependency that must stay compatible with the pinned Expo
SDK. The stable v4 line uses Tailwind CSS v3 — v5 is an RC and not for this cohort. More importantly,
NativeWind is not a total replacement for style objects: dynamic numbers and third-party native
views still need `style`, and React Navigation's native bars are configured with JS objects. Knowing
those boundaries in advance is the difference between a clean module and a day of guessing why a
class "did nothing".

**Safe areas across different device shapes.** A phone screen is not a rectangle you can pad with a
magic constant. iOS reserves space for the status bar, dynamic island and home indicator; Android
draws edge-to-edge with cutouts and gesture navigation. `SafeAreaProvider` measures those insets,
and NativeWind exposes them as `pt-safe-offset-4` / `pb-safe-offset-6` utilities. The important part
is that they are *recomputed* when the window changes — a resizable iPhone window on iOS 27 or a
foldable changing shape — so the same classes keep working, while `useSafeAreaInsets()` still gives
raw numbers for props like `keyboardVerticalOffset`. Hard-coded padding looks fine in one simulator
and silently clips content in every other shape.

## What tripped me up

- **The first render looked completely unstyled.** I had written the classes but forgotten
  `import './global.css';` in `App.tsx`. A cache-cleared restart (`npx expo start -c`) fixed the
  config changes; forgetting the import would have been invisible without the smoke test in
  Walkthrough 2. Lesson: prove NativeWind with one trivial styled screen before building three real
  ones.
- **Dark mode changed the screens but not the header.** `bg-background` followed the CSS variables,
  but React Navigation's `headerStyle` still used a value I had hard-coded. Reading both from
  `paletteFor(isDark)` in `ThemeContext` fixed it. This is why the hybrid boundary matters.
- **`className` did not work on `GestureHandlerRootView`.** It is a third-party native view and may
  not forward unknown props. Keeping `style={{ flex: 1 }}` there is not a missed conversion; it is
  the documented limitation.
- **Android keyboard behaviour did not match iOS.** `behavior="padding"` looked right on the
  simulator but the field still hid on Android; switching to `behavior="height"` and tuning
  `keyboardVerticalOffset` with the header inset fixed it. Lesson: test the keyboard on both
  platforms, not just the one you find easier to run.
- **`ImageBackground` is gone and `InteractionManager` is removed.** I reached for both out of
  habit. An absolutely positioned `Image` inside a `View` replaces the first, and the `Keyboard`
  APIs plus layout events replace the second.
- **VoiceOver is not in the simulator.** My first "screen-reader pass" was actually just Xcode's
  Accessibility Inspector. It found a control with no label, but it is not the same as a device. I
  noted the difference in the evidence rather than claiming a device pass I had not done.
- **The screen reader skipped a validation error.** The error `Text` existed but had no role, so it
  was not announced when the form was submitted. Adding `accessibilityRole="alert"` made it speak.
  This is exactly the kind of finding the checklist is for.
- **The theme toggle reset on restart.** Mode lives in React state only; profile data persists,
  theme does not. I left it that way deliberately to keep the module in scope and wrote it down as
  a thing I would change.
- **AsyncStorage docs drift.** The maintained docs URL used in M02 is the GitHub repository; the
  current README shows a `createAsyncStorage` factory alongside the default-export API M02 used.
  I kept the SDK 58-pinned API and recorded the difference so the next cohort is not surprised.

## Checkpoint evidence

- **Data survives a restart:** saved `Ada Lovelace / ada@example.com / (555) 010-1234` in Edit
  Profile, returned to Profile, force-quit the app from each platform's app switcher, relaunched,
  and all three values were still on the Profile screen. Screenshot pair kept in
  `docs/evidence/` of the learner app.
- **Navigation works on both platforms:** recorded Profile → Edit Profile → Save → Profile and
  Profile ↔ Settings on an iOS simulator and an Android emulator; both back gestures and tab
  switches behaved, and the typed route names compiled with `npx tsc --noEmit`.
- **NativeWind setup holds:** `npx expo-doctor` reports no errors and
  `npx expo install --check` reports no version mismatches for the resolved NativeWind / Tailwind
  set; the light/dark screenshot pair shows classed screens and native bars changing together.
- **Accessibility checklist passes:** `docs/evidence/m04-accessibility-checklist.md` has all five
  rows filled with PASS and notes from the run, including the alert-role fix above. The same file
  is the one to bring to M09 and the capstone.

## What I'd do differently

If I started this module over, I would confirm NativeWind's SDK 58 compatibility and the exact
resolved versions on Day 1 rather than discovering config drift while writing the third screen. I
would write the five accessibility checks as a habit *while* building each screen rather than after
all three exist — the unlabelled error text and the Android keyboard offset would have been caught
at the moment I wrote them. I would also persist the theme mode next to the profile data from the
start, since users read a toggle that resets on restart as a bug. Finally, I would get a real device
screen-reader pass booked early: the simulator taught me the structure, but the device taught me
what the flow actually sounds like.
