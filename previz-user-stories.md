# Pre-Viz Engine — User Stories

**App:** Pre-Viz Engine v1.9.0
**Date:** 2026-03-16

---

## Personas

| Persona | Description |
|---|---|
| **Director** | Film/video director who needs to quickly visualize scenes before committing to a physical shoot |
| **Screenwriter** | Writer who wants to visually validate how scripted scenes might look |
| **Producer** | Production professional reviewing multiple shot options for planning purposes |
| **Creative Team Member** | Any collaborator browsing previously generated assets |

---

## Epic 1: Direct Video Generation (Studio)

### US-01 — Generate a video from a direct prompt
**As a** Director,
**I want to** type a detailed scene description and generate a video directly,
**so that** I can immediately visualize a shot concept without modifying my creative intent.

**Acceptance Criteria:**
- [ ] User can type a free-text prompt in the "Direct Prompt for Sora" textarea
- [ ] The prompt is submitted unmodified to Sora (no AI enhancement)
- [ ] A "Generate Videos" button triggers the generation
- [ ] Generated video(s) appear upon completion

---

### US-02 — Generate multiple video variations simultaneously
**As a** Director,
**I want to** generate up to 5 videos from the same prompt at once,
**so that** I can compare variations and choose the best result.

**Acceptance Criteria:**
- [ ] "Number of Videos to Generate" field accepts values from 1 to 5
- [ ] Default value is 3
- [ ] All requested videos are generated in parallel from the same prompt
- [ ] The generate button label reflects the chosen count (e.g., "Generate 3 Videos Directly")
- [ ] All results are visible upon completion

---

### US-03 — Select video duration
**As a** Director,
**I want to** choose how long each generated video clip will be,
**so that** I can match the clip length to the intended scene timing.

**Acceptance Criteria:**
- [ ] Duration options are: 4 seconds, 8 seconds, 12 seconds
- [ ] Selected duration applies to all generated videos in the batch
- [ ] Duration selection is available on both Studio and Stock Footage pages

---

### US-04 — Choose video aspect ratio
**As a** Director,
**I want to** select Landscape or Portrait orientation for my generated video,
**so that** the output matches the intended screen format (cinema, mobile, etc.).

**Acceptance Criteria:**
- [ ] Aspect Ratio options are: Landscape, Portrait
- [ ] Selected ratio applies to all videos in the generation batch
- [ ] Default on Studio is Landscape; default on Stock Footage is Portrait

---

### US-05 — Enable High Quality Mode for finer output
**As a** Producer,
**I want to** toggle High Quality Mode before generating videos,
**so that** I get higher-fidelity output for presentation-ready previews.

**Acceptance Criteria:**
- [ ] High Quality Mode is a toggle (on/off), default off
- [ ] When enabled on Stock Footage, a warning is shown: "High quality mode can take 3x longer to generate"
- [ ] High Quality Mode applies to all videos in the batch

---

## Epic 2: Script-Based Shot Generation (Stock Footage)

### US-06 — Parse a script to extract individual shots
**As a** Screenwriter,
**I want to** paste my full script into the tool and have it automatically extract individual shots,
**so that** I can generate videos for each scene without manually isolating each prompt.

**Acceptance Criteria:**
- [ ] A large textarea is available to paste the full script
- [ ] Clicking "Parse Script" triggers AI-based parsing
- [ ] The system identifies and separates individual shots/scenes from the script
- [ ] Each extracted shot is queued for video generation

---

### US-07 — Generate videos for all extracted script shots
**As a** Director,
**I want to** automatically generate a video for each shot extracted from my script,
**so that** I get a full visual storyboard of my script in one workflow.

**Acceptance Criteria:**
- [ ] After parsing, all extracted shots are sent to Sora for generation
- [ ] Video generation settings (duration, aspect ratio, quality) apply to all shots
- [ ] Generated videos are associated with their corresponding script shot

---

### US-08 — Configure generation settings before parsing a script
**As a** Producer,
**I want to** set the video duration, aspect ratio, and quality before clicking "Parse Script",
**so that** all generated shots match the format required for the presentation.

**Acceptance Criteria:**
- [ ] Duration, Aspect Ratio, and High Quality Mode controls are accessible on the Stock Footage page
- [ ] Settings are applied before submission
- [ ] Warning message is shown if High Quality Mode is enabled

---

## Epic 3: Video History & Review

### US-09 — View my previously generated videos
**As a** Director,
**I want to** view a list of all videos I have previously generated,
**so that** I can revisit and review my past pre-visualizations without regenerating them.

**Acceptance Criteria:**
- [ ] "Your Videos" tab shows only videos tied to the current browser's cookie ID
- [ ] Each video card shows: status, generation time, timestamp, prompt, aspect ratio, duration, quality mode
- [ ] Empty state message shown when no videos have been generated yet
- [ ] Empty state includes a call-to-action directing the user to the Studio

---

### US-10 — Browse all community-generated videos
**As a** Creative Team Member,
**I want to** browse all videos generated by any user,
**so that** I can get inspiration, review what the tool produces, and assess generation quality.

**Acceptance Criteria:**
- [ ] "All Videos" tab shows all videos from all users
- [ ] Total video count is displayed (e.g., "4370 videos")
- [ ] Each video card shows: status, generation duration, prompt, settings, and cookie ID
- [ ] Videos are listed in reverse-chronological order (most recent first)

---

### US-11 — Identify which videos belong to me vs. others
**As a** Director,
**I want to** clearly distinguish my own generated videos from other users' videos,
**so that** I can quickly find my own work in the shared history.

**Acceptance Criteria:**
- [ ] "Your Videos" tab is filtered by the current user's browser cookie
- [ ] "All Videos" tab shows all users' videos including each video's cookie ID
- [ ] Cookie Debug panel shows the current user's cookie UUID for reference

---

### US-12 — Refresh the video history list
**As a** Director,
**I want to** manually refresh the video history,
**so that** I can check if a video I just submitted has finished generating.

**Acceptance Criteria:**
- [ ] A refresh button is available on the History page
- [ ] Clicking it reloads the video list without a full page refresh
- [ ] Newly completed videos appear after refresh

---

## Epic 4: App Navigation & Identity

### US-13 — Navigate between app sections
**As a** any user,
**I want to** navigate between Studio, Stock Footage, and History from any page,
**so that** I can switch between workflows without losing context.

**Acceptance Criteria:**
- [ ] Header navigation links are always visible: Studio, Stock Footage, History
- [ ] Clicking each link routes to the corresponding page
- [ ] The app logo/title links back to the home (Studio) page
- [ ] Current section is identifiable from the active nav state

---

### US-14 — Use the app without logging in
**As a** Director,
**I want to** generate videos and view history without creating an account,
**so that** I can use the tool immediately with zero friction.

**Acceptance Criteria:**
- [ ] No login, registration, or authentication is required
- [ ] User identity is established automatically via a browser-scoped UUID cookie
- [ ] "Your Videos" history persists across browser sessions as long as the cookie is intact

---

## Story Map Summary

| Epic | Stories | Priority |
|---|---|---|
| Direct Video Generation (Studio) | US-01 to US-05 | High |
| Script-Based Shot Generation (Stock Footage) | US-06 to US-08 | High |
| Video History & Review | US-09 to US-12 | Medium |
| App Navigation & Identity | US-13 to US-14 | Medium |
