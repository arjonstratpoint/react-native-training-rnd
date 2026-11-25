# M04 Write-Up — Core Components, Layout and Navigation

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

The Profile, Edit Profile and Settings screens, navigation between them, and the accessibility
checklist.

Worked-example links from this repo:

- Teaching guide: [`module-4-core-components-layout-navigation.md`](module-4-core-components-layout-navigation.md)
- Stage brief: [`brief.md`](brief.md) · checklist of record: [`tasks.md`](tasks.md)
- Reusable checklist: `PersonalProfileApp/docs/evidence/m04-accessibility-checklist.md` (created in the learner's local app; see the guide's Walkthrough 8).
- Architecture decisions: [`React Native Bare Workflow Curriculum — Solution Design.md`](../../docs/arch-docs/React%20Native%20Bare%20Workflow%20Curriculum%20—%20Solution%20Design.md)

In the learner's `PersonalProfileApp` the build is: `App.tsx` mounting `GestureHandlerRootView`,
`SafeAreaProvider` and `ThemeProvider`; `src/navigation/` holding the typed param lists, the native
stack (`Main`, `EditProfile`) and the two tabs (`ProfileTab`, `SettingsTab`); `src/theme/` holding
tokens and the theme context; `src/storage/profileStorage.ts` guarding AsyncStorage reads; and
`src/screens/` holding the three screens. Every screen reads its palette from context and its
padding from safe-area insets.

## Why it's built this way (key decisions)

- **Navigation — both, with a clear split.** The two top-level destinations (Profile, Settings)
  are tabs because they are peers and should be one tap apart. Edit Profile is a stack screen
  pushed from Profile because it is a task with an explicit back path: fill, validate, save,
  return. Putting it in the tabs would give it equal weight with the destinations and leave no
  natural "back to the profile" gesture. One `NavigationContainer` at the root, with the
  `GestureHandlerRootView` and `SafeAreaProvider` outside it, keeps a single source of navigation
  state. The param lists are `type` aliases passed into the navigator factories, so a renamed route
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

1. **Write the data shape and the guarded storage layer first.** Define `Profile` as `{ name, email,
   phone, bio }` and an `emptyProfile` constant. In `profileStorage.ts`, use one versioned key
   (`m04:profile:v1`), wrap `getItem` + `JSON.parse` in `try/catch`, and coerce each field to a
   string so a corrupt or old value falls back to `emptyProfile` instead of crashing a screen.
2. **Add the typed route before the UI.** Put `RootStackParamList` and `MainTabParamList` in
   `src/navigation/types.ts`, pass them to `createNativeStackNavigator<T>()` and
   `createBottomTabNavigator<T>()`, and derive `RootStackScreenProps<'EditProfile'>` with
   `NativeStackScreenProps`. Annotate the screen component with those props; `navigation.goBack()`
   then comes for free and `navigate('EditProfileTypo')` fails the type check.
3. **Create the screen file with the full command.** `cat > src/screens/EditProfileScreen.tsx <<
   'EOF' … EOF` with imports, the three validators, the component and the `StyleSheet` block. The
   guide's Walkthrough 5 has the complete copy-pasteable content; do not type a skeleton and "fill
   it in later" — the typed refs and keyboard props are the part that is easy to get wrong.
4. **Type the refs the Strict TypeScript API way.** `useRef<React.ComponentRef<typeof
   TextInput>>(null)` for Name, Email, Phone and Bio. Chain them with `returnKeyType="next"`,
   `blurOnSubmit={false}` and `onSubmitEditing={() => nextRef.current?.focus()}` so one keyboard
   can drive the whole form. No deep imports into `react-native/Libraries/…`.
5. **Wrap for the keyboard, pad for the safe area.** `KeyboardAvoidingView` with
   `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` outside a `ScrollView` with
   `keyboardShouldPersistTaps="handled"`; add `insets.top + 16` and `insets.bottom + 24` from
   `useSafeAreaInsets()` to the content padding. Add an explicit **Done with keyboard** button that
   calls `Keyboard.dismiss()` so the user is never trapped by the keyboard.
6. **Validate, save, return.** `handleSave` dismisses the keyboard, computes all three errors,
   bails if any is non-null, awaits `saveProfile` with trimmed values, then calls
   `navigation.goBack()`. Because Profile reloads in `useFocusEffect`, the new values appear as soon
   as you return — no global store needed.
7. **Prove it before moving on.** Run `npx tsc --noEmit`, then on each platform type a one-character
   name (error shown), a valid profile (saved), force-quit and relaunch (values still there), and
   finally enable VoiceOver/TalkBack and hear the label of every field and the save button.
8. **Only then build Settings and run the checklist.** The theme toggle and clear-data button are
   small once the context and storage module exist. Fill the five-row checklist with real results
   from the screen-reader pass and keep the file for M09.

## Concepts worth explaining

**Safe areas across different device shapes.** A phone screen is not a rectangle you can pad with a
magic constant. iOS reserves space for the status bar, dynamic island and home indicator; Android
draws edge-to-edge with cutouts and gesture navigation. `SafeAreaProvider` measures those insets
and `useSafeAreaInsets()` hands them to your components as numbers. The important part is that they
are *recomputed* when the window changes — a resizable iPhone window on iOS 27 or a foldable
changing shape — so the same `paddingTop: insets.top + 16` keeps working. Hard-coded padding looks
fine in one simulator and silently clips content in every other shape.

**What typed params change in a screen component.** A param list is a plain object type mapping
route names to the shape of their params. Passing it to the navigator factory tells TypeScript
which names exist and what each screen may receive. With screen props derived from
`NativeStackScreenProps` (and `CompositeScreenProps` for a tab screen that navigates into the
parent stack), a typo in `navigate`, a removed route or a missing param is a compile error. Without
it, the same mistake is a runtime error or a blank screen discovered during a demo. It is the same
reason we type refs with `ComponentRef` instead of `any`: the compiler checks the wiring before a
device does.

## What tripped me up

- **Android keyboard behaviour did not match iOS.** `behavior="padding"` looked right on the
  simulator but the field still hid on Android; switching to `behavior="height"` and tuning
  `keyboardVerticalOffset` with the header inset fixed it. Lesson: test the keyboard on both
  platforms, not just the one you find easier to run.
- **`ImageBackground` is gone and `InteractionManager` is removed.** I reached for both out of
  habit. An absolutely positioned `Image` inside a `View` replaces the first, and the `Keyboard`
  APIs plus layout events replace the second. The RN docs now mark the old component as deprecated
  in the component list, which was a useful confirmation.
- **VoiceOver is not in the simulator.** My first "screen-reader pass" was actually just Xcode's
  Accessibility Inspector. It found a control with no label, but it is not the same as a device. I
  noted the difference in the evidence rather than claiming a device pass I had not done.
- **The screen reader skipped a validation error.** The error `Text` existed but had no role, so it
  was not announced when the form was submitted. Adding `accessibilityRole="alert"` made it speak.
  This is exactly the kind of finding the checklist is for.
- **The theme toggle reset on restart.** Mode lives in the context's React state only; profile data
  persists, theme does not. I left it that way deliberately to keep the module in scope and wrote
  it down as a thing I would change.
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
- **Accessibility checklist passes:** `docs/evidence/m04-accessibility-checklist.md` has all five
  rows filled with PASS and notes from the run, including the alert-role fix above. The same file
  is the one to bring to M09 and the capstone.
- **Health checks:** `npx expo-doctor` reports no errors and `git status --short` shows only the
  intended source, dependency and evidence changes.

## What I'd do differently

If I started this module over, I would write the five accessibility checks as a habit *while*
building each screen rather than after all three exist — the unlabelled error text and the Android
keyboard offset would have been caught at the moment I wrote them. I would also persist the theme
mode next to the profile data from the start, since users read a toggle that resets on restart as a
bug. Finally, I would get a real device screen-reader pass booked early: the simulator taught me
the structure, but the device taught me what the flow actually sounds like.
